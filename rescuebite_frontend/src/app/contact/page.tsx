import {
  ArrowRight,
  CreditCard,
  HelpCircle,
  MapPin,
  PackageCheck,
  Store,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact | RescueBite",
  description:
    "Find the right next step for food listings, provider accounts, reservations, and payments on RescueBite.",
};

const helpTopics = [
  {
    icon: PackageCheck,
    title: "A food listing or pickup",
    description:
      "Check the listing for its pickup location and time window before you head out. For questions about a specific item, use the provider and pickup details shown with that listing.",
    href: "/browse",
    action: "Browse food",
  },
  {
    icon: Store,
    title: "Joining as a food provider",
    description:
      "Create an account to get started on RescueBite. You can set up your provider profile and share available surplus with neighbors.",
    href: "/register",
    action: "Create an account",
  },
  {
    icon: CreditCard,
    title: "Your account or reservation",
    description:
      "Sign in to access your RescueBite account and continue to your dashboard for profile, reservation, and payment information.",
    href: "/login",
    action: "Sign in",
  },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-[#0d3b2e] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-28 -top-36 size-[26rem] rounded-full bg-white/[0.06] blur-3xl"
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-amber-300 uppercase">
              Contact &amp; help
            </p>
            <h1 className="mt-4 text-balance text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              How can we help?
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              Whether you’re looking for a pickup, sharing surplus food, or
              managing your account, start with the option that best matches
              your question.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {helpTopics.map(({ icon: Icon, title, description, href, action }) => (
            <article
              key={title}
              className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm sm:p-7"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon aria-hidden className="size-5" />
              </span>
              <h2 className="mt-6 text-lg font-bold text-card-foreground">
                {title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
              <Link
                href={href}
                className="mt-6 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                {action}
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y bg-muted/40">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:px-8">
          <span className="flex size-12 items-center justify-center rounded-xl bg-brand-amber/10 text-brand-amber">
            <HelpCircle aria-hidden className="size-5" />
          </span>
          <div>
            <h2 className="font-bold text-foreground">
              Getting ready for a pickup?
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Confirm the provider’s location and pickup window on the listing,
              and check the details again before you travel.
            </p>
          </div>
          <Link
            href="/browse"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80 lg:justify-self-end"
          >
            <MapPin aria-hidden className="size-4" />
            Find a listing
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="flex flex-col gap-5 rounded-3xl bg-[#0d3b2e] px-6 py-9 text-white sm:px-10 sm:py-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-amber-300 uppercase">
              New to RescueBite?
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Help good food find its next stop.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70 sm:text-base">
              Explore local listings or learn more about how the marketplace
              works.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/browse"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-amber-400 px-5 text-sm font-bold text-[#0d3b2e] transition-colors hover:bg-amber-300"
            >
              Browse food
            </Link>
            <Link
              href="/about"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              About RescueBite
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
