import Link from "next/link";

import { Button } from "@/components/ui/button";

function getPageNumbers(current: number, total: number) {
  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);

  for (let page = current - 1; page <= current + 1; page += 1) {
    if (page > 1 && page < total) {
      pages.add(page);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export function CatalogPagination({
  current,
  total,
  query,
}: {
  current: number;
  total: number;
  query: Record<string, string | undefined>;
}) {
  if (total <= 1) {
    return null;
  }

  const pages = getPageNumbers(current, total);

  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    params.set("page", String(page));
    return `/catalog?${params.toString()}`;
  };

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="outline" asChild disabled={current <= 1}>
        <Link href={buildHref(Math.max(1, current - 1))}>Previous</Link>
      </Button>

      {pages.map((page) => (
        <Button
          key={page}
          variant={page === current ? "default" : "outline"}
          asChild
        >
          <Link href={buildHref(page)}>{page}</Link>
        </Button>
      ))}

      <Button variant="outline" asChild disabled={current >= total}>
        <Link href={buildHref(Math.min(total, current + 1))}>Next</Link>
      </Button>
    </div>
  );
}
