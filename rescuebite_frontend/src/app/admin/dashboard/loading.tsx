import {
  PageShellSkeleton,
  RowsSkeleton,
  StatCardsSkeleton,
} from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <PageShellSkeleton heroTabs>
      <div className="grid gap-4">
        <StatCardsSkeleton />
        <RowsSkeleton count={6} />
      </div>
    </PageShellSkeleton>
  );
}
