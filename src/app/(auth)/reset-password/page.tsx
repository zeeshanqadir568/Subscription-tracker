import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Set new password — Subscription Tracker",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-3 flex w-full max-w-md flex-col items-center gap-6 duration-500">
        <Card className="w-full ring-1 ring-primary/10 shadow-2xl shadow-primary/10">
          <CardHeader>
            <CardTitle className="text-2xl">Invalid reset link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This password reset link is missing its token. Request a new
              one from{" "}
              <Link
                href="/forgot-password"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                the reset password page
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
