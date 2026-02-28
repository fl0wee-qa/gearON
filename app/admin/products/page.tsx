import { ProductsManager } from "@/components/admin/products-manager";
import { db } from "@/lib/db";

export default async function AdminProductsPage() {
  const [products, categories, brands] = await Promise.all([
    db.product.findMany({
      include: {
        images: true,
        category: true,
        brand: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-black tracking-tight uppercase italic">
        Products
      </h1>
      <ProductsManager
        products={products}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
