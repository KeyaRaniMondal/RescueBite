"use client";

import {
  BadgeCheck,
  CalendarCheck,
  ChevronDown,
  Loader2,
  Package,
  Search,
  TicketCheck,
  XCircle,
} from "lucide-react";
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
import { RowsSkeleton } from "@/components/ui/skeleton";
import { api, getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

export type Booking = {
  id: string;
  listingId: string;
  quantity: number;
  status: "RESERVED" | "CANCELLED" | "COMPLETED" | "EXPIRED";
  foodName: string;
  category: string;
  pickupLocation: string;
  pickupStartTime: string;
  pickupEndTime: string;
  expiryTime: string;
  cancelledAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

type MyReservationsResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: Booking[];
};

const STATUS_STYLES: Record<Booking["status"], string> = {
  RESERVED: "bg-primary/10 text-primary",
  COMPLETED: "bg-brand-deep/10 text-brand-deep",
  CANCELLED: "bg-destructive/10 text-destructive",
  EXPIRED: "bg-muted text-muted-foreground",
};

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ActivityView() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = setTimeout(
      () => setSearchTerm(searchInput.trim().toLowerCase()),
      400,
    );
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = (await api(
          "/reservations/my",
        )) as MyReservationsResponse;
        if (cancelled) return;
        setBookings(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err, "Unable to load your bookings."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCancel(booking: Booking) {
    setCancellingId(booking.id);
    setRowError((prev) => ({ ...prev, [booking.id]: "" }));
    try {
      const response = (await api(`/reservations/${booking.id}/cancel`, {
        method: "PATCH",
      })) as { data: Booking };
      setBookings((prev) =>
        prev.map((item) => (item.id === booking.id ? response.data : item)),
      );
    } catch (err) {
      setRowError((prev) => ({
        ...prev,
        [booking.id]: getErrorMessage(err, "Unable to cancel this booking."),
      }));
    } finally {
      setCancellingId(null);
    }
  }

  const filtered = useMemo(() => {
    return bookings.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (
        searchTerm &&
        !`${item.foodName} ${item.pickupLocation}`
          .toLowerCase()
          .includes(searchTerm)
      )
        return false;
      return true;
    });
  }, [bookings, searchTerm, statusFilter]);

  const timeline = useMemo(() => {
    const events: Array<{
      id: string;
      time: number;
      label: string;
      detail: string;
      kind: "reserved" | "cancelled" | "completed";
    }> = [];
    for (const item of bookings) {
      events.push({
        id: `${item.id}-reserved`,
        time: new Date(item.createdAt).getTime(),
        label: `Reserved ${item.foodName}`,
        detail: `Qty ${item.quantity} · ${item.pickupLocation}`,
        kind: "reserved",
      });
      if (item.cancelledAt) {
        events.push({
          id: `${item.id}-cancelled`,
          time: new Date(item.cancelledAt).getTime(),
          label: `Cancelled ${item.foodName}`,
          detail: "Reserved items were released",
          kind: "cancelled",
        });
      }
      if (item.completedAt) {
        events.push({
          id: `${item.id}-completed`,
          time: new Date(item.completedAt).getTime(),
          label: `Completed ${item.foodName}`,
          detail: "Picked up successfully",
          kind: "completed",
        });
      }
    }
    return events
      .filter((event) => !Number.isNaN(event.time))
      .sort((a, b) => b.time - a.time)
      .slice(0, 8);
  }, [bookings]);

  const activeCount = bookings.filter(
    (item) => item.status === "RESERVED",
  ).length;
  const completedCount = bookings.filter(
    (item) => item.status === "COMPLETED",
  ).length;
  const mealsRescued = bookings
    .filter((item) => item.status !== "CANCELLED")
    .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const stats = [
    {
      label: "Total bookings",
      value: bookings.length,
      hint: "Food you've claimed",
      icon: Package,
    },
    {
      label: "Active pickups",
      value: activeCount,
      hint: "Ready to collect",
      icon: CalendarCheck,
    },
    {
      label: "Completed",
      value: completedCount,
      hint: "Successfully rescued",
      icon: TicketCheck,
    },
    {
      label: "Meals rescued",
      value: mealsRescued,
      hint: "Total quantity saved",
      icon: BadgeCheck,
    },
  ];

  return (
    <div className="grid gap-4">
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="w-full lg:col-span-2">
          <CardHeader>
            <CardTitle>My orders & bookings</CardTitle>
            <CardDescription>
              Every reservation with its pickup status. Active bookings can be
              cancelled here.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_170px]">
              <div className="grid gap-1.5">
                <Label htmlFor="bookings-search">Search</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="bookings-search"
                    placeholder="Food or pickup location"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="bookings-status">Status</Label>
                <select
                  id="bookings-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 rounded-none border border-input bg-background px-2.5 text-xs font-medium outline-none focus-visible:border-ring"
                >
                  <option value="ALL">All statuses</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}

            {loading ? (
              <RowsSkeleton count={4} />
            ) : filtered.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-6 text-center">
                <p className="text-sm font-medium text-foreground">
                  {bookings.length === 0 ? "No bookings yet" : "No matches"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {bookings.length === 0
                    ? "Browse surplus food near you and reserve your first pickup."
                    : "Try a different search term or status."}
                </p>
                {bookings.length === 0 && (
                  <Button
                    size="lg"
                    className="mt-4"
                    render={<Link href="/browse" />}
                  >
                    Find food
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-2">
                {filtered.map((item) => {
                  const expanded = expandedId === item.id;
                  const cancelling = cancellingId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="rounded-md border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {item.foodName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            Qty {item.quantity} · {item.pickupLocation}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-sm px-2 py-1 text-[10px] font-semibold tracking-wide uppercase",
                            STATUS_STYLES[item.status],
                          )}
                        >
                          {item.status}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(expanded ? null : item.id)
                          }
                          aria-expanded={expanded}
                          aria-label={`${expanded ? "Hide" : "Show"} details for ${item.foodName}`}
                          className="rounded-sm p-1 text-muted-foreground hover:bg-muted"
                        >
                          <ChevronDown
                            className={cn(
                              "size-4 transition-transform",
                              expanded && "rotate-180",
                            )}
                          />
                        </button>
                      </div>
                      {expanded && (
                        <dl className="mt-2 grid gap-1 border-t border-border pt-2 text-xs">
                          <div className="flex justify-between gap-2">
                            <dt className="text-muted-foreground">
                              Pickup window
                            </dt>
                            <dd className="text-right font-medium">
                              {formatDateTime(item.pickupStartTime)} →{" "}
                              {formatDateTime(item.pickupEndTime)}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt className="text-muted-foreground">
                              Reserved on
                            </dt>
                            <dd className="font-medium">
                              {formatDateTime(item.createdAt)}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt className="text-muted-foreground">
                              Booking ID
                            </dt>
                            <dd className="font-mono break-all">{item.id}</dd>
                          </div>
                        </dl>
                      )}
                      {rowError[item.id] && (
                        <p className="mt-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                          {rowError[item.id]}
                        </p>
                      )}
                      {item.status === "RESERVED" && (
                        <div className="mt-2 flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            disabled={cancelling}
                            onClick={() => void handleCancel(item)}
                          >
                            {cancelling ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              <XCircle />
                            )}
                            {cancelling ? "Cancelling..." : "Cancel booking"}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          {filtered.length > 0 && (
            <CardFooter className="justify-end">
              <p className="text-xs text-muted-foreground">
                {filtered.length} booking{filtered.length === 1 ? "" : "s"}
              </p>
            </CardFooter>
          )}
        </Card>

        <Card className="w-full content-start">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Your latest reservation events.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {timeline.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nothing here yet — activity appears once you reserve food.
              </p>
            ) : (
              <ol className="grid gap-3">
                {timeline.map((event) => (
                  <li key={event.id} className="flex gap-2.5 text-xs">
                    <span
                      className={cn(
                        "mt-0.5 size-2 shrink-0 rounded-full",
                        event.kind === "reserved" && "bg-primary",
                        event.kind === "completed" && "bg-brand-deep",
                        event.kind === "cancelled" && "bg-destructive",
                      )}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">
                        {event.label}
                      </p>
                      <p className="text-muted-foreground">{event.detail}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(event.time).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
