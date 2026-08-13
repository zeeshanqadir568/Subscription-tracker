import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in — Subscription Tracker",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const githubEnabled = Boolean(
    process.env.GITHUB_ID && process.env.GITHUB_SECRET,
  );

  return <LoginForm githubEnabled={githubEnabled} />;
}
