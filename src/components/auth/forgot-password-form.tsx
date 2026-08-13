"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TiltCard } from "@/components/effects/tilt-card";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";

const CARD_SPACING = { "--card-spacing": "1.375rem" } as React.CSSProperties;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordInput) {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const body = await response.json();
        toast.error(body?.error?.message ?? "Something went wrong");
        return;
      }
      setSent(true);
    } catch (error) {
      console.error("Forgot password request failed:", error);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 flex w-full max-w-md flex-col items-center gap-6 duration-500">
      <TiltCard className="w-full">
        <Card
          style={CARD_SPACING}
          className="w-full ring-1 ring-primary/10 shadow-2xl shadow-primary/10"
        >
          {sent ? (
            <>
              <CardHeader>
                <span className="mb-1 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#9085e9] text-white shadow-lg shadow-primary/20">
                  <MailCheck className="size-5" />
                </span>
                <CardTitle className="text-2xl">Check your email</CardTitle>
                <CardDescription className="text-[0.95rem]">
                  If an account exists for that address, a reset link is on
                  its way. It expires in 1 hour.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-sm text-muted-foreground">
                  <Link
                    href="/login"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Back to sign in
                  </Link>
                </p>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Reset your password
                </CardTitle>
                <CardDescription className="text-[0.95rem]">
                  Enter your email and we&apos;ll send you a link to set a
                  new password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-5"
                  noValidate
                >
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className="h-11 rounded-lg text-base"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 h-12 rounded-lg text-base font-semibold"
                  >
                    {isSubmitting ? "Sending..." : "Send reset link"}
                  </Button>
                </form>
                <p className="mt-5 text-center text-sm text-muted-foreground">
                  <Link
                    href="/login"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Back to sign in
                  </Link>
                </p>
              </CardContent>
            </>
          )}
        </Card>
      </TiltCard>
    </div>
  );
}
