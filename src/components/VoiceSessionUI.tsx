'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Ripple from './ui/ripple';

interface VoiceSessionUIProps {
    isSpeaking: boolean;
    micLevel: number;
    callPhase: 'connecting' | 'listening' | 'speaking';
    timeLeft: number;
    totalTime: number;
    onEndCall: () => void;
    creatorName: string;
    creatorImage: string;
}

/** Returns layout dimensions tuned to the current viewport width. */
function getLayout(vw: number) {
    if (vw < 360) {
        // Very small phones (SE 1st gen, Galaxy A series low-end)
        return { ringSize: 220, imgSize: 166, circleGap: 44, numCircles: 7 };
    }
    if (vw < 480) {
        // Standard mobile (iPhone 14, Pixel, Galaxy S)
        return { ringSize: 250, imgSize: 190, circleGap: 50, numCircles: 7 };
    }
    if (vw < 768) {
        // Large phones / small tablets in portrait
        return { ringSize: 270, imgSize: 206, circleGap: 56, numCircles: 8 };
    }
    // Tablets and desktops — give the ripples more room to breathe
    return { ringSize: 300, imgSize: 228, circleGap: 70, numCircles: 9 };
}

export default function VoiceSessionUI({
    isSpeaking,
    callPhase,
    timeLeft,
    totalTime,
    onEndCall,
    creatorName,
}: VoiceSessionUIProps) {
    const [isPlaying, setIsPlaying] = useState(true);

    // Responsive layout — recalculate on window resize (orientation changes etc.)
    const [layout, setLayout] = useState(() =>
        typeof window !== 'undefined'
            ? getLayout(window.innerWidth)
            : getLayout(375) // SSR fallback: assume a standard phone
    );

    useEffect(() => {
        function onResize() {
            setLayout(getLayout(window.innerWidth));
        }
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const { ringSize: RING_SIZE, imgSize: IMG_SIZE, circleGap, numCircles } = layout;

    // Progress ring geometry
    const cx = RING_SIZE / 2;
    const cy = RING_SIZE / 2;
    const radius = IMG_SIZE / 2 + 10; // small gap between image edge and ring
    const circumference = 2 * Math.PI * radius;
    const progress = totalTime > 0 ? timeLeft / totalTime : 0;
    const dashOffset = circumference * (1 - progress);

    const formatTime = (s: number) => {
        const t = Math.max(0, s);
        const m = Math.floor(t / 60);
        const sec = t % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    const statusDotColor =
        callPhase === 'connecting'
            ? { ping: 'bg-amber-400', dot: 'bg-amber-500' }
            : { ping: 'bg-rose-400', dot: 'bg-rose-500' };

    return (
        <Ripple
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            color="rgba(255, 255, 255, 0.18)"
            mainCircleSize={IMG_SIZE}
            mainCircleOpacity={0.22}
            numCircles={numCircles}
            circleGap={circleGap}
        >
            {/* Close button */}
            <div className="fixed right-4 top-4 z-[100] sm:right-8 sm:top-8">
                <button
                    onClick={onEndCall}
                    title="End Session"
                    className="group p-2 transition-all"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 shadow-xl backdrop-blur-md transition-all group-hover:border-red-500/60 group-hover:bg-red-500/40 sm:h-12 sm:w-12">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-white/70 transition-all duration-300 group-hover:rotate-90 group-hover:text-white sm:h-6 sm:w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </button>
            </div>

            {/* Main layout — image stays at true viewport center so ripples align */}
            <div className="relative flex h-full w-full items-center justify-center">
                <div
                    className="relative flex items-center justify-center"
                    style={{ width: RING_SIZE, height: RING_SIZE }}
                >
                    {/* Progress ring SVG */}
                    <svg
                        className="absolute inset-0 -rotate-90 overflow-visible"
                        width={RING_SIZE}
                        height={RING_SIZE}
                    >
                        <circle
                            cx={cx}
                            cy={cy}
                            r={radius}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="3"
                            fill="transparent"
                        />
                        <circle
                            cx={cx}
                            cy={cy}
                            r={radius}
                            stroke="rgba(255,255,255,0.85)"
                            strokeWidth="3"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                        />
                    </svg>

                    {/* Influencer image */}
                    <div
                        className="relative overflow-hidden rounded-full border-2 border-white/10 bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                        style={{ width: IMG_SIZE, height: IMG_SIZE }}
                    >
                        <Image
                            src="/aanchalbadola.jpg"
                            alt={creatorName}
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Speaking overlay */}
                        <div
                            className={`absolute inset-0 bg-rose-500/20 transition-opacity duration-700 ${isSpeaking ? 'opacity-30' : 'opacity-0'}`}
                        />
                    </div>

                    {/* Controls — positioned below the circle */}
                    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 flex-col items-center gap-6 sm:gap-8"
                        style={{ marginTop: IMG_SIZE / 2 + 24 }}
                    >
                        {/* Timer */}
                        <span className="tabular-nums text-4xl font-extralight tracking-tight text-white/95 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] sm:text-5xl md:text-6xl">
                            {formatTime(timeLeft)}
                        </span>

                        {/* Status */}
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${statusDotColor.ping}`} />
                                <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${statusDotColor.dot}`} />
                            </span>
                            <span className="text-[11px] font-light uppercase tracking-[0.6em] text-white/40">
                                {callPhase}
                            </span>
                        </div>

                        {/* Play / Pause */}
                        <button
                            onClick={() => setIsPlaying(p => !p)}
                            className="group flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/20 bg-white/5 shadow-xl backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10 sm:h-16 sm:w-16 md:h-20 md:w-20"
                        >
                            {isPlaying ? (
                                <div className="flex gap-1.5">
                                    <div className="h-5 w-1.5 rounded-full bg-white/80 transition-colors group-hover:bg-white sm:h-6 md:h-7" />
                                    <div className="h-5 w-1.5 rounded-full bg-white/80 transition-colors group-hover:bg-white sm:h-6 md:h-7" />
                                </div>
                            ) : (
                                <svg
                                    className="ml-1 h-7 w-7 fill-current text-white/80 transition-colors group-hover:text-white sm:h-8 sm:w-8"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Ripple>
    );
}
