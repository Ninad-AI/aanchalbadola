"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface ActiveChatProps {
    onSessionEnd: () => void;
    durationSeconds?: number;
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function ActiveChat({
    onSessionEnd,
    durationSeconds = 60,
}: ActiveChatProps) {
    const [timeLeft, setTimeLeft] = useState(durationSeconds);

    // Countdown timer only, no redundant state toggles
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onSessionEnd();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onSessionEnd]);

    return (
        <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a0f1c] via-[#2a1128] to-[#121124]">

            {/* Top Navigation - Optional branding */}
            <div className="absolute top-8 left-0 right-0 flex justify-center w-full z-40 p-4">
                <div className="flex flex-col items-center gap-1">
                    <h2 className="text-xl font-bold tracking-widest text-[#a19e9f] uppercase hidden">
                        Aanchal Badaola
                    </h2>
                </div>
            </div>

            {/* Massive Background Gradients surrounding avatar */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden mix-blend-screen opacity-80">
                <div className="absolute h-[800px] w-[800px] rounded-full blur-[150px] bg-indigo-secondary/30" />
            </div>

            {/* Progress line */}
            <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-white/5">
                <div
                    className="h-full transition-all duration-1000 ease-linear bg-indigo-secondary"
                    style={{ width: `${((durationSeconds - timeLeft) / durationSeconds) * 100}%`, boxShadow: "0 0 10px currentColor" }}
                />
            </div>

            {/* Central Avatar Section */}
            <div className="animate-fade-in-up relative z-10 flex flex-col items-center justify-center mt-4">
                <div className="relative flex items-center justify-center">

                    {/* Outer glow ring mimicking the screenshot aura */}
                    <div className="absolute inset-0 opacity-60 blur-3xl mix-blend-screen rounded-full bg-indigo-secondary scale-[1.2]" />

                    {/* Transmitting Rings */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="absolute rounded-full border border-white/20 animate-ping opacity-30 w-[120%] h-[120%]" style={{ animationDuration: '3s' }} />
                        <div className="absolute rounded-full border border-white/20 animate-ping opacity-30 w-[120%] h-[120%]" style={{ animationDuration: '3s', animationDelay: '1.5s' }} />
                    </div>

                    {/* Avatar Perfect Circle Image */}
                    <div className="relative z-10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] h-[260px] w-[260px] sm:h-[320px] sm:w-[320px] md:h-[400px] md:w-[400px] rounded-full">
                        <Image
                            src="/aanchalbadola.jpg"
                            alt="Aanchal Badaola"
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 260px, (max-width: 768px) 320px, 400px"
                            quality={90}
                            priority
                        />
                    </div>

                    {/* Status Pill Badge overlapping bottom right of avatar matching Image 4 */}
                    <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-5 py-2.5 bg-[#1b1525]/90 border border-white/5 rounded-full shadow-2xl backdrop-blur-md">
                        <span className="h-2 w-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e] animate-pulse" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                            SPEAKING
                        </span>
                    </div>
                </div>

                {/* Timer Section exactly aligned below */}
                <div className="mt-16 flex flex-col items-center gap-2 text-center">
                    <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#a19e9f]">
                        TIME LEFT
                    </p>
                    <div className="text-5xl md:text-6xl font-medium text-white tabular-nums tracking-wider drop-shadow-md">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Chevron Button beneath Timer */}
                <div className="mt-10 flex flex-col items-center">
                    <button
                        onClick={onSessionEnd}
                        className="group relative flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-xl transition-all duration-300 hover:bg-rose-500/20 hover:border-rose-500/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:scale-105 active:scale-95 focus:outline-none"
                        aria-label="End Link"
                    >
                        <svg
                            className="h-7 w-7 text-[#a19e9f] transition-all duration-300 group-hover:text-rose-400 group-hover:translate-y-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
