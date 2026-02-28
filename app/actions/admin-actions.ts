"use server";

import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { brandSchema, categorySchema, productSchema } from "@/lib/validators";

function parseSpecs(specsJson: string) {
  try {
    const parsed = JSON.parse(specsJson);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed;
    }
  } catch {
    throw new Error("Specs JSON must be valid JSON object.");
  }

  throw new Error("Specs JSON must be valid JSON object.");
}

function parseImageUrls(imageUrls: string) {
  return imageUrls
    .split(/\r?\n|,/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function createProductAction(
  input: z.infer<typeof productSchema>,
) {
  await requireAdmin();
  const parsed = productSchema.parse(input);

  const specs = parseSpecs(parsed.specsJson);
  const imageUrls = parseImageUrls(parsed.imageUrls);

  await db.product.create({
    data: {
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      priceCents: parsed.priceCents,
      stock: parsed.stock,
      popularity: parsed.popularity,
      featured: parsed.featured,
      specs,
      categoryId: parsed.categoryId,
      brandId: parsed.brandId,
      images: {
        create: imageUrls.map((url, index) => ({
          url,
          alt: `${parsed.name} image ${index + 1}`,
          sortOrder: index,
        })),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/catalog");

  return { ok: true };
}

export async function updateProductAction(
  id: string,
  input: z.infer<typeof productSchema>,
) {
  await requireAdmin();
  const parsed = productSchema.parse(input);

  const specs = parseSpecs(parsed.specsJson);
  const imageUrls = parseImageUrls(parsed.imageUrls);

  await db.product.update({
    where: { id },
    data: {
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      priceCents: parsed.priceCents,
      stock: parsed.stock,
      popularity: parsed.popularity,
      featured: parsed.featured,
      specs,
      categoryId: parsed.categoryId,
      brandId: parsed.brandId,
      images: {
        deleteMany: {},
        create: imageUrls.map((url, index) => ({
          url,
          alt: `${parsed.name} image ${index + 1}`,
          sortOrder: index,
        })),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/catalog");

  return { ok: true };
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  await db.product.delete({ where: { id } });

  revalidatePath("/admin/products");
  revalidatePath("/catalog");

  return { ok: true };
}

export async function createCategoryAction(
  input: z.infer<typeof categorySchema>,
) {
  await requireAdmin();
  const parsed = categorySchema.parse(input);

  await db.category.create({ data: parsed });
  revalidatePath("/admin/categories");
  revalidatePath("/catalog");

  return { ok: true };
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  await db.category.delete({ where: { id } });
  revalidatePath("/admin/categories");

  return { ok: true };
}

export async function createBrandAction(input: z.infer<typeof brandSchema>) {
  await requireAdmin();
  const parsed = brandSchema.parse(input);

  await db.brand.create({ data: parsed });
  revalidatePath("/admin/brands");
  revalidatePath("/catalog");

  return { ok: true };
}

export async function deleteBrandAction(id: string) {
  await requireAdmin();
  await db.brand.delete({ where: { id } });
  revalidatePath("/admin/brands");

  return { ok: true };
}

const orderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.nativeEnum(OrderStatus),
});

export async function updateOrderStatusAction(
  input: z.infer<typeof orderStatusSchema>,
) {
  await requireAdmin();
  const parsed = orderStatusSchema.parse(input);

  await db.order.update({
    where: { id: parsed.orderId },
    data: { status: parsed.status },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/profile");

  return { ok: true };
}
