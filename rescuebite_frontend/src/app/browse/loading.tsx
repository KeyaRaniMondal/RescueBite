import {
  ListingGridSkeleton,
  PageShellSkeleton,
  Skeleton,
} from "@/components/ui/skeleton";

export default function BrowseLoading() {
  return (
    <PageShellSkeleton>
      <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
        <Skeleton className="h-8 w-full rounded-none" />
        <Skeleton className="h-8 w-full rounded-none" />
      </div>
      <div className="mt-6">
        <ListingGridSkeleton />
      </div>
    </PageShellSkeleton>
  );
}
