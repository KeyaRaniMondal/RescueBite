"use client";

import Image from "next/image";
import Link from "next/link";

type Photo = {
  src: string;
  alt: string;
  rotate: string; // tailwind rotate class
  lift: string; // tailwind translate-y class for the up/down stagger
};

// Swap these src values for your own dish photography.
// Using placeholder images for now so the layout is easy to preview.
const photos: Photo[] = [
  {
    src: "https://picsum.photos/seed/wolfood-1/420/560",
    alt: "Character-shaped bento plate with vegetables",
    rotate: "-rotate-6",
    lift: "translate-y-6",
  },
  {
    src: "https://picsum.photos/seed/wolfood-2/420/560",
    alt: "Spicy noodle bowl with a cute rice garnish",
    rotate: "rotate-3",
    lift: "-translate-y-4",
  },
  {
    src: "https://picsum.photos/seed/wolfood-3/420/560",
    alt: "Customer smiling with a delivered meal",
    rotate: "-rotate-2",
    lift: "translate-y-2",
  },
  {
    src: "https://picsum.photos/seed/wolfood-4/420/560",
    alt: "Diced fresh vegetables and meat prepped in a bowl",
    rotate: "rotate-3",
    lift: "-translate-y-6",
  },
  {
    src: "https://picsum.photos/seed/wolfood-5/420/560",
    alt: "Decorative bento box with rice character shapes",
    rotate: "-rotate-6",
    lift: "translate-y-4",
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0f3d2e] pb-28 pt-6">
      {/* faint background wolf-head watermark, purely decorative */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-0 h-[560px] w-[560px] rounded-full bg-white/[0.03] blur-3xl"
      />

      <div className="relative mx-auto mt-14 flex max-w-3xl flex-col items-center px-6 text-center">
        <div className="mb-6 flex items-center gap-3 text-sm text-white/80">
          <span className="flex -space-x-2">
            <span className="h-6 w-6 rounded-full border-2 border-[#0f3d2e] bg-amber-300" />
            <span className="h-6 w-6 rounded-full border-2 border-[#0f3d2e] bg-rose-300" />
            <span className="h-6 w-6 rounded-full border-2 border-[#0f3d2e] bg-sky-300" />
          </span>
          Loved by 2.4m Customers With 4.8 Rating
        </div>

        <h1 className="text-4xl font-extrabold leading-tight text-[#fbf6ec] sm:text-5xl lg:text-6xl">
          Fresh, Delicious &amp; Delivered To Your Door!
        </h1>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/browse"
            className="rounded-full bg-amber-400 px-7 py-3.5 text-sm font-semibold text-[#0f3d2e] shadow-lg shadow-amber-400/20 transition-transform hover:scale-105"
          >
            Shop Now
          </Link>
          <Link
            href="/browse"
            className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#0f3d2e] transition-transform hover:scale-105"
          >
            Explore Menu
          </Link>
        </div>
      </div>

      {/* staggered photo strip */}
      <div className="relative mx-auto mt-16 flex max-w-6xl justify-center gap-4 px-6">
        {photos.map((photo) => (
          <div
            key={photo.src}
            className={`relative hidden h-56 w-40 flex-shrink-0 overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10 sm:block sm:h-64 sm:w-44 md:h-72 md:w-48 ${photo.rotate} ${photo.lift}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="200px"
              className="object-cover"
            />
          </div>
        ))}
        {/* mobile fallback: just show one photo, centered */}
        <div className="relative h-64 w-48 overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10 sm:hidden">
          <Image
            src={photos[0].src}
            alt={photos[0].alt}
            fill
            sizes="200px"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
