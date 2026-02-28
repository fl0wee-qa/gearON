import { db } from "@/lib/db";

async function ensureCart(userId: string) {
  const existing = await db.cart.findUnique({ where: { userId } });
  if (existing) {
    return existing;
  }

  return db.cart.create({ data: { userId } });
}

export async function getUserCart(userId: string) {
  const cart = await db.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              brand: true,
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
            },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!cart) {
    return { items: [], totalCents: 0 };
  }

  const totalCents = cart.items.reduce(
    (sum, item) => sum + item.product.priceCents * item.quantity,
    0,
  );

  return { ...cart, totalCents };
}

export async function addToUserCart(
  userId: string,
  productId: string,
  quantity: number,
) {
  const cart = await ensureCart(userId);

  const existing = await db.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }
}

export async function updateUserCartItem(
  userId: string,
  itemId: string,
  quantity: number,
) {
  const cart = await ensureCart(userId);

  if (quantity <= 0) {
    await db.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
    return;
  }

  await db.cartItem.updateMany({
    where: { id: itemId, cartId: cart.id },
    data: { quantity },
  });
}

export async function removeUserCartItem(userId: string, itemId: string) {
  const cart = await ensureCart(userId);
  await db.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
}

export async function clearUserCart(userId: string) {
  const cart = await db.cart.findUnique({ where: { userId } });
  if (!cart) {
    return;
  }

  await db.cartItem.deleteMany({ where: { cartId: cart.id } });
}

export async function syncGuestCart(
  userId: string,
  items: Array<{ productId: string; quantity: number }>,
) {
  if (items.length === 0) {
    return;
  }

  const cart = await ensureCart(userId);

  for (const item of items) {
    const existing = await db.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: item.productId,
        },
      },
    });

    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + item.quantity },
      });
      continue;
    }

    await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId: item.productId,
        quantity: item.quantity,
      },
    });
  }
}
