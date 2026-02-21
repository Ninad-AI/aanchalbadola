import Image from "next/image";

interface IdleHeroProps {
    onStartSession: () => void;
}

export default function IdleHero({ onStartSession }: IdleHeroProps) {
    return (
        <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a0f1c] via-[#2a1128] to-[#121124]">

            {/* Navbar removed as requested */}

            {/* Background Aesthetic Shapes */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen opacity-70">
                <div className="absolute top-[10%] -left-[10%] h-[800px] w-[800px] rounded-full bg-rose-primary/10 blur-[130px]" />
                <div className="absolute top-[15%] right-[20%] h-[150px] w-[150px] rounded-full bg-[#3d4263] opacity-40 blur-[5px] mix-blend-normal z-0" />
            </div>

            {/* Exactly similar 2-column center alignment */}
            <div className="container relative z-10 mx-auto px-6 lg:px-20 flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">

                {/* Text Content (Left) */}
                <div className="flex flex-col items-start gap-8">
                    <div className="animate-fade-in-up">
                        <span className="flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-[#f08598] uppercase">
                            <span className="text-[#f08598] font-black scale-150 mb-1">&bull;</span> ACTOR & ANCHOR
                        </span>
                    </div>

                    <h1 className="animate-fade-in-up text-[5.5rem] sm:text-8xl lg:text-[9rem] font-bold tracking-tight leading-[0.9] text-white">
                        Aanchal<br />
                        <span className="text-[#e2dee0]">badaola.</span>
                    </h1>

                    <div className="animate-fade-in-up mt-6">
                        <button
                            onClick={onStartSession}
                            className="group relative overflow-hidden rounded-full bg-white px-10 py-[1.125rem] text-sm font-bold text-black transition-all hover:scale-105 active:scale-95 shadow-[0_5px_40px_rgba(255,255,255,0.2)] focus:outline-none"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                            <span className="relative z-10 flex items-center gap-3 tracking-wide">
                                Start Session <span className="text-xl leading-none transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                            </span>
                        </button>
                    </div>
                </div>

                {/* Portrait (Right) Liquid Blob - Removed mousemove to optimize render */}
                <div className="animate-fade-in-up relative z-10 flex justify-center lg:justify-end">
                    <div className="relative group w-[300px] h-[350px] sm:w-[380px] sm:h-[450px] lg:w-[480px] lg:h-[580px]">

                        {/* Overlapping organic color blobs matching image 3 precisely */}
                        <div className="absolute top-[60%] -left-8 w-[120px] h-[100px] lg:w-[160px] lg:h-[140px] bg-[#8B2E68] opacity-80 mix-blend-screen blur-[10px] z-20 transition-transform duration-1000" style={{ borderRadius: "50% 60% 40% 70% / 60% 50% 70% 40%" }} />
                        <div className="absolute top-[60%] -left-8 w-[120px] h-[100px] lg:w-[160px] lg:h-[140px] bg-[#8B2E68] opacity-60 mix-blend-color blur-[10px] z-20 transition-transform duration-1000" style={{ borderRadius: "50% 60% 40% 70% / 60% 50% 70% 40%" }} />

                        {/* Top right floating circle matching image 3 */}
                        <div className="absolute -top-10 -right-4 w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] bg-white/5 border border-white/5 rounded-full backdrop-blur-sm z-0" />

                        <div
                            className="relative w-full h-full overflow-hidden bg-dark-surface shadow-[0_30px_60px_rgba(0,0,0,0.5)] transition-all duration-700 group-hover:scale-[1.02]"
                            style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
                        >
                            <Image
                                src="/aanchalbadola.jpg"
                                alt="Aanchal Badaola"
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 640px) 280px, (max-width: 768px) 350px, 450px"
                                quality={90}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
