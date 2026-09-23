"use client";

import {
  BadgeCheck,
  CalendarCheck,
  Camera,
  Loader2,
  Mail,
  Package,
  Phone,
  TicketCheck,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
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

type ReceiverProfile = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "PROVIDER" | "RECEIVER";
  status: string;
  emailVerified: boolean;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  customer: { id: string; contactNumber: string | null } | null;
};

type MeResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: ReceiverProfile;
};

type Reservation = {
  id: string;
  foodName: string;
  quantity: number;
  status: "RESERVED" | "CANCELLED" | "COMPLETED" | "EXPIRED";
  pickupLocation: string;
  createdAt: string;
};

type MyReservationsResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: Reservation[];
};

type Phase = "loading" | "ready" | "error";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function initialsOf(name: string): string {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "RB"
  );
}

export function ReceiverDashboardView() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [loadError, setLoadError] = useState("");
  const [profile, setProfile] = useState<ReceiverProfile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    contactNumber?: string;
    photo?: string;
  }>({});
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reloadKey intentionally re-runs the load.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setPhase("loading");
      if (!getAccessToken()) {
        router.replace("/login");
        return;
      }
      try {
        const [me, myReservations] = await Promise.all([
          api("/users/me") as Promise<MeResponse>,
          api("/reservations/my").catch(
            () => null,
          ) as Promise<MyReservationsResponse | null>,
        ]);
        if (cancelled) return;

        if (me.data.role === "PROVIDER") {
          router.replace("/provider/dashboard");
          return;
        }
        if (me.data.role !== "RECEIVER") {
          router.replace("/");
          return;
        }

        setProfile(me.data);
        setName(me.data.name);
        setContactNumber(me.data.customer?.contactNumber ?? "");
        setReservations(
          Array.isArray(myReservations?.data) ? myReservations.data : [],
        );
        setPhase("ready");
      } catch (error) {
        if (cancelled) return;
        const message = getErrorMessage(error);
        if (
          /authentication required|invalid or expired token|unauthorized/i.test(
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
  }, [router, reloadKey]);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  if (phase === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (phase === "error" || !profile) {
    return (
      <div className="flex flex-1 flex-col">
        <section className="bg-brand-deep text-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-amber uppercase">
              Receiver dashboard
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

  const activeReservations = reservations.filter(
    (item) => item.status === "RESERVED",
  ).length;
  const completedReservations = reservations.filter(
    (item) => item.status === "COMPLETED",
  ).length;
  const mealsRescued = reservations
    .filter((item) => item.status !== "CANCELLED")
    .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const stats = [
    {
      label: "Total reservations",
      value: reservations.length,
      hint: "Food you've claimed",
      icon: Package,
    },
    {
      label: "Active pickups",
      value: activeReservations,
      hint: "Ready to collect",
      icon: CalendarCheck,
    },
    {
      label: "Completed",
      value: completedReservations,
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

  const recentReservations = reservations.slice(0, 5);
  const avatarSrc = photoPreview || profile.imageUrl || null;

  const dirty =
    name.trim() !== profile.name ||
    contactNumber.trim() !== (profile.customer?.contactNumber ?? "") ||
    photo !== null;

  function validateForm(): boolean {
    const errors: typeof fieldErrors = {};
    const trimmedName = name.trim();
    if (!trimmedName) errors.name = "Name is required";
    else if (trimmedName.length < 3)
      errors.name = "Name must be at least 3 characters long";
    else if (trimmedName.length > 10)
      errors.name = "Name must be at most 10 characters long";

    const trimmedContact = contactNumber.trim();
    if (trimmedContact && trimmedContact.length > 30)
      errors.contactNumber = "Contact number is too long";

    if (photo) {
      if (!ALLOWED_IMAGE_TYPES.includes(photo.type))
        errors.photo =
          "Only image files (JPEG, PNG, WEBP, GIF, AVIF, SVG) are allowed";
      else if (photo.size > MAX_IMAGE_BYTES)
        errors.photo = "Photo must be smaller than 5MB";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!validateForm()) return;
    if (!dirty) {
      setFormError("No changes to save yet.");
      return;
    }

    setSaving(true);
    try {
      let body: Record<string, string> | FormData;
      if (photo) {
        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("contactNumber", contactNumber.trim());
        formData.append("file", photo);
        body = formData;
      } else {
        body = {
          name: name.trim(),
          contactNumber: contactNumber.trim(),
        };
      }

      const response = (await api("/users/me", {
        method: "PATCH",
        body,
      })) as MeResponse;

      setProfile(response.data);
      setName(response.data.name);
      setContactNumber(response.data.customer?.contactNumber ?? "");
      setPhoto(null);
      setFormSuccess("Your profile was updated successfully.");
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          "Unable to update your profile. Please try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <section className="bg-brand-deep text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-lg font-bold">
                {avatarSrc ? (
                  // biome-ignore lint/performance/noImgElement: backend returns remote URLs; next/image remote config not set up.
                  <img
                    src={avatarSrc}
                    alt={`${profile.name}'s profile`}
                    className="size-full object-cover"
                  />
                ) : (
                  initialsOf(profile.name)
                )}
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-brand-amber uppercase">
                  Receiver dashboard
                </p>
                <h1 className="font-heading mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  Welcome back, {profile.name}
                </h1>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white/70">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    {profile.email}
                  </span>
                  {profile.emailVerified && (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                      <BadgeCheck className="size-3" />
                      Verified
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-brand-amber text-brand-deep hover:bg-brand-amber/90"
              render={<Link href="/browse" />}
            >
              Browse food
            </Button>
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
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="size-4 text-primary" />
                Personal information
              </CardTitle>
              <CardDescription>
                Keep your details up to date so providers can reach you about
                pickups.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} noValidate>
              <CardContent className="grid gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-base font-bold text-foreground">
                    {avatarSrc ? (
                      // biome-ignore lint/performance/noImgElement: preview of local file or remote URL.
                      <img
                        src={avatarSrc}
                        alt="Profile preview"
                        className="size-full object-cover"
                      />
                    ) : (
                      initialsOf(name.trim() || profile.name)
                    )}
                  </div>
                  <Field label="Profile photo" error={fieldErrors.photo}>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                      <Camera className="size-4" />
                      {photo ? "Change photo" : "Upload photo"}
                      <input
                        type="file"
                        accept={ALLOWED_IMAGE_TYPES.join(",")}
                        className="sr-only"
                        onChange={(e) => {
                          setPhoto(e.target.files?.[0] ?? null);
                          setFieldErrors((prev) => ({
                            ...prev,
                            photo: undefined,
                          }));
                        }}
                      />
                    </label>
                    {photo && (
                      <span className="truncate text-xs text-muted-foreground">
                        {photo.name}
                      </span>
                    )}
                  </Field>
                </div>

                <Field
                  label="Name"
                  icon={<UserIcon className="size-4" />}
                  error={fieldErrors.name}
                >
                  <Input
                    autoComplete="name"
                    maxLength={10}
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    aria-invalid={Boolean(fieldErrors.name)}
                  />
                </Field>

                <Field label="Email" icon={<Mail className="size-4" />}>
                  <Input value={profile.email} disabled readOnly />
                </Field>

                <Field
                  label="Contact number"
                  icon={<Phone className="size-4" />}
                  error={fieldErrors.contactNumber}
                >
                  <Input
                    type="tel"
                    autoComplete="tel"
                    placeholder="+880 1XXX-XXXXXX"
                    value={contactNumber}
                    onChange={(e) => {
                      setContactNumber(e.target.value);
                      setFieldErrors((prev) => ({
                        ...prev,
                        contactNumber: undefined,
                      }));
                    }}
                    aria-invalid={Boolean(fieldErrors.contactNumber)}
                  />
                </Field>

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
              <CardFooter className="justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving || !dirty}
                  onClick={() => {
                    setName(profile.name);
                    setContactNumber(profile.customer?.contactNumber ?? "");
                    setPhoto(null);
                    setFieldErrors({});
                    setFormError("");
                    setFormSuccess("");
                  }}
                >
                  Reset
                </Button>
                <Button type="submit" size="lg" disabled={saving || !dirty}>
                  {saving && <Loader2 className="animate-spin" />}
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Recent reservations</CardTitle>
              <CardDescription>
                Your latest rescued food and pickup status.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {recentReservations.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-6 text-center">
                  <p className="text-sm font-medium text-foreground">
                    No reservations yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Browse surplus food near you and reserve your first pickup.
                  </p>
                  <Button
                    size="lg"
                    className="mt-4"
                    render={<Link href="/browse" />}
                  >
                    Find food
                  </Button>
                </div>
              ) : (
                recentReservations.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-md border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {item.foodName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        Qty {item.quantity} · {item.pickupLocation}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-sm bg-muted px-2 py-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {item.status}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
            {recentReservations.length > 0 && (
              <CardFooter className="justify-end">
                <Button variant="outline" render={<Link href="/browse" />}>
                  Browse more food
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

type FieldProps = {
  label: string;
  icon?: ReactNode;
  error?: string;
  children: ReactNode;
};

function Field({ label, icon, error, children }: FieldProps) {
  return (
    <div className="grid gap-1.5">
      <Label>
        {icon}
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
