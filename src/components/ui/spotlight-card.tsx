"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Drop-in replacement for `Card` that renders a soft glow which follows the
 * cursor while hovered. Visual shell mirrors `Card` exactly; only the
 * cursor-tracking overlay is new.
 */
export function SpotlightCard({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  const ref = React.useRef<HTMLDivElement>(null);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    ref.current!.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    ref.current!.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      data-slot="card"
      data-size={size}
      onMouseMove={handleMouseMove}
      className={cn(
        "group/spotlight relative flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] transition-shadow duration-300 hover:shadow-lg hover:ring-foreground/20 data-[size=sm]:[--card-spacing:--spacing(3)]",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/spotlight:opacity-100"
        style={{
          background:
            "radial-gradient(360px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in oklch, var(--primary) 14%, transparent), transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}
