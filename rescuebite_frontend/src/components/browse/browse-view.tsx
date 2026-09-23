"use client";

import { Loader2, MapPin, Package, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, getErrorMessage } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

export type FoodListing = {
  id: string;
  providerId: string;
  foodName: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  pickupLocation: string;
  pickupStartTime: string;
  pickupEndTime: string;
  expiryTime: string;
  images: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
};

type ListingsResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: FoodListing[];
};

const CATEGORIES = [
  "ALL",
  "BAKERY",
  "GROCERY",
  "PRODUCE",
  "DAIRY",
  "MEAT",
  "PREPARED_MEAL",
  "BEVERAGE",
  "OTHER",
] as const;

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: "bg-primary/10 text-primary",
  PARTIALLY_RESERVED: "bg-brand-amber/10 text-brand-amber",
  FULLY_RESERVED: "bg-brand-deep/10 text-brand-deep",
  DRAFT: "bg-muted text-muted-foreground",
  EXPIRED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-destructive/10 text-destructive",
};

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function BrowseView() {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("ALL");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reloadKey + filters intentionally re-run the fetch.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      if (!getAccessToken()) {
        setNeedsAuth(true);
        setListings([]);
        setLoading(false);
        return;
      }
      setNeedsAuth(false);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (category !== "ALL") params.set("category", category);
        const query = params.toString() ? `?${params.toString()}` : "";
        const response = (await api(
          `/food-listings${query}`,
        )) as ListingsResponse;
        if (cancelled) return;
        setListings(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        if (cancelled) return;
        const message = getErrorMessage(err);
        if (
          /authentication required|invalid or expired token|unauthorized/i.test(
            message,
          )
        ) {
          setNeedsAuth(true);
          setListings([]);
        } else {
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, category, reloadKey]);

  const visibleListings = useMemo(() => listings, [listings]);

  return (
    <div className="flex flex-1 flex-col">
      <section className="bg-brand-deep text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-amber uppercase">
            Marketplace
          </p>
          <h1 className="font-heading mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            All surplus food
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/70 sm:text-base">
            Every listing from local providers — fresh, rescuable, and ready for
            pickup.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/50" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, description, or pickup location..."
                aria-label="Search food listings"
                className="border-white/15 bg-white/10 pl-9 text-white placeholder:text-white/50"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="browse-category" className="sr-only">
                Filter by category
              </Label>
              <select
                id="browse-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="h-8 w-full rounded-none border border-white/15 bg-white/10 px-2.5 text-xs text-white outline-none focus-visible:border-ring"
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item} className="text-foreground">
                    {item === "ALL" ? "All categories" : formatLabel(item)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && needsAuth && (
          <div className="flex justify-center">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>Sign in to browse food</CardTitle>
                <CardDescription>
                  The marketplace is available to signed-in members. Sign in to
                  see all surplus food near you.
                </CardDescription>
              </CardHeader>
              <CardFooter className="gap-2">
                <Button size="lg" render={<Link href="/login" />}>
                  Sign in
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  render={<Link href="/register" />}
                >
                  Create account
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {!loading && !needsAuth && error && (
          <div className="flex justify-center">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>Something went wrong</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardFooter className="justify-end">
                <Button onClick={() => setReloadKey((key) => key + 1)}>
                  Try again
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {!loading && !needsAuth && !error && visibleListings.length === 0 && (
          <div className="flex justify-center">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>No food found</CardTitle>
                <CardDescription>
                  {debouncedSearch || category !== "ALL"
                    ? "Try a different search or category."
                    : "No surplus food has been shared yet. Check back soon."}
                </CardDescription>
              </CardHeader>
              {(debouncedSearch || category !== "ALL") && (
                <CardFooter className="justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setCategory("ALL");
                    }}
                  >
                    Clear filters
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        )}

        {!loading && !needsAuth && !error && visibleListings.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleListings.map((item) => (
              <Card key={item.id} className="flex w-full flex-col">
                <div className="flex h-40 items-center justify-center overflow-hidden bg-muted">
                  {item.images?.[0] ? (
                    // biome-ignore lint/performance/noImgElement: backend returns remote URLs; next/image remote config not set up.
                    <img
                      src={item.images[0]}
                      alt={item.foodName}
                      className="size-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Package className="size-10 text-muted-foreground" />
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1">
                      {item.foodName}
                    </CardTitle>
                    <span
                      className={cn(
                        "shrink-0 rounded-sm px-2 py-1 text-[10px] font-semibold tracking-wide uppercase",
                        STATUS_STYLES[item.status] ??
                          "bg-muted text-muted-foreground",
                      )}
                    >
                      {formatLabel(item.status)}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-1 text-xs text-muted-foreground">
                  <p>
                    {formatLabel(item.category)} · {item.quantity} {item.unit} ·{" "}
                    ৳{item.price}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="truncate">{item.pickupLocation}</span>
                  </p>
                </CardContent>
                <CardFooter className="mt-auto justify-end">
                  <Button render={<Link href={`/browse/${item.id}`} />}>
                    View details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
