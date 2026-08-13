import {
  Coins,
  CreditCard,
  DollarSign,
  PiggyBank,
  TrendingUp,
} from "lucide-react";

const GLYPHS = [
  { Icon: DollarSign, left: "6%", size: 22, duration: 26, delay: -4, opacity: 0.1 },
  { Icon: Coins, left: "18%", size: 18, duration: 32, delay: -14, opacity: 0.08 },
  { Icon: TrendingUp, left: "32%", size: 20, duration: 22, delay: -8, opacity: 0.09 },
  { Icon: DollarSign, left: "48%", size: 16, duration: 28, delay: -20, opacity: 0.07 },
  { Icon: CreditCard, left: "64%", size: 20, duration: 24, delay: -2, opacity: 0.08 },
  { Icon: PiggyBank, left: "78%", size: 22, duration: 34, delay: -18, opacity: 0.09 },
  { Icon: DollarSign, left: "90%", size: 18, duration: 20, delay: -10, opacity: 0.07 },
] as const;

/**
 * Ultra-faint, money-themed particles drifting upward behind dashboard
 * content — pure CSS keyframes, no JS, so it costs nothing at runtime and
 * never competes with foreground content for attention.
 */
export function FinanceAmbient() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {GLYPHS.map(({ Icon, left, size, duration, delay, opacity }, index) => (
        <Icon
          key={index}
          className="animate-coin-rise absolute bottom-0 text-foreground"
          style={
            {
              left,
              width: size,
              height: size,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              "--coin-opacity": opacity,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
