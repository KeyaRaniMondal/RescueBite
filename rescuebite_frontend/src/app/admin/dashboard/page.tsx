import type { Metadata } from "next";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";

export const metadata: Metadata = {
  title: "Admin Dashboard | RescueBite",
  description:
    "Monitor marketplace activity and manage user roles on RescueBite.",
};

export default function AdminDashboardPage() {
  return <AdminDashboardView />;
}
