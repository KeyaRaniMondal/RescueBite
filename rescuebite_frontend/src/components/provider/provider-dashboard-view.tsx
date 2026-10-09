"use client";

import {
  BadgeCheck,
  Banknote,
  CalendarClock,
  ChartColumn,
  ClipboardList,
  Clock,
  Leaf,
  Loader2,
  MapPin,
  Package,
  Phone,
  Plus,
  Search,
  Store,
  TicketCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PageShellSkeleton,
  RowsSkeleton,
  StatCardsSkeleton,
} from "@/components/ui/skeleton";
import { api, getErrorMessage } from "@/lib/api";
import { clearTokens, getAccessToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

type MyListing = {
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
  data: MyListing[];
};

type ListingResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: MyListing;
};

type Phase = "loading" | "ready" | "error";
type ProviderTab = "listings" | "earnings" | "profile";

const TABS: Array<{ id: ProviderTab; label: string; icon: typeof Package }> = [
  { id: "listings", label: "My Tasks & Listings", icon: ClipboardList },
  { id: "earnings", label: "Earnings & Analytics", icon: ChartColumn },
  { id: "profile", label: "Profile & Availability", icon: Store },
];

/** Mirrors ALLOWED_TRANSITIONS in the backend food-listing service. */
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["AVAILABLE"],
  AVAILABLE: ["PARTIALLY_RESERVED", "FULLY_RESERVED", "CANCELLED", "EXPIRED"],
  PARTIALLY_RESERVED: ["FULLY_RESERVED", "EXPIRED"],
  FULLY_RESERVED: ["EXPIRED"],
  EXPIRED: [],
  CANCELLED: [],
};

const LISTING_STATUSES = [
  "AVAILABLE",
  "PARTIALLY_RESERVED",
  "FULLY_RESERVED",
  "DRAFT",
  "EXPIRED",
  "CANCELLED",
] as const;

const LISTING_CATEGORIES = [
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

const CHART_COLORS = [
  "#0f3d2e",
  "#d97706",
  "#0284c7",
  "#7c3aed",
  "#db2777",
  "#65a30d",
  "#475569",
  "#ea580c",
];

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

function listingValue(item: MyListing): number {
  return item.price * (Number(item.quantity) || 0);
}

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

/** ISO string → "YYYY-MM-DDTHH:mm" for datetime-local inputs. */
function toLocalInput(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function BarList({
  items,
}: {
  items: Array<{
    label: string;
    value: number;
    color: string;
    display?: string;
  }>;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <div className="grid gap-2.5">
      {items.map((item) => (
        <div key={item.label} className="grid gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">{item.label}</span>
            <span className="font-bold text-foreground">
              {item.display ?? item.value}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.round((item.value / max) * 100)}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({
  items,
}: {
  items: Array<{ label: string; value: number; color: string }>;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        role="img"
        aria-label="Status distribution chart"
      >
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth="18"
          className="stroke-muted"
        />
        {total > 0 &&
          items
            .filter((item) => item.value > 0)
            .map((item) => {
              const fraction = item.value / total;
              const dash = fraction * circumference;
              const element = (
                <circle
                  key={item.label}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="18"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 70 70)"
                />
              );
              offset += dash;
              return element;
            })}
        <text
          x="70"
          y="70"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-foreground text-lg font-bold"
        >
          {total}
        </text>
      </svg>
      <ul className="grid flex-1 gap-1.5 text-xs">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="flex-1 text-muted-foreground">{item.label}</span>
            <span className="font-bold text-foreground">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProviderDashboardView() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState<ProviderTab>("listings");
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [listings, setListings] = useState<MyListing[]>([]);
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
        setUserEmail(me.data.email);
        setProfile(me.data.provider);
        setListings(Array.isArray(myListings?.data) ? myListings.data : []);
        setPhase("ready");
      } catch (error) {
        if (cancelled) return;
        const message = getErrorMessage(error);
        if (
          /authentication required|invalid or expired token|unauthorized|provider profile not found/i.test(
            message,
          )
        ) {
          if (/provider profile not found/i.test(message)) {
            try {
              const me = (await api("/users/me")) as MeResponse;
              if (cancelled) return;
              if (!me.data.provider) {
                router.replace("/provider/profile");
                return;
              }
              setUserName(me.data.name);
              setUserEmail(me.data.email);
              setProfile(me.data.provider);
              setListings([]);
              setPhase("ready");
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

  function upsertListing(listing: MyListing) {
    setListings((prev) => {
      const exists = prev.some((item) => item.id === listing.id);
      if (exists) {
        return prev.map((item) => (item.id === listing.id ? listing : item));
      }
      return [listing, ...prev];
    });
  }

  function removeListing(id: string) {
    setListings((prev) => prev.filter((item) => item.id !== id));
  }

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

  if (phase === "loading" || !profile) {
    return (
      <PageShellSkeleton heroTabs>
        <div className="grid gap-4">
          <StatCardsSkeleton count={3} />
          <RowsSkeleton count={4} />
        </div>
      </PageShellSkeleton>
    );
  }

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
          </div>
          <div
            role="tablist"
            aria-label="Provider sections"
            className="mt-6 flex flex-wrap gap-2"
          >
            {TABS.map((item) => (
              <button
                key={item.id}
                role="tab"
                aria-selected={tab === item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-semibold transition-colors",
                  tab === item.id
                    ? "bg-brand-amber text-brand-deep"
                    : "border border-white/20 text-white hover:bg-white/10",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {tab === "listings" && (
          <ListingsSection
            listings={listings}
            onUpsert={upsertListing}
            onRemove={removeListing}
          />
        )}
        {tab === "earnings" && <EarningsSection listings={listings} />}
        {tab === "profile" && (
          <ProfileSection
            profile={profile}
            userName={userName}
            userEmail={userEmail}
            listings={listings}
            onNameChange={setUserName}
          />
        )}
      </main>
    </div>
  );
}

function ListingsSection({
  listings,
  onUpsert,
  onRemove,
}: {
  listings: MyListing[];
  onUpsert: (listing: MyListing) => void;
  onRemove: (id: string) => void;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MyListing | null>(null);

  useEffect(() => {
    const timer = setTimeout(
      () => setSearchTerm(searchInput.trim().toLowerCase()),
      400,
    );
    return () => clearTimeout(timer);
  }, [searchInput]);

  const now = Date.now();
  const drafts = listings.filter((item) => item.status === "DRAFT");
  const expiringSoon = listings.filter((item) => {
    if (!["AVAILABLE", "PARTIALLY_RESERVED"].includes(item.status))
      return false;
    const ms = new Date(item.expiryTime).getTime() - now;
    return ms > 0 && ms <= 48 * 60 * 60 * 1000;
  });
  const expired = listings.filter((item) => item.status === "EXPIRED");

  const attention = [
    { label: "Drafts to publish", value: drafts.length, icon: ClipboardList },
    { label: "Expiring within 48h", value: expiringSoon.length, icon: Clock },
    { label: "Expired — clean up", value: expired.length, icon: Package },
  ];

  const filtered = useMemo(() => {
    const result = listings.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (
        searchTerm &&
        !`${item.foodName} ${item.description} ${item.pickupLocation}`
          .toLowerCase()
          .includes(searchTerm)
      )
        return false;
      return true;
    });
    return [...result].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [listings, searchTerm, statusFilter]);

  function handleEdit(item: MyListing) {
    setEditing(item);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditing(null);
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {attention.map((task) => (
          <Card key={task.label} className="w-full">
            <CardContent className="flex items-center gap-3 pt-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-amber/15 text-brand-amber">
                <task.icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {task.value}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {task.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm ? (
        <ListingForm
          initial={editing}
          onSaved={(listing) => {
            onUpsert(listing);
            handleFormClose();
          }}
          onCancel={handleFormClose}
        />
      ) : (
        <Card className="w-full">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>My listings</CardTitle>
                <CardDescription>
                  Create, edit, publish, and retire your surplus food. Only
                  drafts can be edited.
                </CardDescription>
              </div>
              <Button onClick={() => setShowForm(true)}>
                <Plus />
                New listing
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
              <div className="grid gap-1.5">
                <Label htmlFor="provider-listing-search">Search</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="provider-listing-search"
                    placeholder="Name, description, or pickup"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="provider-listing-status">Status</Label>
                <select
                  id="provider-listing-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 rounded-none border border-input bg-background px-2.5 text-xs font-medium outline-none focus-visible:border-ring"
                >
                  <option value="ALL">All statuses</option>
                  {LISTING_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-6 text-center">
                <p className="text-sm font-medium text-foreground">
                  {listings.length === 0 ? "No listings yet" : "No matches"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {listings.length === 0
                    ? "Share your first surplus meal so nearby neighbors can reserve it."
                    : "Try a different search term or status."}
                </p>
                {listings.length === 0 && (
                  <Button
                    size="lg"
                    className="mt-4"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus />
                    Share surplus food
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-2">
                {filtered.map((item) => (
                  <ListingRow
                    key={item.id}
                    item={item}
                    onEdit={() => handleEdit(item)}
                    onUpsert={onUpsert}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ListingRow({
  item,
  onEdit,
  onUpsert,
  onRemove,
}: {
  item: MyListing;
  onEdit: () => void;
  onUpsert: (listing: MyListing) => void;
  onRemove: (id: string) => void;
}) {
  const [statusBusy, setStatusBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [rowError, setRowError] = useState("");

  const nextStatuses = ALLOWED_TRANSITIONS[item.status] ?? [];

  async function handleStatusChange(next: string) {
    if (!next || next === item.status) return;
    setStatusBusy(true);
    setRowError("");
    try {
      const response = (await api(`/food-listings/${item.id}/status`, {
        method: "PATCH",
        body: { status: next },
      })) as ListingResponse;
      onUpsert(response.data);
    } catch (error) {
      setRowError(getErrorMessage(error, "Unable to update status."));
    } finally {
      setStatusBusy(false);
    }
  }

  async function handleDelete() {
    setDeleteBusy(true);
    setRowError("");
    try {
      await api(`/food-listings/${item.id}`, { method: "DELETE" });
      onRemove(item.id);
    } catch (error) {
      setRowError(getErrorMessage(error, "Unable to delete listing."));
      setConfirmingDelete(false);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="grid gap-3 rounded-md border border-border p-3">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-deep/5 text-brand-deep">
          <Package className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {item.foodName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {item.quantity} {item.unit} · {formatMoney(item.price)} ·{" "}
            {formatLabel(item.category)} · {item.pickupLocation}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Pickup {formatDateTime(item.pickupStartTime)} →{" "}
            {formatDateTime(item.pickupEndTime)} · Expires{" "}
            {formatDateTime(item.expiryTime)}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-sm px-2 py-1 text-[10px] font-semibold tracking-wide uppercase",
            STATUS_STYLES[item.status] ?? "bg-muted text-muted-foreground",
          )}
        >
          {formatLabel(item.status)}
        </span>
      </div>
      {rowError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {rowError}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {item.status === "DRAFT" && (
          <Button size="sm" variant="outline" onClick={onEdit}>
            Edit
          </Button>
        )}
        {nextStatuses.length > 0 && (
          <select
            value=""
            disabled={statusBusy}
            onChange={(e) => void handleStatusChange(e.target.value)}
            aria-label={`Change status of ${item.foodName}`}
            className="h-7 rounded-none border border-input bg-background px-2 text-xs font-medium outline-none focus-visible:border-ring disabled:opacity-50"
          >
            <option value="">
              {statusBusy ? "Updating..." : "Set status…"}
            </option>
            {nextStatuses.map((status) => (
              <option key={status} value={status}>
                → {formatLabel(status)}
              </option>
            ))}
          </select>
        )}
        <Button
          size="sm"
          variant="outline"
          render={<Link href={`/browse/${item.id}`} />}
        >
          View
        </Button>
        <span className="flex-1" />
        {confirmingDelete ? (
          <>
            <span className="text-xs text-muted-foreground">
              Delete this listing?
            </span>
            <Button
              size="sm"
              variant="destructive"
              disabled={deleteBusy}
              onClick={handleDelete}
            >
              {deleteBusy && <Loader2 className="animate-spin" />}
              Confirm
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={deleteBusy}
              onClick={() => setConfirmingDelete(false)}
            >
              Keep
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmingDelete(true)}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}

type ListingFormValues = {
  foodName: string;
  description: string;
  category: string;
  quantity: string;
  unit: string;
  price: string;
  pickupLocation: string;
  pickupStartTime: string;
  pickupEndTime: string;
  expiryTime: string;
  status: string;
};

function ListingForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: MyListing | null;
  onSaved: (listing: MyListing) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<ListingFormValues>({
    foodName: initial?.foodName ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "",
    quantity: initial ? String(initial.quantity) : "",
    unit: initial?.unit ?? "",
    price: initial ? String(initial.price) : "",
    pickupLocation: initial?.pickupLocation ?? "",
    pickupStartTime: initial ? toLocalInput(initial.pickupStartTime) : "",
    pickupEndTime: initial ? toLocalInput(initial.pickupEndTime) : "",
    expiryTime: initial ? toLocalInput(initial.expiryTime) : "",
    status: initial?.status ?? "DRAFT",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ListingFormValues, string>>
  >({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function update<K extends keyof ListingFormValues>(
    key: K,
    value: ListingFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof ListingFormValues, string>> = {};
    if (values.foodName.trim().length < 2)
      next.foodName = "At least 2 characters.";
    if (values.description.trim().length < 5)
      next.description = "At least 5 characters.";
    if (!values.category) next.category = "Select a category.";
    const quantity = Number(values.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0)
      next.quantity = "Enter a whole number above zero.";
    if (!values.unit.trim())
      next.unit = "Unit is required (e.g. portions, kg).";
    const price = Number(values.price);
    if (Number.isNaN(price) || price < 0)
      next.price = "Enter zero or a positive number.";
    if (values.pickupLocation.trim().length < 3)
      next.pickupLocation = "At least 3 characters.";
    const start = new Date(values.pickupStartTime).getTime();
    const end = new Date(values.pickupEndTime).getTime();
    const expiry = new Date(values.expiryTime).getTime();
    if (Number.isNaN(start)) next.pickupStartTime = "Pickup start is required.";
    if (Number.isNaN(end)) next.pickupEndTime = "Pickup end is required.";
    if (Number.isNaN(expiry)) next.expiryTime = "Expiry time is required.";
    if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start)
      next.pickupEndTime = "Pickup end must be after pickup start.";
    if (!Number.isNaN(end) && !Number.isNaN(expiry) && expiry < end)
      next.expiryTime = "Expiry must be at or after pickup end.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError("");
    setSaving(true);
    try {
      const body = {
        foodName: values.foodName.trim(),
        description: values.description.trim(),
        category: values.category,
        quantity: Number(values.quantity),
        unit: values.unit.trim(),
        price: Number(values.price),
        pickupLocation: values.pickupLocation.trim(),
        pickupStartTime: new Date(values.pickupStartTime).toISOString(),
        pickupEndTime: new Date(values.pickupEndTime).toISOString(),
        expiryTime: new Date(values.expiryTime).toISOString(),
        ...(initial ? {} : { status: values.status }),
      };
      const response = (await api(
        initial ? `/food-listings/${initial.id}` : "/food-listings",
        { method: initial ? "PATCH" : "POST", body },
      )) as ListingResponse;
      onSaved(response.data);
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, "Unable to save listing. Please try again."),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initial ? "Edit draft listing" : "New listing"}</CardTitle>
        <CardDescription>
          {initial
            ? "Only drafts can be edited. Publish it when it's ready for neighbors."
            : "Save as a draft to polish later, or publish straight away."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Food name" error={errors.foodName}>
            <Input
              value={values.foodName}
              maxLength={100}
              onChange={(e) => update("foodName", e.target.value)}
              placeholder="e.g. Butter croissants"
              aria-invalid={Boolean(errors.foodName)}
            />
          </FormField>
          <div className="grid gap-1.5">
            <Label htmlFor="listing-category">Category</Label>
            <select
              id="listing-category"
              value={values.category}
              onChange={(e) => update("category", e.target.value)}
              className="h-8 rounded-none border border-input bg-background px-2.5 text-xs font-medium outline-none focus-visible:border-ring"
            >
              <option value="">Select a category</option>
              {LISTING_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {formatLabel(category)}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category}</p>
            )}
          </div>
          <FormField
            label="Description"
            error={errors.description}
            className="sm:col-span-2"
          >
            <Input
              value={values.description}
              maxLength={500}
              onChange={(e) => update("description", e.target.value)}
              placeholder="What's included, diet notes, pickup instructions…"
              aria-invalid={Boolean(errors.description)}
            />
          </FormField>
          <FormField label="Quantity" error={errors.quantity}>
            <Input
              type="number"
              min={1}
              step={1}
              value={values.quantity}
              onChange={(e) => update("quantity", e.target.value)}
              placeholder="e.g. 12"
              aria-invalid={Boolean(errors.quantity)}
            />
          </FormField>
          <FormField label="Unit" error={errors.unit}>
            <Input
              value={values.unit}
              onChange={(e) => update("unit", e.target.value)}
              placeholder="e.g. portions, kg, boxes"
              aria-invalid={Boolean(errors.unit)}
            />
          </FormField>
          <FormField label="Price ($)" error={errors.price}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={values.price}
              onChange={(e) => update("price", e.target.value)}
              placeholder="e.g. 4.50"
              aria-invalid={Boolean(errors.price)}
            />
          </FormField>
          <FormField label="Pickup location" error={errors.pickupLocation}>
            <Input
              value={values.pickupLocation}
              onChange={(e) => update("pickupLocation", e.target.value)}
              placeholder="e.g. 123 Main Street"
              aria-invalid={Boolean(errors.pickupLocation)}
            />
          </FormField>
          <FormField label="Pickup start" error={errors.pickupStartTime}>
            <Input
              type="datetime-local"
              value={values.pickupStartTime}
              onChange={(e) => update("pickupStartTime", e.target.value)}
              aria-invalid={Boolean(errors.pickupStartTime)}
            />
          </FormField>
          <FormField label="Pickup end" error={errors.pickupEndTime}>
            <Input
              type="datetime-local"
              value={values.pickupEndTime}
              onChange={(e) => update("pickupEndTime", e.target.value)}
              aria-invalid={Boolean(errors.pickupEndTime)}
            />
          </FormField>
          <FormField label="Expiry time" error={errors.expiryTime}>
            <Input
              type="datetime-local"
              value={values.expiryTime}
              onChange={(e) => update("expiryTime", e.target.value)}
              aria-invalid={Boolean(errors.expiryTime)}
            />
          </FormField>
          {!initial && (
            <div className="grid gap-1.5">
              <Label htmlFor="listing-status">Visibility</Label>
              <select
                id="listing-status"
                value={values.status}
                onChange={(e) => update("status", e.target.value)}
                className="h-8 rounded-none border border-input bg-background px-2.5 text-xs font-medium outline-none focus-visible:border-ring"
              >
                <option value="DRAFT">Save as draft</option>
                <option value="AVAILABLE">Publish now</option>
              </select>
            </div>
          )}
          {submitError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive sm:col-span-2">
              {submitError}
            </p>
          )}
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            {saving ? "Saving..." : initial ? "Save changes" : "Create listing"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function FormField({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function EarningsSection({ listings }: { listings: MyListing[] }) {
  const claimed = listings
    .filter((item) => item.status === "FULLY_RESERVED")
    .reduce((sum, item) => sum + listingValue(item), 0);
  const pipeline = listings
    .filter((item) => item.status === "PARTIALLY_RESERVED")
    .reduce((sum, item) => sum + listingValue(item), 0);
  const activeValue = listings
    .filter((item) => item.status === "AVAILABLE")
    .reduce((sum, item) => sum + listingValue(item), 0);
  const mealsClaimed = listings
    .filter((item) => item.status === "FULLY_RESERVED")
    .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const totalQty = listings
    .filter((item) => !["CANCELLED"].includes(item.status))
    .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const sellThrough =
    totalQty > 0 ? Math.round((mealsClaimed / totalQty) * 100) : 0;

  const revenueByCategory = useMemo(
    () =>
      LISTING_CATEGORIES.map((category, index) => {
        const value = listings
          .filter(
            (item) =>
              item.category === category &&
              ["FULLY_RESERVED", "PARTIALLY_RESERVED"].includes(item.status),
          )
          .reduce((sum, item) => sum + listingValue(item), 0);
        return {
          label: formatLabel(category),
          value: Math.round(value * 100) / 100,
          display: formatMoney(value),
          color: CHART_COLORS[index % CHART_COLORS.length] ?? "#475569",
        };
      }).filter((row) => row.value > 0),
    [listings],
  );

  const statusBreakdown = useMemo(
    () =>
      LISTING_STATUSES.map((status, index) => ({
        label: formatLabel(status),
        value: listings.filter((item) => item.status === status).length,
        color: CHART_COLORS[index % CHART_COLORS.length] ?? "#475569",
      })),
    [listings],
  );

  const trend = useMemo(() => {
    const days: Array<{ label: string; value: number; color: string }> = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let offset = 13; offset >= 0; offset--) {
      const start = new Date(today.getTime() - offset * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      const count = listings.filter((item) => {
        const created = new Date(item.createdAt).getTime();
        return created >= start.getTime() && created < end.getTime();
      }).length;
      days.push({
        label: start.toLocaleDateString(undefined, {
          month: "numeric",
          day: "numeric",
        }),
        value: count,
        color: "#0f3d2e",
      });
    }
    return days;
  }, [listings]);

  const topListings = useMemo(
    () =>
      [...listings]
        .sort((a, b) => listingValue(b) - listingValue(a))
        .slice(0, 5),
    [listings],
  );

  const cards = [
    {
      label: "Claimed revenue",
      value: formatMoney(claimed),
      hint: "Fully reserved listings",
      icon: Banknote,
    },
    {
      label: "In the pipeline",
      value: formatMoney(pipeline),
      hint: "Partially reserved (upper bound)",
      icon: TicketCheck,
    },
    {
      label: "Active listed value",
      value: formatMoney(activeValue),
      hint: "Available right now",
      icon: Package,
    },
    {
      label: "Meals claimed",
      value: mealsClaimed,
      hint: `${sellThrough}% of portions fully claimed`,
      icon: Leaf,
    },
  ];

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Revenue by category</CardTitle>
            <CardDescription>
              Claimed + in-pipeline value across reserved listings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {revenueByCategory.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No reserved listings yet — revenue appears here once neighbors
                start claiming your food.
              </p>
            ) : (
              <BarList items={revenueByCategory} />
            )}
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Listings by status</CardTitle>
            <CardDescription>
              {listings.length} total listings across every stage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart items={statusBreakdown} />
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>New listings — last 14 days</CardTitle>
            <CardDescription>
              How steadily you&apos;re sharing surplus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarList items={trend} />
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Top listings by value</CardTitle>
            <CardDescription>
              Your highest-value surplus, by price × quantity.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {topListings.length === 0 ? (
              <p className="text-xs text-muted-foreground">No listings yet.</p>
            ) : (
              topListings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-md border border-border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.foodName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.quantity} {item.unit} × {formatMoney(item.price)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-foreground">
                    {formatMoney(listingValue(item))}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Figures are derived from your listings: fully-reserved value counts as
        claimed, partially-reserved value is an upper bound (the claimed portion
        isn&apos;t exposed to providers). Final payouts follow completed
        reservations.
      </p>
    </div>
  );
}

function ProfileSection({
  profile,
  userName,
  userEmail,
  listings,
  onNameChange,
}: {
  profile: ProviderProfile;
  userName: string;
  userEmail: string;
  listings: MyListing[];
  onNameChange: (name: string) => void;
}) {
  const [name, setName] = useState(userName);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    setName(userName);
  }, [userName]);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return listings
      .filter(
        (item) =>
          ["AVAILABLE", "PARTIALLY_RESERVED"].includes(item.status) &&
          new Date(item.pickupEndTime).getTime() >= now,
      )
      .sort(
        (a, b) =>
          new Date(a.pickupStartTime).getTime() -
          new Date(b.pickupStartTime).getTime(),
      )
      .slice(0, 8);
  }, [listings]);

  const defaultLocation = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of listings) {
      counts.set(
        item.pickupLocation,
        (counts.get(item.pickupLocation) ?? 0) + 1,
      );
    }
    let best = "";
    let bestCount = 0;
    for (const [location, count] of counts) {
      if (count > bestCount) {
        best = location;
        bestCount = count;
      }
    }
    return best;
  }, [listings]);

  async function handleSaveName() {
    setFormError("");
    setFormSuccess("");
    const trimmed = name.trim();
    if (trimmed.length < 3 || trimmed.length > 10) {
      setFormError("Name must be between 3 and 10 characters long.");
      return;
    }
    setSaving(true);
    try {
      const response = (await api("/users/me", {
        method: "PATCH",
        body: { name: trimmed },
      })) as MeResponse;
      onNameChange(response.data.name);
      setName(response.data.name);
      setFormSuccess("Your name was updated successfully.");
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to update your name."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="grid content-start gap-4">
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
            <span
              className={cn(
                "mt-1 inline-flex w-fit items-center gap-1.5 rounded-sm px-2 py-1 text-[10px] font-semibold tracking-wide uppercase",
                profile.isVerified
                  ? "bg-primary/10 text-primary"
                  : "bg-brand-amber/10 text-brand-amber",
              )}
            >
              <BadgeCheck className="size-3.5" />
              {profile.isVerified ? "Verified" : "Pending verification"}
            </span>
          </CardContent>
          <CardFooter>
            <p className="text-[11px] text-muted-foreground">
              Business details can&apos;t be edited after creation — contact
              support if they need to change.
            </p>
          </CardFooter>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-4 text-primary" />
              Account
            </CardTitle>
            <CardDescription>Signed in as {userEmail}.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="provider-account-name">Display name</Label>
              <Input
                id="provider-account-name"
                value={name}
                maxLength={10}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Between 3 and 10 characters.
              </p>
            </div>
            {formError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {formError}
              </p>
            )}
            {formSuccess && (
              <p className="rounded-md bg-primary/10 px-3 py-2 text-xs text-primary">
                {formSuccess}
              </p>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={handleSaveName} disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              {saving ? "Saving..." : "Save name"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="w-full content-start">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="size-4 text-primary" />
            Pickup availability
          </CardTitle>
          <CardDescription>
            Your upcoming pickup windows, taken from live listings. To change
            availability, edit the listing&apos;s pickup times.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {defaultLocation && (
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-foreground">
              Usual pickup spot: <strong>{defaultLocation}</strong>
            </p>
          )}
          {upcoming.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-6 text-center">
              <p className="text-sm font-medium text-foreground">
                No upcoming pickups
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Publish a listing and its pickup window will show up here.
              </p>
            </div>
          ) : (
            upcoming.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-md border border-border p-3"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Clock className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {item.foodName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatDateTime(item.pickupStartTime)} →{" "}
                    {formatDateTime(item.pickupEndTime)}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {item.pickupLocation}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-2">
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            render={<Link href="/provider/profile" />}
          >
            <Store />
            Manage profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
