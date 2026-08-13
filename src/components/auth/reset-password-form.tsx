"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { TiltCard } from "@/components/effects/tilt-card";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

const CARD_SPACING = { "--card-spacing": "1.375rem" } as React.CSSProperties;

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  async function onSubmit(values: ResetPasswordInput) {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await response.json();

      if (!response.ok) {
        if (body?.error?.code === "INVALID_TOKEN") {
          setError("password", { message: "" });
        }
        toast.error(body?.error?.message ?? "Something went wrong");
        return;
      }

      setDone(true);
      toast.success("Password updated");
      window.setTimeout(() => router.push("/login"), 1200);
    } catch (error) {
      console.error("Reset password request failed:", error);
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
          <CardHeader>
            <CardTitle className="text-2xl">
              {done ? "Password updated" : "Set a new password"}
            </CardTitle>
            <CardDescription className="text-[0.95rem]">
              {done
                ? "Redirecting you to sign in…"
                : "Choose a new password for your account."}
            </CardDescription>
          </CardHeader>
          {!done && (
            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
                noValidate
              >
                <input type="hidden" {...register("token")} />
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">New password</Label>
                  <PasswordInput
                    id="password"
                    autoComplete="new-password"
                    className="h-11 rounded-lg text-base"
                    {...register("password")}
                  />
                  {errors.password?.message && (
                    <p className="text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 h-12 rounded-lg text-base font-semibold"
                >
                  {isSubmitting ? "Updating..." : "Update password"}
                </Button>
              </form>
              <p className="mt-5 text-center text-sm text-muted-foreground">
                <Link
                  href="/forgot-password"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Request a new link
                </Link>
              </p>
            </CardContent>
          )}
        </Card>
      </TiltCard>
    </div>
  );
}
