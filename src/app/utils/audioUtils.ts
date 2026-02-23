/**
 * Audio utility functions for recording, VAD, and streaming.
 */

const LOG_PREFIX = "[AudioUtils]";


/* ── Module-level state for simple record/stop API ── */
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

/* ────────────────────────────────────────────────────
 *  Basic Recording
 * ──────────────────────────────────────────────────── */

export interface RecordingHandle {
  mediaRecorder: MediaRecorder;
  audioContext: AudioContext;
  analyser: AnalyserNode;
}

/**
 * Start recording audio from the user's microphone.
 */
export const startRecording = async (): Promise<RecordingHandle> => {
  console.log(`${LOG_PREFIX} startRecording — requesting mic access…`);
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });
  console.log(`${LOG_PREFIX} startRecording — mic stream acquired (tracks: ${stream.getTracks().length})`);

  const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext: AudioContext = new AudioContextCtor();
  console.log(`${LOG_PREFIX} startRecording — AudioContext created (sampleRate: ${audioContext.sampleRate})`);
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);

  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      audioChunks.push(event.data);
      console.log(`${LOG_PREFIX} startRecording — chunk received (size: ${event.data.size} bytes, total chunks: ${audioChunks.length})`);
    }
  };

  mediaRecorder.start();
  console.log(`${LOG_PREFIX} startRecording — MediaRecorder started`);

  return { mediaRecorder, audioContext, analyser };
};

/**
 * Stop recording and return the audio blob.
 */
export const stopRecording = (
  recorder: MediaRecorder | null,
  audioContext: AudioContext | null,
): Promise<Blob | null> => {
  console.log(`${LOG_PREFIX} stopRecording — called (recorder exists: ${!!recorder})`);
  return new Promise((resolve) => {
    if (!recorder) {
      console.warn(`${LOG_PREFIX} stopRecording — no active recorder, resolving null`);
      resolve(null);
      return;
    }

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      console.log(`${LOG_PREFIX} stopRecording — blob created (size: ${audioBlob.size} bytes, chunks: ${audioChunks.length})`);
      audioChunks = [];

      recorder.stream.getTracks().forEach((track) => track.stop());
      console.log(`${LOG_PREFIX} stopRecording — stream tracks stopped`);

      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
        console.log(`${LOG_PREFIX} stopRecording — AudioContext closed`);
      }

      resolve(audioBlob);
    };

    recorder.stop();
    console.log(`${LOG_PREFIX} stopRecording — MediaRecorder.stop() called`);
  });
};

/* ────────────────────────────────────────────────────
 *  Conversion helpers
 * ──────────────────────────────────────────────────── */

/**
 * Convert audio blob to base64 data-URL string.
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  console.log(`${LOG_PREFIX} blobToBase64 — converting blob (size: ${blob.size} bytes, type: ${blob.type})`);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log(`${LOG_PREFIX} blobToBase64 — conversion complete (base64 length: ${(reader.result as string)?.length ?? 0})`);
      resolve(reader.result as string);
    };
    reader.onerror = (err) => {
      console.error(`${LOG_PREFIX} blobToBase64 — FileReader error`, err);
      reject(err);
    };
    reader.readAsDataURL(blob);
  });
};

/* ────────────────────────────────────────────────────
 *  Audio-level analysis
 * ──────────────────────────────────────────────────── */

/**
 * Analyze audio level from analyser node.
 * @returns Normalized audio level 0 – 1.
 */
export const getAudioLevel = (analyser: AnalyserNode | null): number => {
  if (!analyser) return 0;

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);

  const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
  return Math.min(average / 128, 1);
};

/* ────────────────────────────────────────────────────
 *  VAD-based single-utterance recording
 * ──────────────────────────────────────────────────── */

export interface VADOptions {
  maxDurationMs?: number;
  energyThreshold?: number;
  silenceAfterSpeechMs?: number;
  noInputTimeoutMs?: number;
  onAudioLevel?: (level: number) => void;
}

/**
 * Record a single utterance using simple energy-based VAD.
 *
 * - Starts listening immediately
 * - If user speaks → record until trailing silence, then return Blob
 * - If user never speaks for `noInputTimeoutMs` → return null
 */
export const recordUtteranceWithVAD = async ({
  maxDurationMs = 30000,
  energyThreshold = 0.01,
  silenceAfterSpeechMs = 600,
  noInputTimeoutMs = 5000,
  onAudioLevel,
}: VADOptions = {}): Promise<Blob | null> => {
  console.log(`${LOG_PREFIX} VAD — starting (maxDuration: ${maxDurationMs}ms, threshold: ${energyThreshold}, silenceAfter: ${silenceAfterSpeechMs}ms, noInputTimeout: ${noInputTimeoutMs}ms)`);

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });
  console.log(`${LOG_PREFIX} VAD — mic stream acquired`);

  const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext: AudioContext = new AudioContextCtor();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 1024;
  source.connect(analyser);

  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event: BlobEvent) => {
    if (event.data && event.data.size > 0) {
      chunks.push(event.data);
    }
  };
  // Small timeslice so we flush data regularly
  recorder.start(100);
  console.log(`${LOG_PREFIX} VAD — MediaRecorder started (timeslice: 100ms)`);

  const dataArray = new Uint8Array(analyser.fftSize);
  const startTime = performance.now();

  let speechStarted = false;
  let lastSpeechTime: number | null = null;

  let noiseSum = 0;
  let noiseCount = 0;

  return new Promise<Blob | null>((resolve, reject) => {
    const cleanup = () => {
      console.log(`${LOG_PREFIX} VAD — cleanup: stopping tracks & closing AudioContext`);
      try {
        stream.getTracks().forEach((t) => t.stop());
      } catch (_) {
        /* ignore */
      }
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
      }
    };

    const finishWithBlob = () => {
      console.log(`${LOG_PREFIX} VAD — finishing with speech blob (chunks: ${chunks.length})`);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        console.log(`${LOG_PREFIX} VAD — blob created (size: ${blob.size} bytes)`);
        cleanup();
        resolve(blob);
      };
      try {
        recorder.stop();
      } catch (err) {
        console.error(`${LOG_PREFIX} VAD — error stopping recorder`, err);
        cleanup();
        reject(err);
      }
    };

    const finishNoSpeech = () => {
      console.warn(`${LOG_PREFIX} VAD — no speech detected within ${noInputTimeoutMs}ms, finishing with null`);
      try {
        recorder.stop();
      } catch (_) {
        /* ignore */
      }
      cleanup();
      resolve(null);
    };

    const tick = () => {
      const now = performance.now();
      const elapsed = now - startTime;

      analyser.getByteTimeDomainData(dataArray);
      let sumSquares = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const v = (dataArray[i] - 128) / 128; // –1 … 1
        sumSquares += v * v;
      }
      const rms = Math.sqrt(sumSquares / dataArray.length); // 0 … ~1

      if (typeof onAudioLevel === "function") {
        const normalized = Math.min(rms * 8, 1); // boost into 0..1
        onAudioLevel(normalized);
      }

      // Dynamic threshold from first 0.5 s of noise
      if (!speechStarted && elapsed < 500) {
        noiseSum += rms;
        noiseCount += 1;
      }

      let threshold = energyThreshold;
      if (!speechStarted && noiseCount > 0) {
        const estNoise = noiseSum / noiseCount;
        threshold = Math.max(threshold, estNoise * 3.0);
      }

      if (rms >= threshold) {
        if (!speechStarted) {
          console.log(`${LOG_PREFIX} VAD — speech detected (rms: ${rms.toFixed(4)}, threshold: ${threshold.toFixed(4)}, elapsed: ${elapsed.toFixed(0)}ms)`);
        }
        speechStarted = true;
        lastSpeechTime = now;
      }

      // Global "no speech at all" timeout
      if (!speechStarted && elapsed >= noInputTimeoutMs) {
        finishNoSpeech();
        return;
      }

      if (speechStarted) {
        if (rms >= threshold) {
          lastSpeechTime = now;
        }

        const silenceElapsed = now - (lastSpeechTime ?? now);
        if (silenceElapsed >= silenceAfterSpeechMs) {
          console.log(`${LOG_PREFIX} VAD — trailing silence reached (${silenceElapsed.toFixed(0)}ms >= ${silenceAfterSpeechMs}ms)`);
          finishWithBlob();
          return;
        }
        if (elapsed >= maxDurationMs) {
          console.log(`${LOG_PREFIX} VAD — max duration reached (${elapsed.toFixed(0)}ms >= ${maxDurationMs}ms)`);
          finishWithBlob();
          return;
        }
      }

      requestAnimationFrame(tick);
    };

    tick();
  });
};

/* ────────────────────────────────────────────────────
 *  Continuous PCM16 streaming over WebSocket
 * ──────────────────────────────────────────────────── */

export interface StreamingMicHandle {
  stop: () => void;
}

export interface StreamingMicOptions {
  /** RMS energy floor before dynamic calibration (default 0.01) */
  energyThreshold?: number;
  /** Trailing silence in ms before emitting speech_end (default 600) */
  silenceMs?: number;
  /** Called when VAD detects the user started speaking */
  onSpeechStart?: () => void;
  /** Called when VAD detects the user stopped speaking */
  onSpeechEnd?: () => void;
}

/**
 * Start streaming raw PCM16 audio to a WebSocket at 16 kHz in 20 ms frames
 * (320 samples per frame — required for server-side VAD).
 *
 * Built-in energy-based VAD automatically sends JSON
 * `{ "type": "speech_start" }` and `{ "type": "speech_end" }` messages
 * bracketing each utterance. PCM16 frames are streamed continuously.
 */
export const startStreamingMic = async (
  ws: WebSocket,
  onAudioLevel?: (level: number) => void,
  options: StreamingMicOptions = {},
): Promise<StreamingMicHandle> => {
  const {
    energyThreshold = 0.01,
    silenceMs = 600,
    onSpeechStart,
    onSpeechEnd,
  } = options;

  console.log(`${LOG_PREFIX} startStreamingMic — requesting mic for PCM16 streaming… (energyThreshold: ${energyThreshold}, silenceMs: ${silenceMs})`);

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });
  console.log(`${LOG_PREFIX} startStreamingMic — mic stream acquired`);

  const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext: AudioContext = new AudioContextCtor({ sampleRate: 48000 });
  console.log(`${LOG_PREFIX} startStreamingMic — AudioContext created (sampleRate: ${audioContext.sampleRate}, state: ${audioContext.state})`);

  // MUST resume after user gesture
  if (audioContext.state === "suspended") {
    console.log(`${LOG_PREFIX} startStreamingMic — AudioContext suspended, resuming…`);
    await audioContext.resume();
    console.log(`${LOG_PREFIX} startStreamingMic — AudioContext resumed`);
  }

  const source = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(1024, 1, 1);

  // Connect the graph
  source.connect(processor);
  processor.connect(audioContext.destination);
  console.log(`${LOG_PREFIX} startStreamingMic — audio graph connected, streaming PCM16 frames to WebSocket`);

  /* ── VAD state ── */
  let framesSent = 0;
  let isSpeaking = false;
  let lastSpeechTs = 0;         // ms timestamp of last above-threshold frame
  let noiseSum = 0;
  let noiseCount = 0;
  const calibrationMs = 500;    // first 0.5 s used for noise-floor estimation
  const streamStartTime = performance.now();

  processor.onaudioprocess = (event: AudioProcessingEvent) => {
    if (ws.readyState !== WebSocket.OPEN) return;

    const input = event.inputBuffer.getChannelData(0);

    // ── Downsample to 16 kHz ──
    const targetSampleRate = 16000;
    const ratio = audioContext.sampleRate / targetSampleRate;
    const newLength = Math.floor(input.length / ratio);
    const downsampled = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      downsampled[i] = input[Math.floor(i * ratio)];
    }

    // ── Compute RMS energy on downsampled buffer ──
    let energySum = 0;
    for (let i = 0; i < downsampled.length; i++) {
      energySum += downsampled[i] * downsampled[i];
    }
    const rms = Math.sqrt(energySum / downsampled.length);

    // ── Dynamic noise-floor calibration (first 0.5 s) ──
    const elapsed = performance.now() - streamStartTime;
    if (elapsed < calibrationMs) {
      noiseSum += rms;
      noiseCount += 1;
    }

    let threshold = energyThreshold;
    if (noiseCount > 0) {
      const estNoise = noiseSum / noiseCount;
      threshold = Math.max(energyThreshold, estNoise * 3.0);
    }

    // ── VAD decision ──
    const now = performance.now();

    if (rms >= threshold) {
      lastSpeechTs = now;

      if (!isSpeaking) {
        isSpeaking = true;
        ws.send(JSON.stringify({ type: "speech_start" }));
        console.log(`${LOG_PREFIX} startStreamingMic — speech_start sent (rms: ${rms.toFixed(4)}, threshold: ${threshold.toFixed(4)})`);
        if (typeof onSpeechStart === "function") onSpeechStart();
      }
    } else if (isSpeaking) {
      const silenceElapsed = now - lastSpeechTs;
      if (silenceElapsed >= silenceMs) {
        isSpeaking = false;
        ws.send(JSON.stringify({ type: "speech_end" }));
        console.log(`${LOG_PREFIX} startStreamingMic — speech_end sent (silence: ${silenceElapsed.toFixed(0)}ms)`);
        if (typeof onSpeechEnd === "function") onSpeechEnd();
      }
    }

    // ── Float32 → PCM16 ──
    const pcm16 = new Int16Array(downsampled.length);
    for (let i = 0; i < downsampled.length; i++) {
      const s = Math.max(-1, Math.min(1, downsampled[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    // ── 20 ms frame chunking (REQUIRED FOR VAD) ──
    const FRAME_SIZE = 320; // 20 ms @ 16 kHz

    for (let i = 0; i < pcm16.length; i += FRAME_SIZE) {
      const frame = pcm16.slice(i, i + FRAME_SIZE);
      if (frame.length === FRAME_SIZE) {
        ws.send(frame.buffer);
        framesSent++;
      }
    }

    // Log every ~5 seconds (approx 250 process events at 48 kHz / 1024 buffer)
    if (framesSent > 0 && framesSent % 250 === 0) {
      console.log(`${LOG_PREFIX} startStreamingMic — ${framesSent} PCM16 frames sent`);
    }

    // ── Optional audio level callback ──
    if (typeof onAudioLevel === "function") {
      onAudioLevel(Math.min(rms * 8, 1));
    }
  };

  return {
    stop: () => {
      console.log(`${LOG_PREFIX} startStreamingMic — stop() called (total frames sent: ${framesSent})`);
      // If still speaking when stopped, send a final speech_end
      if (isSpeaking && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "speech_end" }));
        console.log(`${LOG_PREFIX} startStreamingMic — final speech_end sent on stop`);
        if (typeof onSpeechEnd === "function") onSpeechEnd();
      }
      processor.disconnect();
      source.disconnect();
      stream.getTracks().forEach((t) => t.stop());
      audioContext.close();
      console.log(`${LOG_PREFIX} startStreamingMic — all resources released`);
    },
  };
};
