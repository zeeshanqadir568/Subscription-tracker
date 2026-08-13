"use client";

import { useEffect, useRef, useState } from "react";

const CHIPS = [
  { label: "Netflix", price: "$15.99", color: "#e87ba4", top: "10%", left: "8%" },
  { label: "Spotify", price: "$9.99", color: "#1baf7a", top: "22%", left: "78%" },
  { label: "AWS", price: "$42.10", color: "#eda100", top: "78%", left: "12%" },
  { label: "Notion", price: "$8.00", color: "#4a3aa7", top: "68%", left: "82%" },
  { label: "Figma", price: "$12.00", color: "#2a78d6", top: "45%", left: "5%" },
] as const;

const SPARK_COLORS = ["#2a78d6", "#9085e9", "#e87ba4", "#1baf7a", "#eda100"];

interface Spark {
  id: number;
  x: number;
  y: number;
  color: string;
}

/**
 * Decorative scene for the white auth panel: a bold cursor-tracking glow
 * (bounds-checked against this column, not the whole viewport) plus slowly
 * drifting subscription "chips" and a light sparkle trail. All positioning
 * is done via refs/rAF so it never triggers React re-renders except for the
 * short-lived sparkle list.
 */
export function AuthSceneBackdrop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const sparkIdRef = useRef(0);
  const lastSparkRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const container = containerRef.current;
    const glow = glowRef.current;
    if (!container || !glow) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let inside = false;
    let frame = 0;

    function handlePointerMove(e: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      const withinBounds =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!withinBounds) {
        if (inside) {
          inside = false;
          glow!.style.opacity = "0";
        }
        return;
      }

      if (!inside) {
        inside = true;
        glow!.style.opacity = "1";
      }
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;

      const now = performance.now();
      if (now - lastSparkRef.current > 90) {
        lastSparkRef.current = now;
        const id = sparkIdRef.current++;
        const color =
          SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];
        setSparks((prev) => [
          ...prev.slice(-14),
          { id, x: targetX, y: targetY, color },
        ]);
        window.setTimeout(() => {
          setSparks((prev) => prev.filter((s) => s.id !== id));
        }, 800);
      }
    }

    function tick() {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      glow!.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      frame = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        ref={glowRef}
        className="absolute top-0 left-0 opacity-0 transition-opacity duration-500"
        style={{
          width: 620,
          height: 620,
          marginLeft: -310,
          marginTop: -310,
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--primary) 22%, transparent) 0%, color-mix(in oklch, #9085e9 14%, transparent) 35%, transparent 70%)",
          willChange: "transform",
        }}
      />

      {CHIPS.map((chip, index) => (
        <span
          key={chip.label}
          className="animate-chip-float absolute rounded-full border bg-card/80 px-3 py-1.5 text-xs font-medium whitespace-nowrap shadow-md backdrop-blur-sm"
          style={{
            top: chip.top,
            left: chip.left,
            borderColor: `color-mix(in oklch, ${chip.color} 35%, transparent)`,
            animationDelay: `${index * 1.3}s`,
            opacity: 0.85,
          }}
        >
          <span
            aria-hidden
            className="mr-1.5 inline-block size-1.5 rounded-full align-middle"
            style={{ background: chip.color }}
          />
          {chip.label}{" "}
          <span className="text-muted-foreground">{chip.price}</span>
        </span>
      ))}

      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="animate-spark-rise absolute size-1.5 rounded-full"
          style={{
            left: spark.x,
            top: spark.y,
            background: spark.color,
            boxShadow: `0 0 8px ${spark.color}`,
          }}
        />
      ))}
    </div>
  );
}
