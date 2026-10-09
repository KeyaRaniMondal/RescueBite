import {
  PageShellSkeleton,
  RowsSkeleton,
  StatCardsSkeleton,
} from "@/components/ui/skeleton";

export default function ProviderDashboardLoading() {
  return (
    <PageShellSkeleton heroTabs>
      <div className="grid gap-4">
        <StatCardsSkeleton count={3} />
        <RowsSkeleton count={4} />
      </div>
    </PageShellSkeleton>
  );
}
