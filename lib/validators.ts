import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const productSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  priceCents: z.coerce.number().int().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
  popularity: z.coerce.number().int().nonnegative().default(0),
  featured: z.coerce.boolean().default(false),
  categoryId: z.string().min(1),
  brandId: z.string().min(1),
  specsJson: z.string().min(2),
  imageUrls: z.string().optional().default(""),
});

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional().default(""),
});

export const brandSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  addressLine1: z.string().min(5),
  city: z.string().min(2),
  country: z.string().min(2),
});

export const cartSyncSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive().max(50),
    }),
  ),
});
