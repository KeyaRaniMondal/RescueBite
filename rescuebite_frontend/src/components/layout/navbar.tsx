"use client";

import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingBasket,
  Store,
  User as UserIcon,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { type AuthUser, clearTokens, getStoredUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const MARKETING_LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse Food" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const APP_LINKS = [
  { href: "/provider/dashboard", label: "Dashboard" },
  { href: "/browse", label: "Browse Food" },
];

type NavbarProps = {
  /** "marketing" = public site, full link set. "app" = signed-in shell, app-only links. */
  variant?: "marketing" | "app";
  userName?: string;
};

export function Navbar({ variant = "marketing", userName }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [storedUser, setStoredUser] = useState<AuthUser | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const navLinks = variant === "app" ? APP_LINKS : MARKETING_LINKS;

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname re-syncs navbar after login/logout redirects.
  useEffect(() => {
    setStoredUser(getStoredUser());
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSignOut() {
    clearTokens();
    setStoredUser(null);
    setMenuOpen(false);
    setIsOpen(false);
    router.push("/login");
  }

  const displayName = userName || storedUser?.name || "Account";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const isAuthed = storedUser !== null;
  const dashboardHref =
    storedUser?.role === "PROVIDER"
      ? "/provider/dashboard"
      : storedUser?.role === "RECEIVER"
        ? "/receiver/dashboard"
        : "/";

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0f3d2e] px-6 py-4 lg:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-wide text-amber-400"
        >
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

        <div className="hidden items-center gap-3 lg:flex">
          {variant === "marketing" && (
            <Link
              href="/browse"
              className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#0f3d2e] transition-colors hover:bg-white/90"
            >
              <ShoppingBasket aria-hidden className="size-4" />
              Cart
            </Link>
          )}

          {isAuthed ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-md border border-white/15 py-1.5 pl-1.5 pr-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                <span className="flex size-7 items-center justify-center rounded-sm bg-amber-400 text-xs font-bold text-[#0f3d2e]">
                  {initials}
                </span>
                {displayName}
                <ChevronDown aria-hidden className="size-4 text-white/60" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-white p-1 text-sm text-foreground shadow-lg"
                >
                  <Link
                    href={dashboardHref}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-sm px-3 py-2 hover:bg-muted"
                  >
                    <LayoutDashboard className="size-4 text-muted-foreground" />
                    Dashboard
                  </Link>
                  {storedUser?.role === "PROVIDER" ? (
                    <Link
                      href="/provider/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-sm px-3 py-2 hover:bg-muted"
                    >
                      <Store className="size-4 text-muted-foreground" />
                      Business profile
                    </Link>
                  ) : (
                    <Link
                      href={dashboardHref}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-sm px-3 py-2 hover:bg-muted"
                    >
                      <UserIcon className="size-4 text-muted-foreground" />
                      My profile
                    </Link>
                  )}
                  <div className="my-1 h-px bg-border" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md border border-white/20 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-amber-400 px-3.5 py-2 text-sm font-semibold text-[#0f3d2e] transition-colors hover:bg-amber-300"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsOpen((open) => !open)}
          className="rounded-md p-2 text-white transition-colors hover:bg-white/10 lg:hidden"
        >
          {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {isOpen && (
        <nav
          className="mx-auto mt-4 max-w-7xl rounded-md border border-white/10 bg-[#0f3d2e] p-3 lg:hidden"
          aria-label="Mobile navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block rounded-sm px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10",
                pathname === link.href && "text-amber-400",
              )}
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-2 border-t border-white/10 pt-3">
            {isAuthed ? (
              <div className="grid gap-2">
                <Link
                  href={dashboardHref}
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center gap-2 rounded-sm px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-sm px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-sm border border-white/20 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-white/10"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-sm bg-amber-400 px-4 py-2.5 text-center text-sm font-semibold text-[#0f3d2e]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
