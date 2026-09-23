import type { Metadata } from "next";
import { BrowseDetailView } from "@/components/browse/browse-detail-view";

export const metadata: Metadata = {
  title: "Food Details | RescueBite",
  description: "View surplus food details and reserve your pickup.",
};

export default async function BrowseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <BrowseDetailView id={id} />
    </main>
  );
}
