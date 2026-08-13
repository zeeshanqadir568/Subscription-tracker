import type { ReactNode } from "react";
import { AuthFunTicker } from "@/components/auth/auth-fun-ticker";
import { AuthMarketingPanel } from "@/components/auth/auth-marketing-panel";
import { AnimatedBackground } from "@/components/effects/animated-background";
import { AuthSceneBackdrop } from "@/components/effects/auth-scene-backdrop";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative grid flex-1 lg:grid-cols-2">
      <AnimatedBackground variant="subtle" />
      <AuthMarketingPanel />
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4 pt-24 sm:p-8 sm:pt-28">
        <AuthSceneBackdrop />
        <div className="relative z-10 flex w-full flex-col items-center">
          {children}
          <AuthFunTicker />
        </div>
      </div>

      {/* Brand title, centered on the full page so it straddles the
          blue/white seam on lg+ screens. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center pt-5 sm:pt-7">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-card/95 px-5 py-2.5 shadow-2xl shadow-primary/10 ring-1 ring-border backdrop-blur-md sm:gap-4 sm:px-7 sm:py-3.5">
          <Logo size="lg" glow />
          <span className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Subscription Tracker
          </span>
        </div>
      </div>
    </div>
  );
}
