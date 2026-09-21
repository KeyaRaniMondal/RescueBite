"use client";

import {
  ArrowRight,
  BadgeCheck,
  Loader2,
  MapPin,
  Phone,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BUSINESS_TYPE_LABELS,
  type ProviderProfile,
  ProviderProfileForm,
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

type Phase = "loading" | "error" | "form" | "done";

export function ProviderProfileView() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [loadError, setLoadError] = useState("");
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [userName, setUserName] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reloadKey intentionally re-runs the profile check.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setPhase("loading");
      if (!getAccessToken()) {
        router.replace("/login");
        return;
      }
      try {
        const response = (await api("/users/me")) as MeResponse;
        if (cancelled) return;

        if (response.data.role !== "PROVIDER") {
          router.replace("/");
          return;
        }

        setUserName(response.data.name);
        if (response.data.provider) {
          setProfile(response.data.provider);
          setPhase("done");
        } else {
          setPhase("form");
        }
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

  function handleCreated(created: ProviderProfile) {
    setProfile(created);
    setPhase("done");
  }

  function handleAlreadyExists() {
    setReloadKey((key) => key + 1);
  }

  function handleRetry() {
    setLoadError("");
    setReloadKey((key) => key + 1);
  }

  return (
    <div className="flex flex-1 flex-col">
      <section className="bg-brand-deep text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-amber uppercase">
            Provider onboarding
          </p>
          <h1 className="font-heading mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {phase === "done"
              ? "You're all set"
              : "Set up your provider profile"}
          </h1>
          {phase === "form" && (
            <p className="mt-2 max-w-xl text-sm text-white/70 sm:text-base">
              Tell neighbors a little about your business so they know what to
              expect when they pick up your surplus food.
            </p>
          )}
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {phase === "loading" && (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {phase === "error" && (
          <div className="flex justify-center">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>Something went wrong</CardTitle>
                <CardDescription>
                  {loadError ||
                    "We couldn't load your account. Please try again."}
                </CardDescription>
              </CardHeader>
              <CardFooter className="justify-end">
                <Button onClick={handleRetry}>Try again</Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {phase === "form" && (
          <div className="flex justify-center">
            <ProviderProfileForm
              onCreated={handleCreated}
              onAlreadyExists={handleAlreadyExists}
            />
          </div>
        )}

        {phase === "done" && profile && (
          <div className="flex justify-center">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BadgeCheck className="size-5 text-primary" />
                  Profile created
                </CardTitle>
                <CardDescription>
                  {userName ? `Welcome aboard, ${userName}! ` : ""}Your business
                  profile is live — neighbors can now find you in browse
                  results.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center gap-3 rounded-md border border-border p-3">
                  <div className="flex size-10 shrink-0 items-center justify-center bg-primary/10 text-primary">
                    <Store className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {profile.businessName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {BUSINESS_TYPE_LABELS[profile.businessType]} ·{" "}
                      {profile.city}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "ml-auto shrink-0 rounded-sm px-2 py-1 text-[10px] font-semibold tracking-wide uppercase",
                      profile.isVerified
                        ? "bg-primary/10 text-primary"
                        : "bg-brand-amber/10 text-brand-amber",
                    )}
                  >
                    {profile.isVerified ? "Verified" : "Pending verification"}
                  </span>
                </div>

                <ul className="grid gap-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <MapPin className="size-3.5 shrink-0" />
                    {profile.address}
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="size-3.5 shrink-0" />
                    {profile.phone}
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-2">
                <Button size="lg" className="w-full" render={<Link href="/" />}>
                  Go to homepage
                  <ArrowRight />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  render={<Link href="/browse" />}
                >
                  Browse food listings
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
