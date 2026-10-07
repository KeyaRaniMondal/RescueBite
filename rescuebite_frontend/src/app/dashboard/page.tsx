import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/receiver/dashboard-page-shell";

export const metadata: Metadata = {
  title: "My Dashboard | RescueBite",
  description:
    "Track your rescued food, bookings, and pickup activity on RescueBite.",
};

export default function DashboardPage() {
  return <DashboardPageShell view="activity" />;
}
