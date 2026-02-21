"use client";

interface StatusOrbProps {
    isSpeaking: boolean;
}

export default function StatusOrb({ isSpeaking }: StatusOrbProps) {
    return (
        <div className="flex items-center gap-3">
            {/* Orb */}
            <div className="relative flex h-3 w-3 items-center justify-center">
                {/* Pulse ring */}
                <div
                    className={`absolute inset-0 animate-ping rounded-full ${isSpeaking ? "bg-amber-400" : "bg-rose-primary"
                        } opacity-40`}
                />
                {/* Core dot */}
                <div
                    className={`relative h-3 w-3 rounded-full ${isSpeaking ? "bg-amber-400" : "bg-rose-primary"
                        }`}
                />
            </div>

            {/* Label */}
            <span
                className={`text-sm font-medium ${isSpeaking ? "text-amber-400" : "text-rose-primary"
                    }`}
            >
                {isSpeaking ? "Speaking" : "Listening"}
            </span>
        </div>
    );
}
