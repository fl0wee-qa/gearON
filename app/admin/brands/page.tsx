import { BrandsManager } from "@/components/admin/brands-manager";
import { db } from "@/lib/db";

export default async function AdminBrandsPage() {
  const brands = await db.brand.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-black tracking-tight uppercase italic">
        Brands
      </h1>
      <BrandsManager brands={brands} />
    </div>
  );
}
