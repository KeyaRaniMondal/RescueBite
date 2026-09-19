"use client";

import {
  ArrowRight,
  Clock,
  HeartHandshake,
  Leaf,
  MapPin,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "12,400+", label: "Meals rescued" },
  { value: "850+", label: "Food providers" },
  { value: "30+", label: "Cities served" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient background accents */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-16 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-28">
        {/* Copy */}
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Leaf className="size-3.5" />
            Fight food waste, one meal at a time
          </span>

          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            No good food <span className="text-primary">left behind</span>.
          </h1>

          <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            RescueBite connects restaurants, bakeries, and grocery stores with
            neighbors who can use their surplus — freshly made, close by, and
            completely free.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/browse" />}>
              Find surplus food
              <ArrowRight />
            </Button>
            <Button
              variant="outline"
              size="lg"
              render={<Link href="/register" />}
            >
              Donate surplus food
            </Button>
          </div>

          <dl className="grid w-full max-w-md grid-cols-3 gap-4 border-t border-border pt-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                  {stat.value}
                </dd>
                <dd className="text-xs text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Visual */}
        <div className="relative flex items-center justify-center py-8">
          <div
            aria-hidden
            className="absolute size-72 rounded-md bg-primary/10 blur-2xl"
          />

          <div className="relative w-full max-w-sm">
            {/* Floating badge: meals shared */}
            <div className="absolute -top-6 -right-3 z-10 flex items-center gap-2 border border-border bg-background px-3 py-2 shadow-sm sm:-right-6">
              <HeartHandshake className="size-4 text-primary" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  2,500+ meals
                </p>
                <p className="text-[10px] text-muted-foreground">
                  shared this month
                </p>
              </div>
            </div>

            {/* Mock food listing card */}
            <div className="overflow-hidden bg-card ring-1 ring-foreground/10">
              <div className="flex h-36 items-center justify-center bg-gradient-to-br from-primary/90 to-primary/60">
                <UtensilsCrossed className="size-14 text-primary-foreground" />
              </div>
              <div className="grid gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Bakery · Surplus
                    </p>
                    <h3 className="font-heading text-base font-semibold text-foreground">
                      Fresh pastries &amp; bread boxes
                    </h3>
                  </div>
                  <span className="bg-primary/10 px-2 py-1 text-[10px] font-semibold tracking-wide text-primary uppercase">
                    Available
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    Downtown · 2.4 km away
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    Pickup by 6:00 PM
                  </span>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  render={<Link href="/browse" />}
                >
                  Reserve pickup
                  <ArrowRight />
                </Button>
              </div>
            </div>

            {/* Floating chip: provider */}
            <div className="absolute -bottom-6 -left-3 z-10 flex items-center gap-2 border border-border bg-background px-3 py-2 shadow-sm sm:-left-6">
              <ShieldCheck className="size-4 text-primary" />
              <p className="text-xs font-medium text-foreground">
                Daily Crumb Bakery
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
