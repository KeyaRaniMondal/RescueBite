"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Photo = {
  src: string;
  alt: string;
  cardClass: string;
};

const photos: Photo[] = [
  {
    src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop",
    alt: "Cheesy pizza slice with fresh basil",
    cardClass: "h-52 sm:h-60 lg:h-72 translate-y-6",
  },
  {
    src: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop",
    alt: "Grilled skewers with peppers over flame",
    cardClass: "h-56 sm:h-68 lg:h-80 translate-y-2",
  },
  {
    src: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop",
    alt: "Fresh salad bowl with vegetables",
    cardClass: "h-52 sm:h-64 lg:h-72 -translate-y-2",
  },
  {
    src: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=600&auto=format&fit=crop",
    alt: "Fluffy pancakes with berries and syrup",
    cardClass: "h-56 sm:h-68 lg:h-80 translate-y-2",
  },
  {
    src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop",
    alt: "Colorful vegan buddha bowl",
    cardClass: "h-52 sm:h-60 lg:h-72 translate-y-6",
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0d3b2e]">
      {/* soft decorative swirls */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-24 h-[420px] w-[420px] rounded-full bg-white/[0.04] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-10 h-[420px] w-[420px] rounded-full bg-white/[0.04] blur-3xl"
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pt-10 text-center sm:pt-14">
        {/* social proof badge */}
        <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.07] py-1.5 pl-2 pr-4 backdrop-blur-sm">
          <span className="flex -space-x-2.5">
            <span className="relative h-6 w-6 overflow-hidden rounded-full border-2 border-[#0d3b2e]">
              <Image
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=64&auto=format&fit=crop"
                alt="Customer"
                fill
                sizes="24px"
                className="object-cover"
              />
            </span>
            <span className="relative h-6 w-6 overflow-hidden rounded-full border-2 border-[#0d3b2e]">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=64&auto=format&fit=crop"
                alt="Customer"
                fill
                sizes="24px"
                className="object-cover"
              />
            </span>
            <span className="relative h-6 w-6 overflow-hidden rounded-full border-2 border-[#0d3b2e]">
              <Image
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=64&auto=format&fit=crop"
                alt="Customer"
                fill
                sizes="24px"
                className="object-cover"
              />
            </span>
          </span>
          <span className="text-[11px] font-medium tracking-wide text-white/85 sm:text-xs">
            Loved By 2.4m Customers With 4.8 Rating
          </span>
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        </div>

        {/* headline */}
        <h1 className="mt-6 max-w-3xl text-balance text-4xl font-black uppercase leading-[1.02] tracking-tight text-[#fbf5e9] sm:text-6xl lg:text-7xl">
          Fresh, Delicious &amp; Delivered To Your Door!
        </h1>

        {/* CTAs */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/browse"
            className="rounded-full bg-amber-400 px-7 py-3 text-xs font-bold uppercase tracking-widest text-[#0d3b2e] shadow-lg shadow-amber-400/25 transition-transform hover:scale-105"
          >
            Shop Now
          </Link>
          <Link
            href="/browse"
            className="rounded-full bg-white px-7 py-3 text-xs font-bold uppercase tracking-widest text-[#0d3b2e] transition-transform hover:scale-105"
          >
            Explore Menu
          </Link>
        </div>
      </div>

      {/* food photo strip, cropped at the bottom like the reference */}
      <div className="relative mx-auto mt-12 max-w-6xl px-4 sm:px-6">
        <div className="flex items-start justify-center gap-3 sm:gap-4">
          {photos.map((photo) => (
            <div
              key={photo.src}
              className={`relative w-1/5 min-w-0 flex-shrink-0 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/15 ${photo.cardClass}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 20vw, 200px"
                className="object-cover"
                priority={false}
              />
            </div>
          ))}
        </div>
        {/* fade the cut-off bottom edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0d3b2e] to-transparent"
        />
      </div>
      {/* bottom crop spacer: pulls the strip below the fold edge */}
      <div aria-hidden className="h-2" />
    </section>
  );
}
