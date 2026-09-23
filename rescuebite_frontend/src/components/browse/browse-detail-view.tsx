"use client";

import {
  ArrowLeft,
  CalendarClock,
  Loader2,
  MapPin,
  Minus,
  Package,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import type { FoodListing } from "@/components/browse/browse-view";
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
import { getAccessToken, getStoredUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

type ListingResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: FoodListing;
};

type ReserveResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    id: string;
    payment?: {
      id: string;
      tranId: string;
      amount: number;
      status: string;
      gatewayPageURL: string;
    };
  };
};

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function BrowseDetailView({ id }: { id: string }) {
  const router = useRouter();
  const [listing, setListing] = useState<FoodListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState("");
  const [reserveSuccess, setReserveSuccess] = useState<{
    reservationId: string;
    paymentUrl: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      if (!getAccessToken()) {
        setNeedsAuth(true);
        setLoading(false);
        return;
      }
      try {
        const response = (await api(`/food-listings/${id}`)) as ListingResponse;
        if (cancelled) return;
        setListing(response.data);
        setQuantity(1);
      } catch (err) {
        if (cancelled) return;
        const message = getErrorMessage(err);
        if (
          /authentication required|invalid or expired token|unauthorized/i.test(
            message,
          )
        ) {
          setNeedsAuth(true);
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
  }, [id]);

  async function handleReserve(e: FormEvent) {
    e.preventDefault();
    setReserveError("");
    const user = getStoredUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "RECEIVER") {
      setReserveError("Only receiver accounts can reserve food.");
      return;
    }
    if (!listing) return;

    setReserving(true);
    try {
      const response = (await api("/reservations", {
        method: "POST",
        body: { listingId: listing.id, quantity },
      })) as ReserveResponse;
      setReserveSuccess({
        reservationId: response.data.id,
        paymentUrl: response.data.payment?.gatewayPageURL ?? "",
      });
    } catch (err) {
      setReserveError(
        getErrorMessage(err, "Unable to reserve this food. Please try again."),
      );
    } finally {
      setReserving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (needsAuth) {
    return (
      <div className="flex justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Sign in to view this food</CardTitle>
            <CardDescription>
              Listing details are available to signed-in members.
            </CardDescription>
          </CardHeader>
          <CardFooter className="gap-2">
            <Button size="lg" render={<Link href="/login" />}>
              Sign in
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/browse" />}
            >
              <ArrowLeft />
              All foods
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Food not found</CardTitle>
            <CardDescription>
              {error || "This listing may have been removed."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" render={<Link href="/browse" />}>
              <ArrowLeft />
              Back to all foods
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const maxQuantity = Math.max(1, listing.quantity);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="w-full lg:col-span-2">
        <div className="flex h-64 items-center justify-center overflow-hidden bg-muted sm:h-80">
          {listing.images?.[0] ? (
            // biome-ignore lint/performance/noImgElement: backend returns remote URLs; next/image remote config not set up.
            <img
              src={listing.images[0]}
              alt={listing.foodName}
              className="size-full object-cover"
            />
          ) : (
            <Package className="size-12 text-muted-foreground" />
          )}
        </div>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-xl">{listing.foodName}</CardTitle>
              <CardDescription>
                {formatLabel(listing.category)} · {listing.quantity}{" "}
                {listing.unit} available · ৳{listing.price}
              </CardDescription>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-sm px-2 py-1 text-[10px] font-semibold tracking-wide uppercase",
                "bg-muted text-muted-foreground",
              )}
            >
              {formatLabel(listing.status)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground">
          <p className="leading-relaxed text-foreground">
            {listing.description}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            {listing.pickupLocation}
          </p>
          <p className="flex items-center gap-2">
            <CalendarClock className="size-4 shrink-0" />
            Pickup: {new Date(listing.pickupStartTime).toLocaleString()} —{" "}
            {new Date(listing.pickupEndTime).toLocaleString()}
          </p>
          <p className="text-xs">
            Expires: {new Date(listing.expiryTime).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card className="h-fit w-full">
        <CardHeader>
          <CardTitle>Reserve pickup</CardTitle>
          <CardDescription>
            Choose a quantity and reserve it before it&apos;s gone.
          </CardDescription>
        </CardHeader>
        {reserveSuccess ? (
          <CardContent className="grid gap-3">
            <p className="rounded-md bg-primary/10 px-3 py-2 text-xs text-primary">
              Reserved successfully (ID: {reserveSuccess.reservationId}).
              {reserveSuccess.paymentUrl
                ? " Complete the payment to finalize."
                : ""}
            </p>
            {reserveSuccess.paymentUrl && (
              <Button
                size="lg"
                className="w-full"
                type="button"
                onClick={() =>
                  window.open(reserveSuccess.paymentUrl, "_blank", "noopener")
                }
              >
                Pay now
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              render={<Link href="/receiver/dashboard" />}
            >
              Go to my dashboard
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleReserve}>
            <CardContent className="grid gap-4">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  disabled={quantity <= 1 || reserving}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus />
                </Button>
                <span
                  className="min-w-12 text-center text-lg font-bold"
                  aria-live="polite"
                >
                  {quantity}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  disabled={quantity >= maxQuantity || reserving}
                  onClick={() =>
                    setQuantity((q) => Math.min(maxQuantity, q + 1))
                  }
                  aria-label="Increase quantity"
                >
                  <Plus />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {listing.unit} (max {maxQuantity})
                </span>
              </div>
              {reserveError && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {reserveError}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-2">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={reserving}
              >
                {reserving && <Loader2 className="animate-spin" />}
                {reserving ? "Reserving..." : "Reserve now"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                render={<Link href="/browse" />}
              >
                <ArrowLeft />
                All foods
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
