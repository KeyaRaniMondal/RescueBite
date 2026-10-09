"use client";

import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  Bell,
  CheckCircle2,
  Clock3,
  ReceiptText,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Booking } from "@/components/receiver/activity-view";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RowsSkeleton } from "@/components/ui/skeleton";
import { api, getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

type MyPayment = {
  id: string;
  reservationId: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  tranId: string;
  createdAt: string;
  updatedAt: string;
  reservation: {
    id: string;
    quantity: number;
    status: Booking["status"];
    foodName: string;
    pickupLocation: string;
  };
};

type MyPaymentsResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: MyPayment[];
};

type MyReservationsResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: Booking[];
};

const PAYMENT_STATUS_STYLES: Record<MyPayment["status"], string> = {
  SUCCESS: "bg-primary/10 text-primary",
  PENDING: "bg-brand-amber/10 text-brand-amber",
  FAILED: "bg-destructive/10 text-destructive",
  CANCELLED: "bg-muted text-muted-foreground",
};

const DISMISSED_KEY = "rescuebite_notifications_dismissed";

function loadDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

type Notice = {
  id: string;
  time: number;
  title: string;
  body: string;
  kind: "pickup" | "payment" | "cancelled" | "completed";
};

const NOTICE_ICON: Record<Notice["kind"], typeof Bell> = {
  pickup: Clock3,
  payment: Banknote,
  cancelled: XCircle,
  completed: CheckCircle2,
};

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function PaymentsView() {
  const [payments, setPayments] = useState<MyPayment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    setDismissed(loadDismissed());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [paymentsRes, reservationsRes] = await Promise.all([
          api("/payments/my") as Promise<MyPaymentsResponse>,
          api("/reservations/my").catch(
            () => null,
          ) as Promise<MyReservationsResponse | null>,
        ]);
        if (cancelled) return;
        setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
        setBookings(
          Array.isArray(reservationsRes?.data) ? reservationsRes.data : [],
        );
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err, "Unable to load your payments."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  function dismiss(id: string) {
    setDismissed((prev) => {
      const next = [...prev, id];
      try {
        window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
      } catch {
        // storage unavailable — dismissal still applies this session
      }
      return next;
    });
  }

  function dismissAll(ids: string[]) {
    setDismissed((prev) => {
      const next = [...new Set([...prev, ...ids])];
      try {
        window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
      } catch {
        // ignore storage failures
      }
      return next;
    });
  }

  const paymentByReservation = useMemo(() => {
    const map = new Map<string, MyPayment>();
    for (const payment of payments) {
      if (!map.has(payment.reservationId))
        map.set(payment.reservationId, payment);
    }
    return map;
  }, [payments]);

  const notices = useMemo(() => {
    const now = Date.now();
    const list: Notice[] = [];
    for (const booking of bookings) {
      if (booking.status === "RESERVED") {
        const pickupStart = new Date(booking.pickupStartTime).getTime();
        if (
          !Number.isNaN(pickupStart) &&
          pickupStart - now <= 24 * 60 * 60 * 1000
        ) {
          list.push({
            id: `${booking.id}-pickup`,
            time: pickupStart,
            title: `Pickup soon: ${booking.foodName}`,
            body: `${booking.pickupLocation} · Qty ${booking.quantity}`,
            kind: "pickup",
          });
        }
        const payment = paymentByReservation.get(booking.id);
        if (payment?.status === "PENDING") {
          list.push({
            id: `${booking.id}-payment`,
            time: new Date(payment.createdAt).getTime(),
            title: `Payment pending: ${booking.foodName}`,
            body: `${formatMoney(payment.amount)} · complete it before pickup`,
            kind: "payment",
          });
        }
      }
      if (booking.status === "CANCELLED" && booking.cancelledAt) {
        list.push({
          id: `${booking.id}-cancelled`,
          time: new Date(booking.cancelledAt).getTime(),
          title: `Booking cancelled: ${booking.foodName}`,
          body: "Reserved items were released",
          kind: "cancelled",
        });
      }
      if (booking.status === "COMPLETED" && booking.completedAt) {
        list.push({
          id: `${booking.id}-completed`,
          time: new Date(booking.completedAt).getTime(),
          title: `Picked up: ${booking.foodName}`,
          body: "Thanks for rescuing food!",
          kind: "completed",
        });
      }
    }
    return list
      .filter(
        (notice) =>
          !Number.isNaN(notice.time) && !dismissed.includes(notice.id),
      )
      .sort((a, b) => b.time - a.time);
  }, [bookings, paymentByReservation, dismissed]);

  const filteredPayments = useMemo(
    () =>
      payments.filter(
        (payment) => statusFilter === "ALL" || payment.status === statusFilter,
      ),
    [payments, statusFilter],
  );

  const paidTotal = payments
    .filter((payment) => payment.status === "SUCCESS")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingCount = payments.filter(
    (payment) => payment.status === "PENDING",
  ).length;
  const failedCount = payments.filter((payment) =>
    ["FAILED", "CANCELLED"].includes(payment.status),
  ).length;

  const summary = [
    {
      label: "Total paid",
      value: formatMoney(paidTotal),
      hint: "Successful payments",
      icon: BadgeCheck,
    },
    {
      label: "Pending",
      value: pendingCount,
      hint: "Awaiting confirmation",
      icon: Clock3,
    },
    {
      label: "Failed / cancelled",
      value: failedCount,
      hint: "Did not go through",
      icon: XCircle,
    },
  ];

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {summary.map((card) => (
          <Card key={card.label} className="w-full">
            <CardContent className="flex items-center gap-3 pt-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <card.icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-foreground">
                  {card.value}
                </p>
                <p className="text-xs font-medium text-foreground">
                  {card.label}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {card.hint}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="w-full lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ReceiptText className="size-4 text-primary" />
              Payment history
            </CardTitle>
            <CardDescription>
              Every payment for your reservations, newest first.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid max-w-55 gap-1.5">
              <Label htmlFor="payments-status">Status</Label>
              <select
                id="payments-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded-none border border-input bg-background px-2.5 text-xs font-medium outline-none focus-visible:border-ring"
              >
                <option value="ALL">All statuses</option>
                <option value="SUCCESS">Successful</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}

            {loading ? (
              <RowsSkeleton count={4} />
            ) : filteredPayments.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-6 text-center">
                <p className="text-sm font-medium text-foreground">
                  {payments.length === 0 ? "No payments yet" : "No matches"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {payments.length === 0
                    ? "Payments appear here after you reserve food."
                    : "Try a different status filter."}
                </p>
              </div>
            ) : (
              <div className="grid gap-2">
                {filteredPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center gap-3 rounded-md border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {payment.reservation.foodName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleString()} · Qty{" "}
                        {payment.reservation.quantity} ·{" "}
                        <span className="font-mono">{payment.tranId}</span>
                      </p>
                    </div>
                    <div className="grid shrink-0 justify-items-end gap-1">
                      <span className="text-sm font-bold text-foreground">
                        {formatMoney(payment.amount)}
                      </span>
                      <span
                        className={cn(
                          "rounded-sm px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                          PAYMENT_STATUS_STYLES[payment.status],
                        )}
                      >
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full content-start">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="size-4 text-primary" />
                  Notifications
                  {notices.length > 0 && (
                    <span className="rounded-full bg-brand-amber px-2 py-0.5 text-[10px] font-bold text-brand-deep">
                      {notices.length}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Pickup reminders and booking updates.
                </CardDescription>
              </div>
              {notices.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dismissAll(notices.map((n) => n.id))}
                >
                  Clear all
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="grid gap-2">
            {loading ? (
              <RowsSkeleton count={3} />
            ) : notices.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-6 text-center">
                <p className="text-sm font-medium text-foreground">
                  All caught up
                </p>
                <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <AlertTriangle className="size-3.5" />
                  No new updates right now.
                </p>
              </div>
            ) : (
              notices.map((notice) => {
                const Icon = NOTICE_ICON[notice.kind];
                return (
                  <div
                    key={notice.id}
                    className="flex items-start gap-2.5 rounded-md border border-border p-3"
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground">
                        {notice.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {notice.body}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(notice.time).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismiss(notice.id)}
                      aria-label={`Dismiss ${notice.title}`}
                    >
                      <XCircle />
                    </Button>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
