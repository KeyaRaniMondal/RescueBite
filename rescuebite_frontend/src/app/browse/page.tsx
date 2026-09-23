import type { Metadata } from "next";
import { BrowseView } from "@/components/browse/browse-view";

export const metadata: Metadata = {
  title: "Browse Food | RescueBite",
  description:
    "Find surplus food near you — fresh, free, and ready to pick up from local restaurants, bakeries, and grocery stores.",
};

export default function BrowsePage() {
  return <BrowseView />;
}
