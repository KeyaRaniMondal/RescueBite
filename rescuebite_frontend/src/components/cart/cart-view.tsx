"use client";

import {
  ArrowLeft,
  Loader2,
  Minus,
  Package,
  Plus,
  ShoppingBasket,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-context";
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
import { getStoredUser } from "@/lib/auth";

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

type CheckoutLine =
  | {
      ok: true;
      foodName: string;
      reservationId: string;
      paymentUrl: string;
    }
  | { ok: false; foodName: string; error: string };

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function CartView() {
  const router = useRouter();
  const { items, count, subtotal, updateQuantity, removeItem, clear } =
    useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [results, setResults] = useState<CheckoutLine[] | null>(null);

  async function handleCheckout() {
    setCheckoutError("");
    setResults(null);
    const user = getStoredUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "RECEIVER") {
      setCheckoutError("Only receiver accounts can reserve food.");
      return;
    }
    if (items.length === 0) return;

    setCheckingOut(true);
    const lines: CheckoutLine[] = [];
    try {
      for (const item of items) {
        try {
          const response = (await api("/reservations", {
            method: "POST",
            body: { listingId: item.listingId, quantity: item.quantity },
          })) as ReserveResponse;
          lines.push({
            ok: true,
            foodName: item.foodName,
            reservationId: response.data.id,
            paymentUrl: response.data.payment?.gatewayPageURL ?? "",
          });
          removeItem(item.listingId);
        } catch (error) {
          lines.push({
            ok: false,
            foodName: item.foodName,
            error: getErrorMessage(error, "Unable to reserve this item."),
          });
        }
      }
      setResults(lines);
    } finally {
      setCheckingOut(false);
    }
  }

  const succeeded = results?.filter((line) => line.ok) ?? [];
  const failed = results?.filter((line) => !line.ok) ?? [];

  return (
    <div className="flex flex-1 flex-col">
      <section className="bg-brand-deep text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-amber uppercase">
            Your cart
          </p>
          <h1 className="font-heading mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {count === 0
              ? "Nothing here yet"
              : `${count} item${count === 1 ? "" : "s"} reserved for rescue`}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/70 sm:text-base">
            Review your picks, then reserve them all at once.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {results && (
          <Card className="mb-4 w-full">
            <CardHeader>
              <CardTitle>Checkout results</CardTitle>
              <CardDescription>
                {succeeded.length > 0 &&
                  `${succeeded.length} reservation${succeeded.length === 1 ? "" : "s"} created — complete payment to finalize.`}
                {failed.length > 0 &&
                  ` ${failed.length} item${failed.length === 1 ? "" : "s"} couldn't be reserved (they stay in your cart).`}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {results.map((line, index) => (
                <div
                  key={`${line.foodName}-${index}`}
                  className="flex items-center gap-3 rounded-md border border-border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {line.foodName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {line.ok
                        ? `Reservation ${line.reservationId}`
                        : line.error}
                    </p>
                  </div>
                  {line.ok && line.paymentUrl && (
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => window.location.assign(line.paymentUrl)}
                    >
                      Pay now
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="outline" render={<Link href="/dashboard" />}>
                Go to my dashboard
              </Button>
            </CardFooter>
          </Card>
        )}

        {items.length === 0 ? (
          <div className="flex justify-center">
            <Card className="w-full max-w-lg">
              <CardHeader className="items-center text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <ShoppingBasket className="size-6" />
                </span>
                <CardTitle className="mt-2">Your cart is empty</CardTitle>
                <CardDescription>
                  Browse surplus food near you and add something worth rescuing.
                </CardDescription>
              </CardHeader>
              <CardFooter className="justify-center">
                <Button size="lg" render={<Link href="/browse" />}>
                  Browse food
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="h-fit w-full lg:col-span-2">
              <CardHeader>
                <CardTitle>Items in your cart</CardTitle>
                <CardDescription>
                  Quantities are capped at what&apos;s still available.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {items.map((item) => (
                  <div
                    key={item.listingId}
                    className="flex items-center gap-3 rounded-md border border-border p-3"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {item.image ? (
                        // biome-ignore lint/performance/noImgElement: backend returns remote URLs; next/image remote config not set up.
                        <img
                          src={item.image}
                          alt={item.foodName}
                          className="size-full object-cover"
                        />
                      ) : (
                        <Package className="size-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {item.foodName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatMoney(item.price)} per {item.unit} ·{" "}
                        {item.pickupLocation}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="outline"
                          disabled={item.quantity <= 1 || checkingOut}
                          onClick={() =>
                            updateQuantity(item.listingId, item.quantity - 1)
                          }
                          aria-label={`Decrease quantity of ${item.foodName}`}
                        >
                          <Minus />
                        </Button>
                        <span
                          className="min-w-8 text-center text-sm font-bold"
                          aria-live="polite"
                        >
                          {item.quantity}
                        </span>
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="outline"
                          disabled={
                            item.quantity >= item.maxQuantity || checkingOut
                          }
                          onClick={() =>
                            updateQuantity(item.listingId, item.quantity + 1)
                          }
                          aria-label={`Increase quantity of ${item.foodName}`}
                        >
                          <Plus />
                        </Button>
                        <span className="text-[11px] text-muted-foreground">
                          max {item.maxQuantity}
                        </span>
                      </div>
                    </div>
                    <div className="grid shrink-0 justify-items-end gap-1.5">
                      <span className="text-sm font-bold text-foreground">
                        {formatMoney(item.price * item.quantity)}
                      </span>
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        disabled={checkingOut}
                        onClick={() => removeItem(item.listingId)}
                        aria-label={`Remove ${item.foodName} from cart`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-fit w-full">
              <CardHeader>
                <CardTitle>Order summary</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>
                    {count} item{count === 1 ? "" : "s"}
                  </span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
                  <span>Total</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                {checkoutError && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {checkoutError}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-2">
                <Button
                  size="lg"
                  className="w-full"
                  disabled={checkingOut}
                  onClick={handleCheckout}
                >
                  {checkingOut && <Loader2 className="animate-spin" />}
                  {checkingOut ? "Reserving..." : "Reserve all"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  disabled={checkingOut}
                  onClick={clear}
                >
                  Clear cart
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full"
                  render={<Link href="/browse" />}
                >
                  <ArrowLeft />
                  Continue browsing
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
