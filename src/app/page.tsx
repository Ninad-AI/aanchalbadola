"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShinyButton } from "@/components/ui/ShinyButton";
import { ArrowRight, X } from "lucide-react";

type FlowState = "idle" | "auth" | "payment" | "active";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function Home() {

  const router = useRouter();

  const [flowState, setFlowState] = useState<FlowState>("idle");
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const mousePosRef = useRef({ x: 0, y: 0 });
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const avatarRefs = useRef<(HTMLDivElement | null)[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const creatorName = "Aanchal Badola";
  const creatorImage = "/aanchalbadola.jpg";
  const creatorRole = "Influencer & Multisport Athlete";

  const TIME_OPTIONS_INR = [
    { minutes: 0.5, price: 49, label: "30 Seconds" },
    { minutes: 15, price: 299, label: "15 Minutes" },
    { minutes: 20, price: 399, label: "20 Minutes" },
    { minutes: 30, price: 599, label: "30 Minutes" },
    { minutes: 60, price: 999, label: "60 Minutes" },
  ];

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 100);

    const handleMouseMove = (e: MouseEvent) => {
      mouseTargetRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      };
    };

    let animationFrameId: number;
    const animate = () => {
      // Smooth linear interpolation (lerp)
      mousePosRef.current.x += (mouseTargetRef.current.x - mousePosRef.current.x) * 0.1;
      mousePosRef.current.y += (mouseTargetRef.current.y - mousePosRef.current.y) * 0.1;

      // Apply GPU-accelerated transforms directly to DOM elements avoiding React renders
      avatarRefs.current.forEach((el, index) => {
        if (el) {
          const multiplier = index === 0 ? 0.5 : -1;
          el.style.transform = `translate3d(${mousePosRef.current.x * multiplier}px, ${mousePosRef.current.y * multiplier}px, 0)`;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      clearTimeout(t);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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

  // Simulate speech activity
  useEffect(() => {
    if (flowState !== "active") return;
    const interval = setInterval(() => {
      if (Math.random() > 0.6) setIsSpeaking(prev => !prev);
    }, 400);
    return () => clearInterval(interval);
  }, [flowState]);

  const handleStartTalking = () => setFlowState("auth");

  const handleSelectTime = (minutes: number) => {
    setSelectedMinutes(minutes);
  };

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

      {/* ===== FLUID BACKGROUND BLOB ===== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-rose-500/20 blur-[100px] animate-blob mix-blend-screen"
          style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-500/20 blur-[100px] animate-blob animation-delay-2000 mix-blend-screen"
          style={{ borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' }}
        />
        <div
          className="absolute top-[30%] left-[40%] w-[50vw] h-[50vw] bg-purple-500/20 blur-[120px] animate-blob animation-delay-4000 mix-blend-screen"
          style={{ borderRadius: '50% 50% 20% 80% / 25% 80% 20% 75%' }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
      </div>

      {/* ===== CONTENT CONTAINER ===== */}
      <div
        className={`
          relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-8
          transition-all duration-1000 ease-out 
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        `}
      >
        {flowState === "active" ? (
          /* === ACTIVE INTERFACE (Organic / Floating) === */
          <div className="w-full h-full flex flex-col items-center justify-center">

            {/* Fluid Avatar Container */}
            <div className="relative w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] mb-10 sm:mb-12">
              {/* Animated Border Blob */}
              <div
                className={`absolute inset-[-20px] bg-gradient-to-r from-rose-500 to-indigo-500 opacity-30 blur-xl transition-all duration-500 ${isSpeaking ? 'scale-110' : 'scale-100'}`}
                style={{
                  borderRadius: isSpeaking ? '60% 40% 30% 70% / 60% 30% 70% 40%' : '40% 60% 70% 30% / 50% 60% 30% 60%',
                  animation: 'morph 8s ease-in-out infinite'
                }}
              />



              {/* Avatar Mask */}
              <div
                ref={(el) => { avatarRefs.current[0] = el; }}
                className="relative w-full h-full overflow-hidden shadow-2xl transition-all duration-1000 will-change-transform"
                style={{
                  borderRadius: '50% 50% 50% 50% / 50% 50% 50% 50%',
                  animation: 'morph 12s ease-in-out infinite alternate'
                }}
              >
                <Image
                  src={creatorImage}
                  alt={creatorName}
                  fill
                  className="object-cover scale-110"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
              </div>

              {/* Status Indicator (Floating Orb) */}
              <div className="absolute -bottom-4 -right-4 bg-black/40 backdrop-blur-xl border border-white/10 px-4 sm:px-6 py-2 sm:py-3 rounded-full flex items-center gap-2 sm:gap-3 shadow-lg">
                <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-rose-400'}`} />
                <span className="text-xs font-bold tracking-widest uppercase text-white/90">
                  {isSpeaking ? "Speaking" : "Listening..."}
                </span>
              </div>
            </div>

            {/* Minimal Controls */}
            <div className="flex items-center gap-6 sm:gap-8">
              <div className="text-center">
                <div className="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest mb-1">Time Left</div>
                <div className="text-3xl sm:text-4xl font-light tabular-nums tracking-tighter">{formatTime(timeLeft)}</div>
              </div>

              <button
                onClick={handleEndCall}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-400 transition-all duration-300 group"
                aria-label="End call"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:rotate-90" />
              </button>
            </div>

          </div>
        ) : (
          /* === IDLE STATE (Asymmetric / Editorial) === */
          <div className="relative w-full max-w-6xl mx-auto min-h-[80vh] flex flex-col md:flex-row items-center justify-center md:justify-between gap-8 md:gap-12 px-4 sm:px-8">

            {/* Left: Text Content */}
            <div className="relative z-20 flex flex-col items-center md:items-start text-center md:text-left">
              <h2 className="text-[10px] sm:text-sm md:text-base text-rose-300 font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-3 sm:mb-4 animate-fade-in-up">
                • {creatorRole}
              </h2>
              <br />
              <h1 className="text-[3.2rem] sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mix-blend-exclusion">
                <span className="block">Aanchal</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">badola.</span>
              </h1>
              <br /> 
              <br />

              <div className="animate-fade-in-up mt-6 sm:mt-8 shrink-0 w-full sm:w-auto hover:scale-105 transition-transform duration-500">
                <ShinyButton onClick={handleStartTalking} className="w-full sm:w-[220px] h-14 sm:h-16 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]">
                  <span className="text-sm sm:text-base font-bold tracking-wide flex items-center justify-center gap-3 w-full">
                    Start Session <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </ShinyButton>
              </div>
            </div>

            {/* Right: Organic Image Composition */}
            <div className="relative w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] md:w-[500px] md:h-[600px] flex-shrink-0">

              {/* Main Blob Image */}
              <div
                ref={(el) => { avatarRefs.current[1] = el; }}
                className="relative w-full h-full overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-700 will-change-transform"
                style={{
                  borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%'
                }}
              >
                <Image
                  src={creatorImage}
                  alt={creatorName}
                  fill
                  className="object-cover scale-110"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
              </div>

              {/* Floating Decorative Elements */}
              <div
                className="absolute -top-8 -right-8 sm:-top-12 sm:-right-12 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-md border border-white/20 z-20 animate-float"
                style={{ borderRadius: '50% 50% 50% 50% / 50% 50% 50% 50%' }}
              />
              <div
                className="absolute bottom-20 -left-10 sm:-left-16 w-20 h-20 sm:w-32 sm:h-32 bg-rose-500/20 backdrop-blur-md border border-rose-500/20 z-20 animate-float animation-delay-2000"
                style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
              />

            </div>

          </div>
        )}
      </div>

      {/* ===== ORGANIC MODAL ===== */}
      {(flowState === "auth" || flowState === "payment") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-all duration-500"
            onClick={() => setFlowState("idle")}
          />

          <div className="relative w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md animate-fade-in-up">
            <div
              className="relative bg-black/80 backdrop-blur-3xl border border-white/10 p-6 sm:p-8 md:p-12 shadow-2xl"
              style={{ borderRadius: '1.5rem' }}
            >
              {/* Modal Fluid Background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/20 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 blur-[80px] rounded-full pointer-events-none" />

              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl font-black mb-2 text-white">
                  {flowState === "auth" ? "Identification." : "Duration."}
                </h3>
                <p className="text-sm sm:text-base text-white/50 mb-6 sm:mb-8">
                  {flowState === "auth" ? "Choose how you would like to proceed." : "Select your preferred session length."}
                </p>

                {flowState === "auth" && (
                  <div className="w-full animate-fade-in-up">
                    <ShinyButton
                      onClick={() => setFlowState("payment")}
                      className="w-full h-14 text-[15px] font-bold shadow-xl hover:scale-[1.02] transition-all"
                    >
                      <span className="flex w-full h-full items-center justify-center">Continue as Guest</span>
                    </ShinyButton>
                  </div>
                )}

                {flowState === "payment" && (
                  <div className="space-y-4 animate-fade-in-up">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {TIME_OPTIONS_INR.map((opt) => {
                        const isSelected = selectedMinutes === opt.minutes;
                        return (
                          <button
                            key={opt.minutes}
                            onClick={() => handleSelectTime(opt.minutes)}
                            className={`
                              flex flex-col items-center justify-center min-h-[72px] sm:min-h-[80px] p-3 rounded-xl border-2 transition-all duration-300
                              ${isSelected
                                ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-[1.02]"
                                : "bg-transparent text-white/60 border-white/10 hover:border-white/40 hover:scale-[1.01]"
                              }
                            `}
                          >
                            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-1 opacity-80">{opt.minutes < 1 ? '30 sec' : `${opt.minutes} min`}</div>
                            <div className="font-black text-base sm:text-lg leading-none">₹{opt.price}</div>
                          </button>
                        )
                      })}
                    </div>

                    <div className="w-full">
                      <ShinyButton
                        onClick={handlePayAndStart}
                        disabled={!selectedMinutes}
                        className={`w-full h-14 text-[15px] font-bold transition-all duration-500 ${!selectedMinutes ? "opacity-50 grayscale cursor-not-allowed" : "shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:shadow-[0_0_30px_rgba(244,63,94,0.6)] hover:scale-[1.02]"}`}
                      >
                        <span className="flex w-full h-full items-center justify-center">Begin Session</span>
                      </ShinyButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
                @keyframes blob {
                    0% { transform: translate3d(0px, 0px, 0) scale(1); }
                    33% { transform: translate3d(30px, -50px, 0) scale(1.1); }
                    66% { transform: translate3d(-20px, 20px, 0) scale(0.9); }
                    100% { transform: translate3d(0px, 0px, 0) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                    will-change: transform;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @keyframes morph {
                    0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                    50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
                    100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                }
                @keyframes float {
                    0% { transform: translate3d(0px, 0px, 0); }
                    50% { transform: translate3d(0px, -20px, 0); }
                    100% { transform: translate3d(0px, 0px, 0); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                    will-change: transform;
                }
            `}</style>
    </main>
  );
}

