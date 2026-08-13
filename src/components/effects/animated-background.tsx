const ORB_COLORS = {
  blue: "#2a78d6",
  orange: "#eb6834",
  pink: "#e87ba4",
} as const;

/**
 * Ambient, always-moving backdrop: a few blurred gradient orbs drifting on
 * pure CSS keyframes (no JS, so it costs nothing at runtime) plus an
 * optional faint panning grid. Purely decorative — sits behind content at
 * -z-10 and never intercepts pointer events.
 */
export function AnimatedBackground({
  variant = "subtle",
}: {
  variant?: "subtle" | "vivid";
}) {
  const isVivid = variant === "vivid";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute inset-0 animate-grid-pan"
        style={{
          opacity: isVivid ? 0.12 : 0.05,
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, black, transparent)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, black, transparent)",
        }}
      />

      <div
        className="animate-drift-a absolute -top-32 -right-24 rounded-full blur-3xl"
        style={{
          width: isVivid ? 420 : 320,
          height: isVivid ? 420 : 320,
          background: ORB_COLORS.blue,
          opacity: isVivid ? 0.28 : 0.14,
        }}
      />
      <div
        className="animate-drift-b absolute -bottom-32 -left-16 rounded-full blur-3xl"
        style={{
          width: isVivid ? 380 : 280,
          height: isVivid ? 380 : 280,
          background: ORB_COLORS.pink,
          opacity: isVivid ? 0.2 : 0.1,
        }}
      />
      <div
        className="animate-drift-c absolute top-1/2 left-1/2 rounded-full blur-3xl"
        style={{
          width: isVivid ? 340 : 260,
          height: isVivid ? 340 : 260,
          background: ORB_COLORS.orange,
          opacity: isVivid ? 0.14 : 0.07,
        }}
      />
    </div>
  );
}
