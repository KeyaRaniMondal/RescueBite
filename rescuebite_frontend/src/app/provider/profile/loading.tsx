import { FormSkeleton, PageShellSkeleton } from "@/components/ui/skeleton";

export default function ProviderProfileLoading() {
  return (
    <PageShellSkeleton>
      <FormSkeleton fields={5} />
    </PageShellSkeleton>
  );
}
