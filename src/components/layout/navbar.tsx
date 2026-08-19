"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/layout/logo";

export function Navbar() {
  const { data: session, status } = useSession();

  const userInitial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : session?.user?.email
      ? session.user.email.charAt(0).toUpperCase()
      : "U";

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2.5 text-base font-bold tracking-tight transition-transform active:scale-95"
        >
          <Logo size="sm" />
          <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Subscription Tracker
          </span>
        </Link>

        {status === "authenticated" && (
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              Live Sync
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative flex items-center gap-2 rounded-full px-2 py-1 hover:bg-accent/60 focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-xs font-semibold text-primary-foreground shadow-sm ring-2 ring-background">
                    {userInitial}
                  </div>
                  <span className="hidden text-sm font-medium text-foreground sm:inline-block">
                    {session.user?.name || session.user?.email?.split("@")[0]}
                  </span>
                  <ChevronDown className="size-3.5 text-muted-foreground opacity-75" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-1.5">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-foreground">
                      {session.user?.name || "User Account"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 size-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}

