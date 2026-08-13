import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create account — Subscription Tracker",
};

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return <RegisterForm />;
}
