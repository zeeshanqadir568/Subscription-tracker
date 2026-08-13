"use client";

import { useMemo } from "react";

const COLORS = ["#2a78d6", "#9085e9", "#e87ba4", "#1baf7a", "#eda100"];

interface Piece {
  id: number;
  left: number;
  color: string;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
}

// Deterministic pseudo-random source (pure function of `seed`) so the
// piece layout can be computed inside useMemo without relying on the
// impure Math.random during render.
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * One-shot confetti burst. Increment `burst` to fire a new batch — pieces
 * are derived from that value so re-firing never needs imperative setState,
 * and the CSS animation fades pieces to opacity 0 so a stale batch left
 * mounted after unmount-less re-fires stays invisible.
 */
export function ConfettiBurst({ burst }: { burst: number }) {
  const pieces = useMemo<Piece[]>(() => {
    if (burst <= 0) return [];
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return [];
    }

    return Array.from({ length: 36 }, (_, i) => {
      const seed = burst * 1000 + i;
      return {
        id: seed,
        left: seededRandom(seed) * 100,
        color: COLORS[Math.floor(seededRandom(seed + 0.37) * COLORS.length)],
        delay: seededRandom(seed + 0.61) * 0.25,
        duration: 1.3 + seededRandom(seed + 0.89) * 0.6,
        drift: (seededRandom(seed + 1.23) - 0.5) * 120,
        rotate: seededRandom(seed + 1.71) * 540,
      };
    });
  }, [burst]);

  if (pieces.length === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="animate-confetti-fall absolute top-0 block h-2.5 w-1.5 rounded-[1px]"
          style={
            {
              left: `${piece.left}%`,
              background: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              "--confetti-drift": `${piece.drift}px`,
              "--confetti-rotate": `${piece.rotate}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
