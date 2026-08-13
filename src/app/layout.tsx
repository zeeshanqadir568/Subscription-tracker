import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/layout/auth-session-provider";
import { CursorGlow } from "@/components/effects/cursor-glow";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Subscription Tracker",
    template: "%s · Subscription Tracker",
  },
  description:
    "Track recurring SaaS and cloud subscriptions, monitor your burn rate, and never miss a renewal.",
  keywords: [
    "subscription tracker",
    "subscription management",
    "recurring billing",
    "burn rate",
    "SaaS spend",
  ],
  openGraph: {
    title: "Subscription Tracker",
    description:
      "Track recurring SaaS and cloud subscriptions, monitor your burn rate, and never miss a renewal.",
    url: siteUrl,
    siteName: "Subscription Tracker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subscription Tracker",
    description:
      "Track recurring SaaS and cloud subscriptions, monitor your burn rate, and never miss a renewal.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0d" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <AuthSessionProvider>
          <CursorGlow />
          {children}
          <Toaster />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
