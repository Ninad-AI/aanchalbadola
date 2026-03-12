import React from 'react';

interface ProgressArcProps {
    progress: number; // 0.0 to 1.0
    startLabel: string;
    endLabel: string;
}

export default function ProgressArc({ progress, startLabel, endLabel }: ProgressArcProps) {
    const size = 320;
    const cx = size / 2;
    const cy = size / 2 - 40; // Shift up so the downward arc sits nicely centered
    const r = 145;
    const strokeWidth = 2.5;

    // Angle: from left to right dipping down
    const path = `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`;
    const pathLength = Math.PI * r;

    const safeProgress = Math.max(0, Math.min(1, progress || 0));
    const strokeDashoffset = pathLength - (safeProgress * pathLength);

    const knobX = cx - r * Math.cos(Math.PI * safeProgress);
    const knobY = cy + r * Math.sin(Math.PI * safeProgress); // + to move downwards

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[320px] h-[320px] z-20">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible drop-shadow-md">
                {/* Background Track */}
                <path
                    d={path}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
                {/* Progress Arc */}
                <path
                    d={path}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={pathLength}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-linear drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                />
                {/* Knob */}
                {progress > 0 && (
                    <circle
                        cx={knobX}
                        cy={knobY}
                        r="7"
                        fill="#ffffff"
                        className="transition-all duration-1000 ease-linear drop-shadow-[0_0_12px_rgba(255,255,255,1)]"
                    />
                )}
            </svg>
            {/* Labels */}
            <div
                className="absolute transition-opacity duration-500 flex justify-end"
                style={{ width: 44, left: cx - r - 48, top: cy - 8 }}
            >
                <span className="text-[11px] text-white font-medium tracking-wide drop-shadow-md">{startLabel}</span>
            </div>
            <div
                className="absolute transition-opacity duration-500 flex justify-start"
                style={{ width: 44, left: cx + r + 4, top: cy - 8 }}
            >
                <span className="text-[11px] text-white/60 font-medium tracking-wide drop-shadow-md">{endLabel}</span>
            </div>
        </div>
    );
}
