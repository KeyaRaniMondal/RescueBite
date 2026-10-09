import {
  PageShellSkeleton,
  RowsSkeleton,
  StatCardsSkeleton,
} from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <PageShellSkeleton heroTabs>
      <div className="grid gap-4">
        <StatCardsSkeleton />
        <RowsSkeleton count={5} />
      </div>
    </PageShellSkeleton>
  );
}
