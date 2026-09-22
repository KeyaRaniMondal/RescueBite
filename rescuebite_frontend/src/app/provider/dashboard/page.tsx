import type { Metadata } from "next";
import { ProviderDashboardView } from "@/components/provider/provider-dashboard-view";

export const metadata: Metadata = {
  title: "Provider Dashboard | RescueBite",
  description:
    "Manage your surplus food listings, track reservations, and keep your business profile up to date.",
};

export default function ProviderDashboardPage() {
  return <ProviderDashboardView />;
}
