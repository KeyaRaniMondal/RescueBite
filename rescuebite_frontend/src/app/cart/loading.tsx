import { PageShellSkeleton, RowsSkeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <PageShellSkeleton>
      <RowsSkeleton count={4} />
    </PageShellSkeleton>
  );
}
