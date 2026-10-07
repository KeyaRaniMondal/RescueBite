"use client";

import {
  Activity,
  BadgeCheck,
  Mail,
  ReceiptText,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  initialsOf,
  type ReceiverProfile,
} from "@/components/receiver/use-receiver";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "My Activity", icon: Activity },
  { href: "/dashboard/profile", label: "Profile & Settings", icon: UserRound },
  { href: "/dashboard/payments", label: "Payments", icon: ReceiptText },
];

export function DashboardHero({
  profile,
  children,
}: {
  profile: ReceiverProfile;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const avatarSrc = profile.imageUrl || null;

  return (
    <div className="flex flex-1 flex-col">
      <section className="bg-brand-deep text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-lg font-bold">
                {avatarSrc ? (
                  // biome-ignore lint/performance/noImgElement: backend returns remote URLs; next/image remote config not set up.
                  <img
                    src={avatarSrc}
                    alt={`${profile.name}'s profile`}
                    className="size-full object-cover"
                  />
                ) : (
                  initialsOf(profile.name)
                )}
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-brand-amber uppercase">
                  My dashboard
                </p>
                <h1 className="font-heading mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  Welcome back, {profile.name}
                </h1>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white/70">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    {profile.email}
                  </span>
                  {profile.emailVerified && (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                      <BadgeCheck className="size-3" />
                      Verified
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-brand-amber text-brand-deep hover:bg-brand-amber/90"
              render={<Link href="/browse" />}
            >
              Browse food
            </Button>
          </div>
          <nav
            aria-label="Dashboard sections"
            className="mt-6 flex flex-wrap gap-2"
          >
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "bg-brand-amber text-brand-deep"
                      : "border border-white/20 text-white hover:bg-white/10",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
