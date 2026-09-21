import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "Browse Food | RescueBite",
  description:
    "Find surplus food near you — fresh, free, and ready to pick up from local restaurants, bakeries, and grocery stores.",
};

export default function BrowsePage() {
  return (
    <PagePlaceholder
      title="Surplus food, near you"
      description="The RescueBite marketplace is coming soon. Soon you'll be able to browse fresh surplus meals, snacks, and groceries from local providers — free to pick up, close to home."
    />
  );
}
