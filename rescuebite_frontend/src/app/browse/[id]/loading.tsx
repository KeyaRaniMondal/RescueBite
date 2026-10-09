import { DetailSkeleton } from "@/components/ui/skeleton";

export default function BrowseDetailLoading() {
  return (
    <div className="flex flex-1 flex-col">
      <DetailSkeleton />
    </div>
  );
}
