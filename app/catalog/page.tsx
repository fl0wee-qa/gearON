import { SearchX } from "lucide-react";

import { CatalogFilters } from "@/components/catalog/filters";
import { CatalogPagination } from "@/components/catalog/pagination";
import { SortSelect } from "@/components/catalog/sort-select";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { getCatalogData, type CatalogSearchParams } from "@/lib/catalog";

function takeSingle(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const params: CatalogSearchParams = {
    q: takeSingle(resolvedSearchParams.q),
    category: takeSingle(resolvedSearchParams.category),
    brand: takeSingle(resolvedSearchParams.brand),
    min: takeSingle(resolvedSearchParams.min),
    max: takeSingle(resolvedSearchParams.max),
    inStock: takeSingle(resolvedSearchParams.inStock),
    sort: takeSingle(resolvedSearchParams.sort),
    page: takeSingle(resolvedSearchParams.page),
  };

  const { products, total, page, totalPages, categories, brands } =
    await getCatalogData(params);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-black tracking-tight uppercase italic">
            Catalog
          </h1>
          <p className="text-muted-foreground text-sm">
            Search, filter, and sort products server-side.
          </p>
        </div>
        <Badge variant="secondary">{total} products</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="border-border/70 bg-card/60 space-y-3 rounded-2xl border p-4">
          <h2 className="text-sm font-bold tracking-[0.14em] uppercase">
            Filters
          </h2>
          <CatalogFilters
            categories={categories}
            brands={brands}
            current={params}
          />
        </aside>

        <section className="space-y-4">
          <div className="border-border/70 bg-card/50 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3">
            <p className="text-muted-foreground text-sm">
              {params.q ? (
                <>
                  Results for{" "}
                  <span className="text-foreground font-semibold">
                    &quot;{params.q}&quot;
                  </span>
                </>
              ) : (
                "Showing all products"
              )}
            </p>
            <SortSelect current={params.sort} />
          </div>

          {products.length === 0 ? (
            <div className="border-border flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center">
              <SearchX className="text-muted-foreground h-8 w-8" />
              <h3 className="text-lg font-semibold">No products found</h3>
              <p className="text-muted-foreground max-w-sm text-sm">
                Try changing your filters or search terms.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <CatalogPagination
            current={page}
            total={totalPages}
            query={{
              q: params.q,
              category: params.category,
              brand: params.brand,
              min: params.min,
              max: params.max,
              inStock: params.inStock,
              sort: params.sort,
            }}
          />
        </section>
      </div>
    </div>
  );
}
