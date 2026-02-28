import { CategoriesManager } from "@/components/admin/categories-manager";
import { db } from "@/lib/db";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-black tracking-tight uppercase italic">
        Categories
      </h1>
      <CategoriesManager categories={categories} />
    </div>
  );
}
