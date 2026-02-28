import { Skeleton } from "@/components/ui/skeleton";

export default function CatalogLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-full rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="border-border/60 space-y-3 rounded-2xl border p-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <Skeleton key={index} className="h-72 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
