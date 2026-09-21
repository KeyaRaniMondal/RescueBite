"use client";

import { Menu, UtensilsCrossed, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse Food" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/browse", label: "Key Features" },
  { href: "/about", label: "Service" },
  { href: "/contact", label: "Testimonial" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-20 px-6 pt-5 lg:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-wide text-amber-400">
          <UtensilsCrossed aria-hidden className="size-5" />
          RescueBite
        </Link>

        <nav
          className="hidden items-center gap-8 text-sm font-medium text-white/90 lg:flex"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-amber-400",
                pathname === link.href && "text-amber-400",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          <button className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0f3d2e] transition-transform hover:scale-105">
          <span aria-hidden>🛒</span>
          Cart
        </button>
          <Link
            href="/login"
            className="rounded-full border border-white/20 px-3.5 py-2 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-white/10"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-amber-400 px-3.5 py-2 text-xs font-semibold tracking-widest text-[#0f3d2e] uppercase shadow-lg shadow-amber-400/20 transition-transform hover:scale-105"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsOpen((open) => !open)}
          className="rounded-full p-2 text-white transition-colors hover:bg-white/10 lg:hidden"
        >
          {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {isOpen && (
        <nav
          className="mx-auto mt-4 max-w-7xl rounded-2xl border border-white/10 bg-[#0f3d2e]/95 p-3 shadow-xl backdrop-blur lg:hidden"
          aria-label="Mobile navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block rounded-xl px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10",
                pathname === link.href && "text-amber-400",
              )}
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-2 flex gap-2 border-t border-white/10 pt-3">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-xl border border-white/20 px-4 py-2.5 text-center text-xs font-semibold tracking-widest text-white uppercase hover:bg-white/10"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-xl bg-amber-400 px-4 py-2.5 text-center text-xs font-semibold tracking-widest text-[#0f3d2e] uppercase hover:scale-[1.02]"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}