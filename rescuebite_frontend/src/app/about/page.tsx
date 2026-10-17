import {
  ArrowRight,
  Clock3,
  HeartHandshake,
  MapPin,
  PackageCheck,
  ShoppingBasket,
  Store,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | RescueBite",
  description:
    "RescueBite helps food providers share surplus listings with people who can reserve and pick them up.",
};

const steps = [
  {
    number: "01",
    icon: Store,
    title: "Providers share what’s available",
    description:
      "Restaurants, bakeries, grocery stores, and other food providers can list surplus items with quantities, prices, and pickup details.",
  },
  {
    number: "02",
    icon: ShoppingBasket,
    title: "Neighbors find a good fit",
    description:
      "Browse by food category, compare listings, and choose the items and quantity that work for you.",
  },
  {
    number: "03",
    icon: PackageCheck,
    title: "Reserve and pick up",
    description:
      "Reserve available food, review its pickup window and location, then collect it directly from the provider.",
  },
];

const values = [
  {
    icon: HeartHandshake,
    title: "A better connection",
    description:
      "Bring food providers and the people who can use their surplus together in one marketplace.",
  },
  {
    icon: Clock3,
    title: "Clear pickup details",
    description:
      "Each listing can include a pickup location, time window, quantity, and expiry time to help you plan.",
  },
  {
    icon: MapPin,
    title: "Rooted in the neighborhood",
    description:
      "Find available food from providers nearby and make your next pickup part of your local routine.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-[#0d3b2e] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-40 size-[28rem] rounded-full bg-white/[0.06] blur-3xl"
        />
        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-amber-300 uppercase">
              About RescueBite
            </p>
            <h1 className="mt-4 max-w-2xl text-balance text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Good food deserves a second chance.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              RescueBite is a marketplace that helps food providers share
              surplus with people ready to rescue it. Discover available food,
              reserve what you need, and pick it up directly from the provider.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/browse"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 text-sm font-bold text-[#0d3b2e] transition-colors hover:bg-amber-300"
              >
                Browse available food
                <ArrowRight aria-hidden className="size-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Join RescueBite
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-sm sm:p-8">
            <p className="text-xs font-semibold tracking-[0.18em] text-amber-300 uppercase">
              The idea is simple
            </p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4 rounded-2xl bg-white/[0.07] p-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
                  <Store aria-hidden className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">Surplus food</p>
                  <p className="mt-1 text-sm text-white/60">
                    Shared by food providers
                  </p>
                </div>
              </div>
              <div className="ml-5 h-5 border-l border-dashed border-white/30" />
              <div className="flex items-center gap-4 rounded-2xl bg-white/[0.07] p-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
                  <ShoppingBasket aria-hidden className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">A neighbor reserves it</p>
                  <p className="mt-1 text-sm text-white/60">
                    With the details they need
                  </p>
                </div>
              </div>
              <div className="ml-5 h-5 border-l border-dashed border-white/30" />
              <div className="flex items-center gap-4 rounded-2xl bg-amber-400 p-4 text-[#0d3b2e]">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#0d3b2e]/10">
                  <PackageCheck aria-hidden className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">Food gets picked up</p>
                  <p className="mt-1 text-sm text-[#0d3b2e]/70">
                    Good food stays in use
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            From surplus to a planned pickup
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            RescueBite makes it straightforward for providers to post what they
            have and for neighbors to find and reserve it.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map(({ number, icon: Icon, title, description }) => (
            <article
              key={number}
              className="rounded-2xl border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="text-sm font-bold tracking-widest text-muted-foreground/60">
                  {number}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-bold text-card-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y bg-muted/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Built around real pickups
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              The details matter.
            </h2>
          </div>
          <div className="mt-9 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {values.map(({ icon: Icon, title, description }) => (
              <article key={title}>
                <Icon aria-hidden className="size-6 text-primary" />
                <h3 className="mt-4 font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col gap-6 rounded-3xl bg-[#0d3b2e] px-6 py-10 text-white sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Be part of a better food cycle.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
              Find food to rescue, or sign up as a provider and share what you
              have available.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/browse"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-amber-400 px-5 text-sm font-bold text-[#0d3b2e] transition-colors hover:bg-amber-300"
            >
              Explore listings
            </Link>
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
