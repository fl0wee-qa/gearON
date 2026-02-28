import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

export const PAGE_SIZE = 12;

export type CatalogSearchParams = {
  q?: string;
  category?: string;
  brand?: string;
  min?: string;
  max?: string;
  inStock?: string;
  sort?: string;
  page?: string;
};

function parsePage(value?: string) {
  const parsed = Number(value ?? "1");
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }
  return Math.floor(parsed);
}

function buildWhere(params: CatalogSearchParams): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { brand: { name: { contains: params.q, mode: "insensitive" } } },
    ];
  }

  if (params.category) {
    where.category = { slug: params.category };
  }

  if (params.brand) {
    where.brand = { slug: params.brand };
  }

  const min = params.min ? Number(params.min) : undefined;
  const max = params.max ? Number(params.max) : undefined;

  if (Number.isFinite(min) || Number.isFinite(max)) {
    where.priceCents = {
      gte: Number.isFinite(min)
        ? Math.max(0, Math.floor((min ?? 0) * 100))
        : undefined,
      lte: Number.isFinite(max)
        ? Math.max(0, Math.floor((max ?? 0) * 100))
        : undefined,
    };
  }

  if (params.inStock === "true") {
    where.stock = { gt: 0 };
  }

  return where;
}

function buildSort(sort?: string): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { priceCents: "asc" };
    case "price-desc":
      return { priceCents: "desc" };
    case "newest":
      return { createdAt: "desc" };
    case "popularity":
    default:
      return { popularity: "desc" };
  }
}

export async function getCatalogData(params: CatalogSearchParams) {
  const page = parsePage(params.page);
  const where = buildWhere(params);
  const orderBy = buildSort(params.sort);

  const [products, total, categories, brands] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
      orderBy,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    db.product.count({ where }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return {
    products,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    categories,
    brands,
  };
}

export function getCatalogWhereForTests(params: CatalogSearchParams) {
  return buildWhere(params);
}

export async function getFeaturedProducts() {
  return db.product.findMany({
    where: { featured: true },
    include: {
      brand: true,
      category: true,
      images: { take: 1, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { popularity: "desc" },
    take: 8,
  });
}

export async function getNewArrivals() {
  return db.product.findMany({
    include: {
      brand: true,
      category: true,
      images: { take: 1, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
) {
  return db.product.findMany({
    where: {
      categoryId,
      id: { not: productId },
    },
    include: {
      brand: true,
      category: true,
      images: { take: 1, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { popularity: "desc" },
    take: 4,
  });
}
