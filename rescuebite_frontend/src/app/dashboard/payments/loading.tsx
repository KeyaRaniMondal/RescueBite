import {
  PageShellSkeleton,
  RowsSkeleton,
  StatCardsSkeleton,
} from "@/components/ui/skeleton";

export default function DashboardPaymentsLoading() {
  return (
    <PageShellSkeleton heroTabs>
      <div className="grid gap-4">
        <StatCardsSkeleton count={3} />
        <RowsSkeleton count={5} />
      </div>
    </PageShellSkeleton>
  );
}
