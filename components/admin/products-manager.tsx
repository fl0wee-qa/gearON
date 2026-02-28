"use client";

import { Product } from "@prisma/client";
import { Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useTransition } from "react";
import { toast } from "sonner";

import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/utils";

type CategoryOption = { id: string; name: string; slug: string };
type BrandOption = { id: string; name: string; slug: string };

type ProductWithRelations = Product & {
  images: { id: string; url: string }[];
  category: { id: string; name: string };
  brand: { id: string; name: string };
};

function parseForm(form: HTMLFormElement) {
  const data = new FormData(form);

  return {
    name: String(data.get("name") ?? ""),
    slug: String(data.get("slug") ?? ""),
    description: String(data.get("description") ?? ""),
    priceCents: Number(data.get("priceCents") ?? 0),
    stock: Number(data.get("stock") ?? 0),
    popularity: Number(data.get("popularity") ?? 0),
    featured: data.get("featured") === "on",
    categoryId: String(data.get("categoryId") ?? ""),
    brandId: String(data.get("brandId") ?? ""),
    specsJson: String(data.get("specsJson") ?? "{}"),
    imageUrls: String(data.get("imageUrls") ?? ""),
  };
}

export function ProductsManager({
  products,
  categories,
  brands,
}: {
  products: ProductWithRelations[];
  categories: CategoryOption[];
  brands: BrandOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const createProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = parseForm(form);

    startTransition(async () => {
      try {
        await createProductAction(payload);
        toast.success("Product created.");
        form.reset();
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not create product.",
        );
      }
    });
  };

  const saveProduct = (id: string, event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = parseForm(form);

    startTransition(async () => {
      try {
        await updateProductAction(id, payload);
        toast.success("Product updated.");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not update product.",
        );
      }
    });
  };

  const removeProduct = (id: string) => {
    startTransition(async () => {
      try {
        await deleteProductAction(id);
        toast.success("Product removed.");
        router.refresh();
      } catch {
        toast.error("Could not delete product.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/70 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5" />
            Add Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={createProduct}>
            <div className="grid gap-3 md:grid-cols-2">
              <Input name="name" placeholder="Name" required />
              <Input name="slug" placeholder="Slug" required />
              <Input
                name="priceCents"
                placeholder="Price (cents)"
                type="number"
                min={0}
                required
              />
              <Input
                name="stock"
                placeholder="Stock"
                type="number"
                min={0}
                required
              />
              <Input
                name="popularity"
                placeholder="Popularity"
                type="number"
                min={0}
                defaultValue={0}
                required
              />
              <div className="border-border rounded-xl border p-2">
                <Label
                  htmlFor="featured-create"
                  className="flex items-center gap-2"
                >
                  <Checkbox id="featured-create" name="featured" />
                  Featured
                </Label>
              </div>
              <select
                name="categoryId"
                className="border-border bg-background h-10 rounded-xl border px-3 text-sm"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                name="brandId"
                className="border-border bg-background h-10 rounded-xl border px-3 text-sm"
                required
              >
                <option value="">Select brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <Textarea name="description" placeholder="Description" required />
            <Textarea
              name="specsJson"
              placeholder='Specs JSON (e.g. {"switch":"optical"})'
              defaultValue='{"connectivity":"USB-C","warranty":"3 years"}'
              required
            />
            <Textarea
              name="imageUrls"
              placeholder="Image URLs (one per line)"
            />
            <Button type="submit" disabled={isPending}>
              Create Product
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className="border-border/70 bg-card/70 rounded-2xl"
          >
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                <span>{product.name}</span>
                <span className="text-primary text-sm">
                  {formatPrice(product.priceCents)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-3"
                onSubmit={(event) => saveProduct(product.id, event)}
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <Input name="name" defaultValue={product.name} required />
                  <Input name="slug" defaultValue={product.slug} required />
                  <Input
                    name="priceCents"
                    type="number"
                    min={0}
                    defaultValue={product.priceCents}
                    required
                  />
                  <Input
                    name="stock"
                    type="number"
                    min={0}
                    defaultValue={product.stock}
                    required
                  />
                  <Input
                    name="popularity"
                    type="number"
                    min={0}
                    defaultValue={product.popularity}
                    required
                  />
                  <div className="border-border rounded-xl border p-2">
                    <Label
                      htmlFor={`featured-${product.id}`}
                      className="flex items-center gap-2"
                    >
                      <Checkbox
                        id={`featured-${product.id}`}
                        name="featured"
                        defaultChecked={product.featured}
                      />
                      Featured
                    </Label>
                  </div>
                  <select
                    name="categoryId"
                    defaultValue={product.categoryId}
                    className="border-border bg-background h-10 rounded-xl border px-3 text-sm"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <select
                    name="brandId"
                    defaultValue={product.brandId}
                    className="border-border bg-background h-10 rounded-xl border px-3 text-sm"
                    required
                  >
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Textarea
                  name="description"
                  defaultValue={product.description}
                  required
                />
                <Textarea
                  name="specsJson"
                  defaultValue={JSON.stringify(product.specs, null, 2)}
                  required
                />
                <Textarea
                  name="imageUrls"
                  defaultValue={product.images
                    .map((image) => image.url)
                    .join("\n")}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isPending}
                    onClick={() => removeProduct(product.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
