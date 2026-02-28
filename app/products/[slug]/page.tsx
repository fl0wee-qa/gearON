import { notFound } from "next/navigation";

import { AddToCartPanel } from "@/components/product-add-to-cart-panel";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product.id, product.categoryId);
  const specs = (product.specs ?? {}) as Record<string, string>;

  return (
    <div className="space-y-10 pb-20 md:pb-0">
      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <ImagePlaceholder
            label="Primary Product Placeholder"
            ratioClass="aspect-[4/3]"
          />
          <div className="grid grid-cols-4 gap-3">
            {(product.images.length ? product.images : [1, 2, 3, 4]).map(
              (item, index) => (
                <ImagePlaceholder
                  key={typeof item === "number" ? item : item.id}
                  label={`Thumb ${index + 1}`}
                  ratioClass="aspect-square"
                />
              ),
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={product.stock > 0 ? "success" : "outline"}>
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </Badge>
              <Badge variant="secondary">{product.category.name}</Badge>
              <Badge variant="outline">{product.brand.name}</Badge>
            </div>

            <h1 className="font-display text-3xl leading-tight font-black uppercase italic md:text-5xl">
              {product.name}
            </h1>

            <p className="text-muted-foreground text-base">
              {product.description}
            </p>
          </div>

          <AddToCartPanel product={product} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-black uppercase italic">
          Technical Specifications
        </h2>
        <Card className="border-border/70 bg-card/70 overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <tbody className="divide-border divide-y">
              {Object.entries(specs).map(([key, value]) => (
                <tr key={key}>
                  <td className="text-muted-foreground w-1/3 px-4 py-3 text-xs font-bold tracking-[0.14em] uppercase">
                    {key}
                  </td>
                  <td className="px-4 py-3 font-medium">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-black uppercase italic">
          Related Products
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
