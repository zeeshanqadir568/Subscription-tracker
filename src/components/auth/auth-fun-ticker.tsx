"use client";

import { useEffect, useState } from "react";

const FACTS = [
  "💸 The average person forgets about $340/yr in subscriptions.",
  "⚡ Adding a subscription takes about 10 seconds.",
  "🔔 We'll nudge you 7 and 30 days before a renewal hits.",
  "📊 Your real monthly burn rate — no spreadsheet required.",
];

export function AuthFunTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((i) => (i + 1) % FACTS.length);
    }, 4000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <p
      key={index}
      className="animate-in fade-in slide-in-from-bottom-1 mt-6 text-center text-xs text-muted-foreground duration-500"
    >
      {FACTS[index]}
    </p>
  );
}
