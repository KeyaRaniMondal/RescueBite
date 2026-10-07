import type { Metadata } from "next";
import { DashboardPageShell } from "@/components/receiver/dashboard-page-shell";

export const metadata: Metadata = {
  title: "Payments | RescueBite",
  description: "Review your RescueBite payment history and notifications.",
};

export default function DashboardPaymentsPage() {
  return <DashboardPageShell view="payments" />;
}
