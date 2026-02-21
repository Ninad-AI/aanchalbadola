// "use client";

// import { HTMLMotionProps, motion } from "framer-motion";
// import { cn } from "@/lib/utils";
// import React from "react";

// interface ShinyButtonProps extends HTMLMotionProps<"button"> {
//     children: React.ReactNode;
//     className?: string;
// }

// export function ShinyButton({ children, className, ...props }: ShinyButtonProps) {
//     return (
//         <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className={cn(
//                 "group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-6 py-3 font-bold text-black shadow-xl outline-none transition-all shrink-0",
//                 className
//             )}
//             {...props}
//         >
//             <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
//                 <div className="relative h-full w-8 bg-white/40" />
//             </div>
//             <span className="relative z-10 flex items-center justify-center gap-2 text-sm sm:text-base tracking-wide whitespace-nowrap">
//                 {children}
//             </span>
//         </motion.button>
//     );
// }

"use client";

import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface ShinyButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
}

export function ShinyButton({
  children,
  className,
  ...props
}: ShinyButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-6 py-3 font-bold text-black shadow-xl outline-none transition-all duration-300 shrink-0",
        className
      )}
      {...props}
    >
      {/* Shine Sweep */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
        <div className="absolute left-[-40%] top-0 h-full w-1/3 skew-x-[-20deg] bg-white/40 blur-sm transition-all duration-700 group-hover:left-[140%]" />
      </div>

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap">
        {children}
      </span>
    </motion.button>
  );
}