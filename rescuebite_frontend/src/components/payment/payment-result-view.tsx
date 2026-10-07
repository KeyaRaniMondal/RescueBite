"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PaymentResultVariant = "success" | "fail" | "cancel";

const VARIANT_COPY: Record<
  PaymentResultVariant,
  { title: string; description: string }
> = {
  success: {
    title: "Payment successful",
    description:
      "Your payment went through and your reservation is confirmed. See you at pickup!",
  },
  fail: {
    title: "Payment failed",
    description:
      "The payment didn't go through and your reserved items were released. You can try again from the listing.",
  },
  cancel: {
    title: "Payment cancelled",
    description:
      "You cancelled the payment, so the reservation was released. No money was charged.",
  },
};

const VARIANT_ICON: Record<PaymentResultVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  fail: XCircle,
  cancel: AlertTriangle,
};

const VARIANT_ICON_STYLE: Record<PaymentResultVariant, string> = {
  success: "bg-primary/10 text-primary",
  fail: "bg-destructive/10 text-destructive",
  cancel: "bg-brand-amber/15 text-brand-amber",
};

export function PaymentResultView({
  variant,
}: {
  variant: PaymentResultVariant;
}) {
  const searchParams = useSearchParams();
  const tranId = searchParams.get("tran_id") ?? "";
  const status = (searchParams.get("status") ?? "").toUpperCase();
  const callbackError = searchParams.get("error") ?? "";

  const copy = VARIANT_COPY[variant];
  const Icon = VARIANT_ICON[variant];
  const pendingConfirmation = variant === "success" && status === "PENDING";

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-full",
              VARIANT_ICON_STYLE[variant],
            )}
          >
            <Icon className="size-6" />
          </span>
          <CardTitle className="mt-2">{copy.title}</CardTitle>
          <CardDescription>
            {pendingConfirmation
              ? "We received the gateway callback and are waiting on final bank confirmation. Your reservation will update automatically once it arrives."
              : copy.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {callbackError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {callbackError}
            </p>
          )}
          {tranId && (
            <dl className="grid gap-1 rounded-md border border-border p-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Transaction ID</dt>
                <dd className="font-mono font-semibold break-all">{tranId}</dd>
              </div>
              {status && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Payment status</dt>
                  <dd className="font-semibold">{status}</dd>
                </div>
              )}
            </dl>
          )}
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-2">
          <Button
            size="lg"
            className="w-full"
            render={<Link href="/dashboard" />}
          >
            Go to my dashboard
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            render={<Link href="/browse" />}
          >
            Browse more food
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
