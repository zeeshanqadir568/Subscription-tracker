"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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
import { PasswordInput } from "@/components/ui/password-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfettiBurst } from "@/components/effects/confetti-burst";
import { TiltCard } from "@/components/effects/tilt-card";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

const CARD_SPACING = { "--card-spacing": "1.375rem" } as React.CSSProperties;

export function RegisterForm() {
  const router = useRouter();
  const [burst, setBurst] = useState(0);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterInput) {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await response.json();

      if (!response.ok) {
        if (body?.error?.code === "EMAIL_TAKEN") {
          setError("email", {
            message: "Already registered — sign in instead.",
          });
          toast.error("You already have an account with this email", {
            action: {
              label: "Sign in",
              onClick: () => router.push("/login"),
            },
          });
          return;
        }
        if (body?.error?.fields) {
          for (const [field, message] of Object.entries<string>(
            body.error.fields,
          )) {
            if (field in values) {
              setError(field as keyof RegisterInput, { message });
            }
          }
        }
        toast.error(body?.error?.message ?? "Registration failed");
        return;
      }

      const signInResult = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error("Account created. Please sign in.");
        router.push("/login");
        return;
      }

      toast.success("Account created — welcome aboard!");
      setBurst((b) => b + 1);
      window.setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 550);
    } catch (error) {
      console.error("Registration request failed:", error);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 flex w-full max-w-md flex-col items-center gap-6 duration-500">
      <ConfettiBurst burst={burst} />

      <TiltCard className="w-full">
        <Card
          style={CARD_SPACING}
          className="w-full ring-1 ring-primary/10 shadow-2xl shadow-primary/10"
        >
          <CardHeader>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription className="text-[0.95rem]">
              Free to use. Takes about a minute to get your first
              subscription tracked.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
              noValidate
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  className="h-11 rounded-lg text-base"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  className="h-11 rounded-lg text-base"
                  {...register("password")}
                />
                {errors.password && (
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
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </TiltCard>
    </div>
  );
}
