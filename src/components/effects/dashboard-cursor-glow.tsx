"use client";

import { useEffect, useRef } from "react";

/**
 * Large, dark radial glow that trails the cursor across the dashboard —
 * adds depth behind the cards without competing with them for attention.
 * Position is lerped via rAF (not React state), same technique as
 * CursorGlow, and is skipped on touch/coarse pointers and reduced motion.
 */
export function DashboardCursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = glowRef.current;
    if (!el) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    let currentX = targetX;
    let currentY = targetY;
    let visible = false;
    let frame = 0;

    function handlePointerMove(e: PointerEvent) {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        visible = true;
        el!.style.opacity = "1";
      }
    }

    function handlePointerLeave() {
      visible = false;
      el!.style.opacity = "0";
    }

    function tick() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      el!.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      frame = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    document.addEventListener("pointerleave", handlePointerLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 -z-10 opacity-0 transition-opacity duration-700"
      style={{
        width: 900,
        height: 900,
        marginLeft: -450,
        marginTop: -450,
        background:
          "radial-gradient(circle, color-mix(in oklch, #0b0e1a 55%, transparent) 0%, color-mix(in oklch, #14182b 30%, transparent) 32%, transparent 68%)",
        willChange: "transform",
      }}
    />
  );
}
