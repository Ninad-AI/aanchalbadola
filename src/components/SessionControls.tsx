import React from 'react';

export default function SessionControls() {
    return (
        <div className="flex items-center justify-center gap-8 mb-16 relative z-20">
            {/* Rewind */}
            <button className="group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-[1px] border-white/30 text-white/90 hover:bg-white/10 transition-all duration-300">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-[22px] h-[22px] -mt-1 group-hover:-rotate-45 transition-transform duration-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 10H8.5a4.5 4.5 0 0 0 0 9H10m-3.5-5.5L4 10l2.5-3.5" />
                </svg>
                <span className="absolute text-[9px] font-medium tracking-wide mt-2">10</span>
            </button>

            {/* Play/Pause */}
            <button className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full flex items-center justify-center border-2 border-white/95 hover:bg-white/10 hover:scale-105 transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.1)]">
                <div className="flex gap-[5px] sm:gap-1.5 ml-0.5">
                    <div className="w-[3px] sm:w-[3px] h-[22px] sm:h-[26px] rounded-sm bg-white/95" />
                    <div className="w-[3px] sm:w-[3px] h-[22px] sm:h-[26px] rounded-sm bg-white/95" />
                </div>
            </button>

            {/* Forward */}
            <button className="group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-[1px] border-white/30 text-white/90 hover:bg-white/10 transition-all duration-300">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-[22px] h-[22px] -mt-1 group-hover:rotate-45 transition-transform duration-500" style={{ transform: 'scaleX(-1)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 10H8.5a4.5 4.5 0 0 0 0 9H10m-3.5-5.5L4 10l2.5-3.5" />
                </svg>
                <span className="absolute text-[9px] font-medium tracking-wide mt-2">10</span>
            </button>
        </div>
    );
}
