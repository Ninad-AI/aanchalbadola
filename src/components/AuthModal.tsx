"use client";

import { useState } from "react";

interface AuthModalProps {
    onSuccess: () => void;
    onClose: () => void;
}

export default function AuthModal({ onSuccess, onClose }: AuthModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleGuestContinue = () => {
        setIsProcessing(true);
        // Optimize: reduced timeout to 300ms for faster simulated load time
        setTimeout(() => {
            setIsProcessing(false);
            onSuccess();
        }, 300);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={!isProcessing ? onClose : undefined}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500" />

            {/* Smooth Rounded Glass Panel */}
            <div
                className="animate-fade-in-up relative w-full max-w-[380px] overflow-hidden p-8 sm:p-10 bg-gradient-to-br from-[#120a14] to-[#0a050a] border border-white/5 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-transform duration-500"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Subtle internal glow behind content */}
                <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 bg-rose-primary/20 blur-[60px] mix-blend-screen" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 bg-indigo-secondary/10 blur-[60px] mix-blend-screen" />

                {/* Content matching Image 1 */}
                <div className="relative z-10 flex flex-col items-start gap-6">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-1">
                            Identification.
                        </h2>
                        <p className="text-sm leading-relaxed text-[#a19e9f] font-medium">
                            Choose how you would like to proceed.
                        </p>
                    </div>

                    {/* Guest Button */}
                    <div className="flex w-full flex-col gap-4 mt-8">
                        <button
                            onClick={handleGuestContinue}
                            disabled={isProcessing}
                            className="group relative w-full overflow-hidden bg-white px-6 py-[1.125rem] rounded-full transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-70 shadow-[0_5px_30px_rgba(255,255,255,0.2)] focus:outline-none flex items-center justify-center"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-[&:not(:disabled):hover]:translate-x-full transition-transform duration-1000 ease-in-out" />
                            {isProcessing ? (
                                <span className="relative z-10 flex items-center gap-3 font-bold text-black tracking-wide text-[15px]">
                                    <span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" /> Authenticating...
                                </span>
                            ) : (
                                <span className="relative z-10 text-[15px] font-bold text-black tracking-wide">
                                    Continue as Guest
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
