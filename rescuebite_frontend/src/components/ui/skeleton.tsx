import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

/** Dark hero banner skeleton matching the dashboard/marketplace headers. */
export function HeroSkeleton({ tabs = false }: { tabs?: boolean }) {
  return (
    <section className="bg-brand-deep text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-3 w-36 animate-pulse rounded-sm bg-white/15" />
        <div className="mt-3 h-9 w-64 max-w-full animate-pulse rounded-md bg-white/15 sm:w-96" />
        <div className="mt-3 h-4 w-52 max-w-full animate-pulse rounded-sm bg-white/10 sm:w-80" />
        {tabs && (
          <div className="mt-6 flex flex-wrap gap-2">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-9 w-32 animate-pulse rounded-md bg-white/15"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function PageShellSkeleton({
  heroTabs = false,
  children,
}: {
  heroTabs?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <HeroSkeleton tabs={heroTabs} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => `stat-${i}`).map((key) => (
        <div
          key={key}
          className="flex items-center gap-3 rounded-md border border-border p-4"
        >
          <Skeleton className="size-10 shrink-0" />
          <div className="grid flex-1 gap-1.5">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-2">
      {Array.from({ length: count }, (_, i) => `row-${i}`).map((key) => (
        <div
          key={key}
          className="flex items-center gap-3 rounded-md border border-border p-3"
        >
          <Skeleton className="size-10 shrink-0" />
          <div className="grid flex-1 gap-1.5">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <Skeleton className="h-6 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => `listing-${i}`).map((key) => (
        <div
          key={key}
          className="overflow-hidden rounded-md border border-border"
        >
          <Skeleton className="h-40 w-full rounded-none" />
          <div className="grid gap-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex justify-between gap-2 pt-1">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-7 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
      <div className="overflow-hidden rounded-md border border-border lg:col-span-2">
        <Skeleton className="h-64 w-full rounded-none sm:h-80" />
        <div className="grid gap-2 p-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
      <div className="h-fit rounded-md border border-border p-4">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="mt-2 h-3 w-4/5" />
        <Skeleton className="mt-4 h-9 w-full" />
        <Skeleton className="mt-2 h-9 w-full" />
      </div>
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="flex justify-center">
      <div className="grid w-full max-w-2xl gap-4 rounded-md border border-border p-4 sm:p-6">
        <div className="grid gap-1.5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-64 max-w-full" />
        </div>
        {Array.from({ length: fields }, (_, i) => `field-${i}`).map((key) => (
          <div key={key} className="grid gap-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-full rounded-none" />
          </div>
        ))}
        <div className="flex justify-end">
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}
