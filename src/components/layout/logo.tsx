import { CircleDollarSign, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { box: "size-8", icon: "size-4", badge: "size-3.5", badgeIcon: "size-2.5" },
  default: { box: "size-9", icon: "size-4.5", badge: "size-4", badgeIcon: "size-2.5" },
  lg: { box: "size-16", icon: "size-8", badge: "size-6", badgeIcon: "size-3.5" },
} as const;

export function Logo({
  size = "default",
  glow = false,
  className,
}: {
  size?: keyof typeof SIZES;
  glow?: boolean;
  className?: string;
}) {
  const s = SIZES[size];

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {glow && (
        <span
          aria-hidden
          className="absolute inset-0 -z-10 scale-150 rounded-full bg-primary/30 blur-xl"
        />
      )}
      <span
        className={cn(
          "flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-[#6c5ce7] to-[#e87ba4] text-white shadow-lg shadow-primary/25 ring-1 ring-white/20",
          s.box,
        )}
      >
        <Wallet className={s.icon} strokeWidth={2.25} />
      </span>
      <span
        className={cn(
          "absolute -right-1 -bottom-1 flex items-center justify-center rounded-full bg-card text-primary ring-2 ring-background",
          s.badge,
        )}
      >
        <CircleDollarSign className={s.badgeIcon} strokeWidth={2.5} />
      </span>
    </span>
  );
}
