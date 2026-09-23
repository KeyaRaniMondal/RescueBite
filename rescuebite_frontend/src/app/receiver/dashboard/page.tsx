import type { Metadata } from "next";
import { ReceiverDashboardView } from "@/components/receiver/receiver-dashboard-view";

export const metadata: Metadata = {
  title: "My Dashboard | RescueBite",
  description:
    "View and update your personal information, and keep track of your rescued food.",
};

export default function ReceiverDashboardPage() {
  return <ReceiverDashboardView />;
}
