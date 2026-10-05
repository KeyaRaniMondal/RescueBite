"use client";

import {
  BarChart3,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  Package,
  Search,
  Settings2,
  ShieldCheck,
  Store,
  TicketCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, getErrorMessage } from "@/lib/api";
import { clearTokens, getAccessToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Role = "ADMIN" | "PROVIDER" | "RECEIVER";

type MeResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: { id: string; name: string; email: string; role: Role };
};

type AdminStats = {
  totalProviders: number;
  totalReceivers: number;
  activeListings: number;
  completedReservations: number;
};

type AdminStatsResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: AdminStats;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type AdminUsersResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: AdminUser[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

type ListingsResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: FoodListing[];
};

type Phase = "loading" | "ready" | "error";
type AdminTab = "overview" | "resources" | "reports" | "settings";
type ResourceTab = "users" | "listings";

const TABS: Array<{ id: AdminTab; label: string; icon: typeof Users }> = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "resources", label: "Resources", icon: Boxes },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings2 },
];

const ROLE_OPTIONS: Array<"ALL" | Role> = [
  "ALL",
  "ADMIN",
  "PROVIDER",
  "RECEIVER",
];
const EDITABLE_ROLES: Role[] = ["ADMIN", "PROVIDER", "RECEIVER"];
const STATUS_OPTIONS = [
  "ALL",
  "PENDING",
  "ACTIVE",
  "RESTRICTED",
  "UNACTIVE",
  "BLOCKED",
  "DELETED",
] as const;
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

const ROLE_BADGE_STYLES: Record<Role, string> = {
  ADMIN: "bg-brand-amber/15 text-brand-amber",
  PROVIDER: "bg-primary/10 text-primary",
  RECEIVER: "bg-brand-deep/10 text-brand-deep",
};

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

const PREFS_KEY = "rescuebite_admin_prefs";

type Prefs = { usersPageSize: number; listingsPageSize: number };

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return defaultPrefs;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return defaultPrefs;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      usersPageSize:
        typeof parsed.usersPageSize === "number" &&
        parsed.usersPageSize >= 5 &&
        parsed.usersPageSize <= 50
          ? parsed.usersPageSize
          : defaultPrefs.usersPageSize,
      listingsPageSize:
        typeof parsed.listingsPageSize === "number" &&
        parsed.listingsPageSize >= 4 &&
        parsed.listingsPageSize <= 24
          ? parsed.listingsPageSize
          : defaultPrefs.listingsPageSize,
    };
  } catch {
    return defaultPrefs;
  }
}

const defaultPrefs: Prefs = { usersPageSize: 10, listingsPageSize: 8 };

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0] ?? {});
  const escapeCell = (value: unknown) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(",")),
  ].join("\n");
}

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function BarList({
  items,
}: {
  items: Array<{ label: string; value: number; color: string }>;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <div className="grid gap-2.5">
      {items.map((item) => (
        <div key={item.label} className="grid gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">{item.label}</span>
            <span className="font-bold text-foreground">{item.value}</span>
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
        aria-label="Category distribution chart"
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

export function AdminDashboardView() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState<AdminTab>("overview");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [listingsError, setListingsError] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  // Initial guard + shared data load. Only admins may view this page.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setPhase("loading");
      if (!getAccessToken()) {
        router.replace("/login");
        return;
      }
      try {
        const [me, dashboard, allListings, usersHead] = await Promise.all([
          api("/users/me") as Promise<MeResponse>,
          api("/admin/dashboard") as Promise<AdminStatsResponse>,
          api("/food-listings").catch(
            () => null,
          ) as Promise<ListingsResponse | null>,
          api("/admin/users?page=1&limit=1").catch(
            () => null,
          ) as Promise<AdminUsersResponse | null>,
        ]);
        if (cancelled) return;
        if (me.data.role !== "ADMIN") {
          router.replace("/");
          return;
        }
        setUserName(me.data.name);
        setUserEmail(me.data.email);
        setStats(dashboard.data);
        setListings(Array.isArray(allListings?.data) ? allListings.data : []);
        if (!allListings) {
          setListingsError("Listing analytics are unavailable right now.");
        }
        setTotalUsers(usersHead?.meta.total ?? 0);
        setPhase("ready");
      } catch (error) {
        if (cancelled) return;
        const message = getErrorMessage(error);
        if (
          /authentication required|invalid or expired token|unauthorized|forbidden|access denied/i.test(
            message,
          )
        ) {
          clearTokens();
          router.replace("/login");
          return;
        }
        setLoadError(message);
        setPhase("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  function updatePrefs(next: Prefs) {
    setPrefs(next);
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable — prefs still apply for this session
    }
  }

  const statusBreakdown = useMemo(
    () =>
      LISTING_STATUSES.map((status, index) => ({
        label: formatLabel(status),
        value: listings.filter((item) => item.status === status).length,
        color: CHART_COLORS[index % CHART_COLORS.length] ?? "#475569",
      })),
    [listings],
  );

  const categoryBreakdown = useMemo(
    () =>
      LISTING_CATEGORIES.map((category, index) => ({
        label: formatLabel(category),
        value: listings.filter((item) => item.category === category).length,
        color: CHART_COLORS[index % CHART_COLORS.length] ?? "#475569",
      })),
    [listings],
  );

  const roleBreakdown = useMemo(() => {
    if (!stats) return [];
    const adminCount = Math.max(
      0,
      totalUsers - stats.totalProviders - stats.totalReceivers,
    );
    return [
      { label: "Providers", value: stats.totalProviders, color: "#0f3d2e" },
      { label: "Receivers", value: stats.totalReceivers, color: "#0284c7" },
      { label: "Admins", value: adminCount, color: "#d97706" },
    ];
  }, [stats, totalUsers]);

  const recentListings = useMemo(
    () =>
      [...listings]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [listings],
  );

  if (phase === "error") {
    return (
      <div className="flex flex-1 flex-col">
        <section className="bg-brand-deep text-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-amber uppercase">
              Admin dashboard
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
                <CardTitle>We couldn&apos;t load the dashboard</CardTitle>
                <CardDescription>
                  {loadError || "Please try again in a moment."}
                </CardDescription>
              </CardHeader>
              <CardFooter className="justify-end">
                <Button onClick={() => window.location.reload()}>
                  Try again
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (phase === "loading" || !stats) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Providers",
      value: stats.totalProviders,
      hint: "Registered food providers",
      icon: Store,
    },
    {
      label: "Receivers",
      value: stats.totalReceivers,
      hint: "Registered food receivers",
      icon: Users,
    },
    {
      label: "Active listings",
      value: stats.activeListings,
      hint: "Available for reservation",
      icon: Package,
    },
    {
      label: "Completed pickups",
      value: stats.completedReservations,
      hint: "Reservations completed",
      icon: TicketCheck,
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <section className="bg-brand-deep text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-amber uppercase">
            Admin dashboard
          </p>
          <h1 className="font-heading mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {userName ? `Welcome back, ${userName}` : "Welcome back"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/70 sm:text-base">
            Monitor marketplace activity, manage resources, export reports, and
            tune your workspace.
          </p>
          <div
            role="tablist"
            aria-label="Admin sections"
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
        {tab === "overview" && (
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((stat) => (
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

            {listingsError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {listingsError}
              </p>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Listings by status</CardTitle>
                  <CardDescription>
                    {listings.length} total listings across every stage.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BarList items={statusBreakdown} />
                </CardContent>
              </Card>
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Listings by category</CardTitle>
                  <CardDescription>
                    Where surplus food is coming from.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DonutChart items={categoryBreakdown} />
                </CardContent>
              </Card>
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Users by role</CardTitle>
                  <CardDescription>
                    {totalUsers} registered users in total.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BarList items={roleBreakdown} />
                </CardContent>
              </Card>
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Recent listings</CardTitle>
                  <CardDescription>
                    The latest surplus food shared on the marketplace.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {recentListings.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No listings yet.
                    </p>
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
                            {item.quantity} {item.unit} ·{" "}
                            {formatLabel(item.category)}
                          </p>
                        </div>
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
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {tab === "resources" && (
          <ResourcesSection
            listings={listings}
            listingsPageSize={prefs.listingsPageSize}
            usersPageSize={prefs.usersPageSize}
          />
        )}

        {tab === "reports" && (
          <ReportsSection
            stats={stats}
            totalUsers={totalUsers}
            listings={listings}
          />
        )}

        {tab === "settings" && (
          <SettingsSection
            initialName={userName}
            email={userEmail}
            prefs={prefs}
            onPrefsChange={updatePrefs}
          />
        )}
      </main>
    </div>
  );
}

function ResourcesSection({
  listings,
  listingsPageSize,
  usersPageSize,
}: {
  listings: FoodListing[];
  listingsPageSize: number;
  usersPageSize: number;
}) {
  const [resourceTab, setResourceTab] = useState<ResourceTab>("users");

  return (
    <div className="grid gap-4">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Resources"
      >
        {(
          [
            { id: "users", label: "Users", icon: Users },
            { id: "listings", label: "Food listings", icon: Package },
          ] as const
        ).map((item) => (
          <Button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={resourceTab === item.id}
            variant={resourceTab === item.id ? "default" : "outline"}
            onClick={() => setResourceTab(item.id)}
          >
            <item.icon />
            {item.label}
          </Button>
        ))}
      </div>

      {resourceTab === "users" ? (
        <UsersManager key={`users-${usersPageSize}`} pageSize={usersPageSize} />
      ) : (
        <ListingsManager
          key={`listings-${listingsPageSize}`}
          listings={listings}
          pageSize={listingsPageSize}
        />
      )}
    </div>
  );
}

function UsersManager({ pageSize }: { pageSize: number }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | Role>("ALL");
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_OPTIONS)[number]>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [roleDrafts, setRoleDrafts] = useState<Record<string, Role>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [rowMessage, setRowMessage] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearchTerm(searchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(pageSize),
        });
        if (searchTerm) params.set("searchTerm", searchTerm);
        if (roleFilter !== "ALL") params.set("role", roleFilter);
        if (statusFilter !== "ALL") params.set("status", statusFilter);
        const response = (await api(
          `/admin/users?${params.toString()}`,
        )) as AdminUsersResponse;
        if (cancelled) return;
        setUsers(response.data);
        setTotal(response.meta.total);
        setTotalPages(Math.max(1, response.meta.totalPages));
        setRoleDrafts((prev) => {
          const next = { ...prev };
          for (const user of response.data) {
            if (!next[user.id]) next[user.id] = user.role;
          }
          return next;
        });
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err, "Unable to load users."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadUsers();
    return () => {
      cancelled = true;
    };
  }, [page, searchTerm, roleFilter, statusFilter, pageSize]);

  async function handleRoleSave(user: AdminUser) {
    const nextRole = roleDrafts[user.id] ?? user.role;
    if (nextRole === user.role) return;
    setSavingId(user.id);
    setRowMessage((prev) => ({ ...prev, [user.id]: "" }));
    try {
      const updated = (await api(`/admin/users/${user.id}/role`, {
        method: "PATCH",
        body: { role: nextRole },
      })) as { data: AdminUser };
      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, role: updated.data.role } : item,
        ),
      );
      setRowMessage((prev) => ({ ...prev, [user.id]: "Role updated." }));
    } catch (err) {
      setRowMessage((prev) => ({
        ...prev,
        [user.id]: getErrorMessage(err, "Unable to update role."),
      }));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          User management
        </CardTitle>
        <CardDescription>
          Search, filter, and update user roles. Role changes take effect on the
          user&apos;s next sign-in.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_160px_160px]">
          <div className="grid gap-1.5">
            <Label htmlFor="admin-user-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-user-search"
                placeholder="Search by name or email"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="admin-role-filter">Role</Label>
            <select
              id="admin-role-filter"
              value={roleFilter}
              onChange={(e) => {
                setPage(1);
                setRoleFilter(e.target.value as "ALL" | Role);
              }}
              className="h-8 rounded-none border border-input bg-background px-2.5 text-xs font-medium outline-none focus-visible:border-ring"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role === "ALL" ? "All roles" : role}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="admin-status-filter">Status</Label>
            <select
              id="admin-status-filter"
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(
                  e.target.value as (typeof STATUS_OPTIONS)[number],
                );
              }}
              className="h-8 rounded-none border border-input bg-background px-2.5 text-xs font-medium outline-none focus-visible:border-ring"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All statuses" : formatLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-6 text-center">
            <p className="text-sm font-medium text-foreground">
              No users found
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a different search term or filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {users.map((user) => {
              const draft = roleDrafts[user.id] ?? user.role;
              const dirty = draft !== user.role;
              const saving = savingId === user.id;
              return (
                <div
                  key={user.id}
                  className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className={cn(
                          "rounded-sm px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                          ROLE_BADGE_STYLES[user.role],
                        )}
                      >
                        {user.role}
                      </span>
                      <span className="rounded-sm bg-muted px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                        {user.status}
                      </span>
                      {!user.emailVerified && (
                        <span className="rounded-sm bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-destructive uppercase">
                          Unverified
                        </span>
                      )}
                    </div>
                    {rowMessage[user.id] && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {rowMessage[user.id]}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={draft}
                      onChange={(e) =>
                        setRoleDrafts((prev) => ({
                          ...prev,
                          [user.id]: e.target.value as Role,
                        }))
                      }
                      disabled={saving}
                      aria-label={`Role for ${user.email}`}
                      className="h-8 rounded-none border border-input bg-background px-2 text-xs font-medium outline-none focus-visible:border-ring disabled:opacity-50"
                    >
                      {EDITABLE_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant={dirty ? "default" : "outline"}
                      disabled={!dirty || saving}
                      onClick={() => handleRoleSave(user)}
                    >
                      {saving && <Loader2 className="animate-spin" />}
                      Save
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <CardFooter className="items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {total} user{total === 1 ? "" : "s"} · Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft />
            Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next page"
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function ListingsManager({
  listings,
  pageSize,
}: {
  listings: FoodListing[];
  pageSize: number;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sort, setSort] = useState<"newest" | "priceAsc" | "priceDesc">(
    "newest",
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearchTerm(searchInput.trim().toLowerCase());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filtered = useMemo(() => {
    const result = listings.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (categoryFilter !== "ALL" && item.category !== categoryFilter)
        return false;
      if (
        searchTerm &&
        !`${item.foodName} ${item.description} ${item.pickupLocation}`
          .toLowerCase()
          .includes(searchTerm)
      )
        return false;
      return true;
    });
    return [...result].sort((a, b) => {
      if (sort === "priceAsc") return a.price - b.price;
      if (sort === "priceDesc") return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [listings, searchTerm, statusFilter, categoryFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="size-4 text-primary" />
          Food listings
        </CardTitle>
        <CardDescription>
          Marketplace-wide oversight with search, filters, and sorting. Listing
          edits and deletions are owned by their providers.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_150px_150px_150px]">
          <div className="grid gap-1.5">
            <Label htmlFor="admin-listing-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-listing-search"
                placeholder="Name, description, or pickup"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="admin-listing-status">Status</Label>
            <select
              id="admin-listing-status"
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
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
          <div className="grid gap-1.5">
            <Label htmlFor="admin-listing-category">Category</Label>
            <select
              id="admin-listing-category"
              value={categoryFilter}
              onChange={(e) => {
                setPage(1);
                setCategoryFilter(e.target.value);
              }}
              className="h-8 rounded-none border border-input bg-background px-2.5 text-xs font-medium outline-none focus-visible:border-ring"
            >
              <option value="ALL">All categories</option>
              {LISTING_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {formatLabel(category)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="admin-listing-sort">Sort</Label>
            <select
              id="admin-listing-sort"
              value={sort}
              onChange={(e) => {
                setPage(1);
                setSort(e.target.value as typeof sort);
              }}
              className="h-8 rounded-none border border-input bg-background px-2.5 text-xs font-medium outline-none focus-visible:border-ring"
            >
              <option value="newest">Newest first</option>
              <option value="priceAsc">Price: low to high</option>
              <option value="priceDesc">Price: high to low</option>
            </select>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-6 text-center">
            <p className="text-sm font-medium text-foreground">
              No listings match
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a different search term or filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {visible.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {item.foodName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.quantity} {item.unit} · ${item.price.toFixed(2)} ·{" "}
                    {formatLabel(item.category)} · {item.pickupLocation}
                  </p>
                  <div className="mt-1.5">
                    <span
                      className={cn(
                        "rounded-sm px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                        STATUS_STYLES[item.status] ??
                          "bg-muted text-muted-foreground",
                      )}
                    >
                      {formatLabel(item.status)}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href={`/browse/${item.id}`} />}
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {filtered.length} listing{filtered.length === 1 ? "" : "s"} · Page{" "}
          {safePage} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft />
            Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next page"
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function ReportsSection({
  stats,
  totalUsers,
  listings,
}: {
  stats: AdminStats;
  totalUsers: number;
  listings: FoodListing[];
}) {
  const [exporting, setExporting] = useState<
    "users" | "listings" | "summary" | null
  >(null);
  const [message, setMessage] = useState("");

  const totalValue = useMemo(
    () =>
      listings.reduce(
        (sum, item) => sum + item.price * (Number(item.quantity) || 0),
        0,
      ),
    [listings],
  );

  async function handleExportUsers() {
    setExporting("users");
    setMessage("");
    try {
      const rows: Array<Record<string, unknown>> = [];
      let page = 1;
      const limit = 100;
      for (;;) {
        const response = (await api(
          `/admin/users?page=${page}&limit=${limit}`,
        )) as AdminUsersResponse;
        rows.push(
          ...response.data.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
          })),
        );
        if (page >= response.meta.totalPages || rows.length >= 2000) break;
        page += 1;
      }
      if (rows.length === 0) {
        setMessage("No users to export.");
        return;
      }
      downloadCsv("rescuebite-users.csv", rows);
      setMessage(`Exported ${rows.length} users to rescuebite-users.csv.`);
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to export users."));
    } finally {
      setExporting(null);
    }
  }

  function handleExportListings() {
    setExporting("listings");
    setMessage("");
    try {
      if (listings.length === 0) {
        setMessage("No listings to export.");
        return;
      }
      downloadCsv(
        "rescuebite-listings.csv",
        listings.map((item) => ({
          id: item.id,
          foodName: item.foodName,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          status: item.status,
          pickupLocation: item.pickupLocation,
          createdAt: item.createdAt,
        })),
      );
      setMessage(
        `Exported ${listings.length} listings to rescuebite-listings.csv.`,
      );
    } finally {
      setExporting(null);
    }
  }

  function handleExportSummary() {
    setExporting("summary");
    setMessage("");
    try {
      downloadCsv("rescuebite-summary.csv", [
        {
          totalUsers,
          totalProviders: stats.totalProviders,
          totalReceivers: stats.totalReceivers,
          totalListings: listings.length,
          activeListings: stats.activeListings,
          completedReservations: stats.completedReservations,
          listingsValue: totalValue.toFixed(2),
          exportedAt: new Date().toISOString(),
        },
      ]);
      setMessage("Exported platform summary to rescuebite-summary.csv.");
    } finally {
      setExporting(null);
    }
  }

  const summaryCards = [
    { label: "Total users", value: totalUsers },
    { label: "Total listings", value: listings.length },
    { label: "Active listings", value: stats.activeListings },
    { label: "Completed pickups", value: stats.completedReservations },
    { label: "Providers", value: stats.totalProviders },
    { label: "Receivers", value: stats.totalReceivers },
  ];

  const exports: Array<{
    id: "users" | "listings" | "summary";
    title: string;
    description: string;
    action: () => void | Promise<void>;
  }> = [
    {
      id: "users",
      title: "Users report",
      description: "Every registered user with role, status, and signup date.",
      action: handleExportUsers,
    },
    {
      id: "listings",
      title: "Listings report",
      description: "Every food listing with category, price, and status.",
      action: handleExportListings,
    },
    {
      id: "summary",
      title: "Platform summary",
      description: "One-row snapshot of marketplace health for stakeholders.",
      action: handleExportSummary,
    },
  ];

  return (
    <div className="grid gap-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Platform snapshot</CardTitle>
          <CardDescription>
            Key figures for stakeholder updates, as of right now.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="rounded-md border border-border p-3"
              >
                <dt className="text-[11px] font-medium text-muted-foreground">
                  {card.label}
                </dt>
                <dd className="mt-1 text-2xl font-bold text-foreground">
                  {card.value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {exports.map((item) => (
          <Card key={item.id} className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Download className="size-4 text-primary" />
                {item.title}
              </CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                className="w-full"
                variant="outline"
                disabled={exporting !== null}
                onClick={() => void item.action()}
              >
                {exporting === item.id && <Loader2 className="animate-spin" />}
                {exporting === item.id ? "Exporting..." : "Export CSV"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {message && (
        <p className="rounded-md bg-muted px-3 py-2 text-xs text-foreground">
          {message}
        </p>
      )}
    </div>
  );
}

function SettingsSection({
  initialName,
  email,
  prefs,
  onPrefsChange,
}: {
  initialName: string;
  email: string;
  prefs: Prefs;
  onPrefsChange: (prefs: Prefs) => void;
}) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  async function handleSaveProfile() {
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
      setName(response.data.name);
      setFormSuccess("Your profile was updated successfully.");
    } catch (error) {
      setFormError(getErrorMessage(error, "Unable to update your profile."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Admin profile</CardTitle>
          <CardDescription>
            Signed in as {email}. This is the name shown across the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="admin-settings-name">Display name</Label>
            <Input
              id="admin-settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={10}
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
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Workspace preferences</CardTitle>
          <CardDescription>
            Stored in this browser only. Changing a page size resets the current
            list to page one.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="admin-pref-users">Users per page</Label>
            <select
              id="admin-pref-users"
              value={prefs.usersPageSize}
              onChange={(e) =>
                onPrefsChange({
                  ...prefs,
                  usersPageSize: Number(e.target.value),
                })
              }
              className="h-8 rounded-none border border-input bg-background px-2.5 text-xs font-medium outline-none focus-visible:border-ring"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} users
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="admin-pref-listings">Listings per page</Label>
            <select
              id="admin-pref-listings"
              value={prefs.listingsPageSize}
              onChange={(e) =>
                onPrefsChange({
                  ...prefs,
                  listingsPageSize: Number(e.target.value),
                })
              }
              className="h-8 rounded-none border border-input bg-background px-2.5 text-xs font-medium outline-none focus-visible:border-ring"
            >
              {[4, 8, 12, 24].map((size) => (
                <option key={size} value={size}>
                  {size} listings
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
