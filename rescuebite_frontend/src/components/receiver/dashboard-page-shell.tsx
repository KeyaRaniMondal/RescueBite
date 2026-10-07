"use client";

import { Loader2 } from "lucide-react";
import { ActivityView } from "@/components/receiver/activity-view";
import { DashboardHero } from "@/components/receiver/dashboard-hero";
import { PaymentsView } from "@/components/receiver/payments-view";
import { ProfileFormView } from "@/components/receiver/profile-form-view";
import { useReceiver } from "@/components/receiver/use-receiver";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardPageShell({
  view,
}: {
  view: "activity" | "profile" | "payments";
}) {
  const { phase, profile, setProfile, loadError, reload } = useReceiver();

  if (phase === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (phase === "error" || !profile) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>We couldn&apos;t load your dashboard</CardTitle>
            <CardDescription>
              {loadError || "Please try again in a moment."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-end">
            <Button onClick={reload}>Try again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <DashboardHero profile={profile}>
      {view === "activity" && <ActivityView />}
      {view === "profile" && (
        <ProfileFormView profile={profile} onUpdated={setProfile} />
      )}
      {view === "payments" && <PaymentsView />}
    </DashboardHero>
  );
}
