import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { AnimatedBackground } from "@/components/effects/animated-background";
import { DashboardCursorGlow } from "@/components/effects/dashboard-cursor-glow";
import { FinanceAmbient } from "@/components/effects/finance-ambient";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-muted/30">
      <AnimatedBackground variant="subtle" />
      <FinanceAmbient />
      <DashboardCursorGlow />
      <Navbar />
      <main className="relative mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
