"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

type FlowState = "idle" | "auth" | "payment" | "active";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const CREATOR = {
  name: "Aanchal Badola",
  image: "/aanchalbadola.jpg",
  role: "Influencer & Multisport Athlete",
};

const TIME_OPTIONS = [
  { minutes: 0.5, price: 49, label: "30 sec" },
  { minutes: 15, price: 299, label: "15 min" },
  { minutes: 20, price: 399, label: "20 min" },
  { minutes: 30, price: 599, label: "30 min" },
  { minutes: 60, price: 999, label: "60 min" },
];

export default function Home() {
  const [flowState, setFlowState] = useState<FlowState>("idle");
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const mousePosRef = useRef({ x: 0, y: 0 });
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const avatarRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Entrance animation + mouse-follow parallax ── */
  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 100);

    const handleMouseMove = (e: MouseEvent) => {
      mouseTargetRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      };
    };

    let frameId: number;
    const animate = () => {
      mousePosRef.current.x +=
        (mouseTargetRef.current.x - mousePosRef.current.x) * 0.1;
      mousePosRef.current.y +=
        (mouseTargetRef.current.y - mousePosRef.current.y) * 0.1;

      avatarRefs.current.forEach((el, i) => {
        if (!el) return;
        const m = i === 0 ? 0.5 : -1;
        el.style.transform = `translate3d(${mousePosRef.current.x * m}px, ${mousePosRef.current.y * m}px, 0)`;
      });

      frameId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  /* ── Countdown timer ── */
  useEffect(() => {
    if (flowState !== "active" || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setFlowState("idle");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [flowState, timeLeft]);

  /* ── Simulated speech activity ── */
  useEffect(() => {
    if (flowState !== "active") return;
    const interval = setInterval(() => {
      if (Math.random() > 0.6) setIsSpeaking((prev) => !prev);
    }, 400);
    return () => clearInterval(interval);
  }, [flowState]);

  const handleStartTalking = () => setFlowState("auth");
  const handleSelectTime = (minutes: number) => setSelectedMinutes(minutes);

  const handlePayAndStart = () => {
    if (!selectedMinutes) return;
    setTimeLeft(selectedMinutes * 60);
    setFlowState("active");
  };

  const handleEndCall = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setFlowState("idle");
    setTimeLeft(0);
    setSelectedMinutes(null);
  }, []);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0F0F13] text-white font-sans selection:bg-rose-500/30">
      {/* ── Background Blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-rose-500/20 blur-[100px] animate-blob mix-blend-screen"
          style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-500/20 blur-[100px] animate-blob animation-delay-2000 mix-blend-screen"
          style={{ borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }}
        />
        <div
          className="absolute top-[30%] left-[40%] w-[50vw] h-[50vw] bg-purple-500/20 blur-[120px] animate-blob animation-delay-4000 mix-blend-screen"
          style={{ borderRadius: "50% 50% 20% 80% / 25% 80% 20% 75%" }}
        />
      </div>

      {/* ── Content ── */}
      <div
        className={`
          relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-8
          transition-all duration-1000 ease-out
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        `}
      >
        {flowState === "active" ? (
          /* ── Active Call Interface (Minimal Redesign) ── */
          <div className="w-full h-screen fixed inset-0 z-40 bg-[#0F0F13] flex flex-col items-center justify-center">
            {/* Ambient Background Glow for Active Call */}
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ${isSpeaking ? "opacity-100" : "opacity-40"}`}
            >
              <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-rose-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen" />
            </div>

            {/* Absolute Top Right End Call Button (Page Corner) */}
            <button
              onClick={handleEndCall}
              className="fixed top-6 right-6 sm:top-10 sm:right-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors duration-300 z-50 backdrop-blur-md"
              aria-label="End call"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 sm:w-6 sm:h-6 text-white/80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Central Minimal Avatar */}
            <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
              {/* Subtle Breathing Avatar */}
              <div className="relative mb-12 sm:mb-16">
                {/* Voice reactive glow */}
                <div
                  className={`absolute inset-[-10px] rounded-full bg-white/20 blur-xl transition-all duration-300 ease-out
                    ${isSpeaking ? "scale-110 opacity-60" : "scale-90 opacity-0"}
                  `}
                />

                <div
                  ref={(el) => {
                    avatarRefs.current[0] = el;
                  }}
                  className={`relative w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] rounded-full overflow-hidden shadow-2xl ring-1 ring-white/10 transition-transform duration-[2000ms]
                    ${isSpeaking ? "scale-105" : "scale-100"}
                  `}
                >
                  <Image
                    src={CREATOR.image}
                    alt={CREATOR.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              </div>

              {/* Minimal Text Status & Timer */}
              <div className="text-center">
                <h3 className="text-2xl sm:text-3xl font-light text-white tracking-wide mb-2">
                  {CREATOR.name}
                </h3>

                <div className="flex items-center justify-center gap-2 mb-8">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? "bg-green-400 animate-pulse" : "bg-white/30"}`}
                  />
                  <span className="text-xs sm:text-sm text-white/50 uppercase tracking-[0.2em] font-medium">
                    {isSpeaking ? "Speaking" : "Connected"}
                  </span>
                </div>

                {/* Elegant Minimal Timer */}
                <div className="inline-block px-6 py-2 sm:px-8 sm:py-3 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                  <span className="text-3xl sm:text-4xl font-extralight tabular-nums tracking-tighter text-white">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── Idle Hero ── */
          <div className="relative w-full max-w-6xl mx-auto min-h-[80vh] flex flex-col md:flex-row items-center justify-center md:justify-between gap-8 md:gap-12 px-4 sm:px-8">
            {/* Text Content */}
            <div className="relative z-20 flex flex-col items-center md:items-start text-center md:text-left">
              <h2 className="text-[10px] sm:text-sm md:text-base text-rose-300 font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-3 sm:mb-4 animate-fade-in-up">
                • {CREATOR.role}
              </h2>
              <br />

              <h1 className="text-[3.2rem] sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mix-blend-exclusion">
                <span className="block">Aanchal</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                  badola.
                </span>
              </h1>
              <br />
              <br />

              {/* Desktop CTA */}
              <div className="animate-fade-in-up mt-6 sm:mt-8 shrink-0 hidden md:block w-full sm:w-auto">
                <button
                  onClick={handleStartTalking}
                  className="group relative inline-flex items-center justify-center rounded-full bg-white text-black font-bold text-sm sm:text-base tracking-wide w-full sm:w-[220px] h-14 sm:h-16 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-3">
                    Start Session
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="relative w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] md:w-[500px] md:h-[600px] flex-shrink-0">
              <div
                ref={(el) => {
                  avatarRefs.current[1] = el;
                }}
                className="relative w-full h-full overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-700 will-change-transform"
                style={{ borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }}
              >
                <Image
                  src={CREATOR.image}
                  alt={CREATOR.name}
                  fill
                  className="object-cover scale-110"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
              </div>

              {/* Floating Decorative Elements */}
              <div
                className="absolute -top-8 -right-8 sm:-top-12 sm:-right-12 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-md border border-white/20 z-20 animate-float"
                style={{ borderRadius: "50% 50% 50% 50% / 50% 50% 50% 50%" }}
              />
              <div
                className="absolute bottom-20 -left-10 sm:-left-16 w-20 h-20 sm:w-32 sm:h-32 bg-rose-500/20 backdrop-blur-md border border-rose-500/20 z-20 animate-float animation-delay-2000"
                style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
              />
            </div>

            {/* Mobile CTA */}
            <div className="animate-fade-in-up mt-8 md:hidden w-full flex justify-center z-30">
              <button
                onClick={handleStartTalking}
                className="group relative inline-flex items-center justify-center rounded-full bg-white text-black font-bold text-sm tracking-wide w-[200px] h-14 sm:h-16 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-3 w-full">
                  Start Session
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Auth / Payment Modal ── */}
      {(flowState === "auth" || flowState === "payment") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-all duration-500"
            onClick={() => setFlowState("idle")}
          />

          <div className="relative w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md animate-fade-in-up">
            <div
              className={`relative bg-black/80 backdrop-blur-3xl border border-white/10 px-6 sm:px-8 shadow-2xl flex flex-col justify-center ${flowState === "payment" ? "p-6 sm:p-8 md:p-10 min-h-[400px] sm:min-h-[440px]" : "py-10 sm:py-12 md:py-14 min-h-[180px] sm:min-h-[220px]"}`}
              style={{ borderRadius: "1.5rem" }}
            >
              {/* Modal Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/20 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 blur-[80px] rounded-full pointer-events-none" />

              <div className="relative z-10 flex flex-col h-full grow justify-start items-center">
                <div className="w-full max-w-[340px] flex flex-col grow">
                  <div className="w-full text-left">
                    {flowState === "auth" ? (
                      <br />
                    ) : (
                      <>
                        <br />
                        <br />
                      </>
                    )}
                    <h3 className="text-3xl sm:text-[34px] font-black mb-1 sm:mb-2 text-white tracking-tight">
                      {flowState === "auth" ? "Identification." : "Duration."}
                    </h3>
                    <p className="text-[15px] sm:text-[16px] text-[#A1A1A1] mb-8 font-medium">
                      {flowState === "auth"
                        ? "Choose how you would like to proceed."
                        : "Select your preferred session length."}
                    </p>
                    <br />
                  </div>

                  {/* Auth Step */}
                  {flowState === "auth" && (
                    <div className="w-full animate-fade-in-up flex justify-center mt-3 sm:mt-4">
                      <button
                        onClick={() => setFlowState("payment")}
                        className="w-full h-14 sm:h-16 rounded-3xl bg-white text-black text-[16px] sm:text-[18px] font-extrabold shadow-xl hover:scale-[1.02] transition-all duration-300 mx-auto"
                      >
                        Continue as Guest
                      </button>
                    </div>
                  )}

                  {/* Payment Step */}
                  {flowState === "payment" && (
                    <div className="w-full animate-fade-in-up flex flex-col grow">
                      {/* Duration Grid */}
                      <div className="grid grid-cols-3 gap-x-4 gap-y-4 mt-4 mb-10">
                        {TIME_OPTIONS.map((opt, index) => {
                          const isSelected = selectedMinutes === opt.minutes;

                          return (
                            <button
                              key={opt.minutes}
                              onClick={() => handleSelectTime(opt.minutes)}
                              className={`
              h-[78px] rounded-2xl border transition-all duration-300
              flex flex-col items-center justify-center
              ${
                isSelected
                  ? "border-white bg-white/10 text-white shadow-lg"
                  : "border-white/20 bg-white/[0.02] text-white/70 hover:border-white/50"
              }
              ${index === 3 ? "col-span-1" : ""}
              ${index === 4 ? "col-span-2" : ""}
            `}
                            >
                              <span className="text-xs uppercase tracking-wider font-semibold mb-1">
                                {opt.label.toUpperCase()}
                              </span>
                              <span className="text-base font-bold">
                                ₹{opt.price}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <br />
                      {/* Begin Button */}
                      <div className="w-full flex justify-center mt-auto mb-2">
                        <button
                          onClick={handlePayAndStart}
                          disabled={!selectedMinutes}
                          className={`
          w-[90%] sm:w-[320px] h-[64px] rounded-2xl font-semibold text-lg transition-all duration-500
          ${
            selectedMinutes
              ? "bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white shadow-[0_10px_40px_rgba(255,80,80,0.35)] hover:scale-[1.02]"
              : "bg-white/10 text-white/30 border border-white/10 cursor-not-allowed"
          }
        `}
                        >
                          Begin Session
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
