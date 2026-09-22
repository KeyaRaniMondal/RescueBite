"use client";

import {
  BadgeCheck,
  Clock,
  Leaf,
  Loader2,
  MapPin,
  Package,
  Phone,
  Plus,
  Store,
  TicketCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BUSINESS_TYPE_LABELS,
  type ProviderProfile,
} from "@/components/provider/provider-profile-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, getErrorMessage } from "@/lib/api";
import { clearTokens, getAccessToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

type FoodListing = {
  id: string;
  foodName: string;
  quantity: number;
  unit: string;
  price: number;
  status: string;
  pickupLocation: string;
  expiryTime: string;
  createdAt: string;
};

type MeResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "PROVIDER" | "RECEIVER";
    provider: ProviderProfile | null;
  };
};

type MyListingsResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: FoodListing[];
};

type Phase = "loading" | "error";

const ACTIVE_STATUSES = new Set(["AVAILABLE", "PARTIALLY_RESERVED"]);
const RESERVED_STATUSES = new Set(["PARTIALLY_RESERVED", "FULLY_RESERVED"]);

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: "bg-primary/10 text-primary",
  PARTIALLY_RESERVED: "bg-brand-amber/10 text-brand-amber",
  FULLY_RESERVED: "bg-brand-deep/10 text-brand-deep",
  DRAFT: "bg-muted text-muted-foreground",
  EXPIRED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-destructive/10 text-destructive",
};

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function ProviderDashboardView() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [loadError, setLoadError] = useState("");
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [userName, setUserName] = useState("");
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reloadKey intentionally re-runs the dashboard load.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setPhase("loading");
      if (!getAccessToken()) {
        router.replace("/login");
        return;
      }
      try {
        const [me, myListings] = await Promise.all([
          api("/users/me") as Promise<MeResponse>,
          api("/food-listings/my").catch(
            () => null,
          ) as Promise<MyListingsResponse | null>,
        ]);
        if (cancelled) return;

        if (me.data.role !== "PROVIDER") {
          router.replace("/");
          return;
        }

        // No business profile yet → send to the creation section.
        if (!me.data.provider) {
          router.replace("/provider/profile");
          return;
        }

        setUserName(me.data.name);
        setProfile(me.data.provider);
        setListings(Array.isArray(myListings?.data) ? myListings.data : []);
      } catch (error) {
        if (cancelled) return;
        const message = getErrorMessage(error);
        if (
          /authentication required|invalid or expired token|unauthorized|provider profile not found/i.test(
            message,
          )
        ) {
          // A missing provider profile is handled via /users/me above; a
          // listing-level "profile not found" just means zero listings.
          if (/provider profile not found/i.test(message)) {
            try {
              const me = (await api("/users/me")) as MeResponse;
              if (cancelled) return;
              if (!me.data.provider) {
                router.replace("/provider/profile");
                return;
              }
              setUserName(me.data.name);
              setProfile(me.data.provider);
              setListings([]);
              return;
            } catch {
              // fall through to the error state below
            }
          } else {
            clearTokens();
            router.replace("/login");
            return;
          }
        }
        setLoadError(message);
        setPhase("error");
        return;
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router, reloadKey]);

  if (phase === "error") {
    return (
      <div className="flex flex-1 flex-col">
        <section className="bg-brand-deep text-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-amber uppercase">
              Provider dashboard
            </p>
            <h1 className="font-heading mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Something went wrong
            </h1>
          </div>
        </section>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>We couldn&apos;t load your dashboard</CardTitle>
                <CardDescription>
                  {loadError || "Please try again in a moment."}
                </CardDescription>
              </CardHeader>
              <CardFooter className="justify-end">
                <Button onClick={() => setReloadKey((key) => key + 1)}>
                  Try again
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalListings = listings.length;
  const activeListings = listings.filter((item) =>
    ACTIVE_STATUSES.has(item.status),
  ).length;
  const reservedListings = listings.filter((item) =>
    RESERVED_STATUSES.has(item.status),
  ).length;
  const mealsShared = listings.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );
  const recentListings = listings.slice(0, 5);

  const stats = [
    {
      label: "Total listings",
      value: totalListings,
      hint: "Everything you've shared",
      icon: Package,
    },
    {
      label: "Active now",
      value: activeListings,
      hint: "Available for pickup",
      icon: Clock,
    },
    {
      label: "Reserved",
      value: reservedListings,
      hint: "Claimed by neighbors",
      icon: TicketCheck,
    },
    {
      label: "Meals shared",
      value: mealsShared,
      hint: "Total quantity listed",
      icon: Leaf,
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <section className="bg-brand-deep text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-brand-amber uppercase">
                Provider dashboard
              </p>
              <h1 className="font-heading mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {userName ? `Welcome back, ${userName}` : "Welcome back"}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-white/70 sm:text-base">
                {profile.businessName} ·{" "}
                {BUSINESS_TYPE_LABELS[profile.businessType]} · {profile.city}
              </p>
              <span
                className={cn(
                  "mt-3 inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-[10px] font-semibold tracking-wide uppercase",
                  profile.isVerified
                    ? "bg-white/10 text-white"
                    : "bg-brand-amber/15 text-brand-amber",
                )}
              >
                <BadgeCheck className="size-3.5" />
                {profile.isVerified ? "Verified" : "Pending verification"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="lg"
                className="bg-brand-amber text-brand-deep hover:bg-brand-amber/90"
                render={<Link href="/browse" />}
              >
                <Plus />
                New listing
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                render={<Link href="/provider/profile" />}
              >
                <Store />
                View profile
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="w-full">
              <CardContent className="flex items-center gap-3 pt-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <stat.icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium text-foreground">
                    {stat.label}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {stat.hint}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="w-full lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent listings</CardTitle>
              <CardDescription>
                Your latest surplus food — neighbors see these in browse
                results.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {recentListings.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-6 text-center">
                  <p className="text-sm font-medium text-foreground">
                    No listings yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Share your first surplus meal so nearby neighbors can
                    reserve it before it goes to waste.
                  </p>
                  <Button
                    size="lg"
                    className="mt-4"
                    render={<Link href="/browse" />}
                  >
                    <Plus />
                    Share surplus food
                  </Button>
                </div>
              ) : (
                recentListings.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-md border border-border p-3"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-deep/5 text-brand-deep">
                      <Package className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {item.foodName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.quantity} {item.unit} · {item.pickupLocation}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-sm px-2 py-1 text-[10px] font-semibold tracking-wide uppercase",
                        STATUS_STYLES[item.status] ??
                          "bg-muted text-muted-foreground",
                      )}
                    >
                      {formatStatus(item.status)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
            {recentListings.length > 0 && (
              <CardFooter className="justify-end">
                <Button variant="outline" render={<Link href="/browse" />}>
                  Browse marketplace
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="size-4 text-primary" />
                Business profile
              </CardTitle>
              <CardDescription>
                This is what neighbors see when they pick up your food.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-xs text-muted-foreground">
              <p className="text-sm font-semibold text-foreground">
                {profile.businessName}
              </p>
              <p>
                {BUSINESS_TYPE_LABELS[profile.businessType]} · {profile.city}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="size-3.5 shrink-0" />
                {profile.address}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-3.5 shrink-0" />
                {profile.phone}
              </p>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-2">
              <Button
                size="lg"
                className="w-full"
                render={<Link href="/provider/profile" />}
              >
                Manage profile
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                render={<Link href="/browse" />}
              >
                Preview marketplace
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
