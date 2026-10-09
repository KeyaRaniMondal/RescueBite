import { FormSkeleton, PageShellSkeleton } from "@/components/ui/skeleton";

export default function DashboardProfileLoading() {
  return (
    <PageShellSkeleton heroTabs>
      <FormSkeleton />
    </PageShellSkeleton>
  );
}
