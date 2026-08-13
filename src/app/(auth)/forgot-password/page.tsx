import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Reset password — Subscription Tracker",
};

export default async function ForgotPasswordPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return <ForgotPasswordForm />;
}
