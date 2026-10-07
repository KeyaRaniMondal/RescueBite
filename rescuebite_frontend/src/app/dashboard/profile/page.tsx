import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/receiver/dashboard-page-shell";

export const metadata: Metadata = {
  title: "Profile & Settings | RescueBite",
  description: "Manage your RescueBite profile and contact details.",
};

export default function DashboardProfilePage() {
  return <DashboardPageShell view="profile" />;
}
