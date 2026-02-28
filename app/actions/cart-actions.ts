"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  addToUserCart,
  removeUserCartItem,
  syncGuestCart,
  updateUserCartItem,
} from "@/lib/cart";
import { requireUser } from "@/lib/auth";
import { cartSyncSchema } from "@/lib/validators";

const addSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(50),
});

const updateSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(0).max(50),
});

const removeSchema = z.object({
  itemId: z.string().min(1),
});

export async function addToCartAction(input: z.infer<typeof addSchema>) {
  const user = await requireUser();
  const parsed = addSchema.parse(input);

  await addToUserCart(user.id, parsed.productId, parsed.quantity);
  revalidatePath("/");
  revalidatePath("/checkout");

  return { ok: true };
}

export async function updateCartItemAction(
  input: z.infer<typeof updateSchema>,
) {
  const user = await requireUser();
  const parsed = updateSchema.parse(input);

  await updateUserCartItem(user.id, parsed.itemId, parsed.quantity);
  revalidatePath("/");
  revalidatePath("/checkout");

  return { ok: true };
}

export async function removeCartItemAction(
  input: z.infer<typeof removeSchema>,
) {
  const user = await requireUser();
  const parsed = removeSchema.parse(input);

  await removeUserCartItem(user.id, parsed.itemId);
  revalidatePath("/");
  revalidatePath("/checkout");

  return { ok: true };
}

export async function syncGuestCartAction(
  input: z.infer<typeof cartSyncSchema>,
) {
  const user = await requireUser();
  const parsed = cartSyncSchema.parse(input);

  await syncGuestCart(user.id, parsed.items);
  revalidatePath("/");
  revalidatePath("/checkout");

  return { ok: true };
}
