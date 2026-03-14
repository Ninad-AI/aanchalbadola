"use client"

import { cn } from "@/lib/utils"

export interface RippleProps {
  className?: string
  children?: React.ReactNode
  /** Size of the innermost circle in pixels */
  mainCircleSize?: number
  /** Opacity of the innermost circle */
  mainCircleOpacity?: number
  /** Number of concentric circles */
  numCircles?: number
  /** Color of the ripple circles */
  color?: string
  /**
   * Gap (in px) between each successive ring.
   * Smaller values give tighter rings — good for small mobile screens.
   * Defaults to 60 (tuned for sub-480 px screens).
   */
  circleGap?: number
}

export function Ripple({
  className,
  children,
  mainCircleSize = 210,
  mainCircleOpacity = 0.22,
  numCircles = 8,
  color = "rgba(255, 255, 255, 0.8)",
  circleGap = 60,
}: RippleProps) {
  return (
    <div className={cn("fixed inset-0 overflow-hidden bg-transparent", className)}>
      {/* Ripple container — masked so outer rings fade to transparent.
          The mask is wider on large screens (75%) so the ripples feel expansive,
          and tighter on mobile (55%) so they don't clip the UI awkwardly */}
      <div
        className="pointer-events-none absolute inset-0 select-none"
        style={{
          maskImage:
            "radial-gradient(ellipse at center, white 0%, white 30%, transparent 65%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, white 0%, white 30%, transparent 65%)",
        }}
      >
        {Array.from({ length: numCircles }, (_, i) => {
          const size = mainCircleSize + i * circleGap;
          // Opacity decays a little slower so middle rings stay visible on small screens
          const opacity = Math.max(0, mainCircleOpacity - i * 0.025);
          // Stagger: slightly faster pulse for inner rings, slower for outer — feels organic
          const duration = 3.5 + i * 0.2;

          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                opacity,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(1)",
                border: `1px solid ${color}`,
                backgroundColor: `${color.replace(/[\d.]+\)$/, "0.05)")}`,
                boxShadow: `0 0 16px ${color.replace(/[\d.]+\)$/, "0.08)")}`,
                animation: `ripple-pulse ${duration}s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
                willChange: "transform",
              }}
            />
          );
        })}
      </div>

      {/* Inline keyframes — avoids a global stylesheet dependency */}
      <style>{`
        @keyframes ripple-pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(0.92);
          }
        }
      `}</style>

      {/* Content layer */}
      {children && (
        <div className="relative z-10 h-full w-full">{children}</div>
      )}
    </div>
  );
}

export default Ripple;
