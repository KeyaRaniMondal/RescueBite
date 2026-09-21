import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata: Metadata = {
  title: "About | RescueBite",
  description:
    "RescueBite connects restaurants, bakeries, and grocery stores with neighbors who can use their surplus food — before it goes to waste.",
};

export default function AboutPage() {
  return (
    <PagePlaceholder
      title="Good food deserves a second chance"
      description="RescueBite is on a mission to end food waste, one rescued meal at a time. Restaurants, bakeries, and grocery stores share their surplus — and neighbors like you rescue it before it hits the bin. More about our story is on the way."
    />
  );
}
