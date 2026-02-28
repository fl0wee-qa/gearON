import { OrderStatus } from "@prisma/client";

import { clearUserCart, getUserCart } from "@/lib/cart";
import { db } from "@/lib/db";

type CheckoutInput = {
  customerName: string;
  customerEmail: string;
  addressLine1: string;
  city: string;
  country: string;
};

type GuestItem = {
  productId: string;
  quantity: number;
};

async function buildItemsFromProducts(
  products: Array<{
    productId: string;
    quantity: number;
    name: string;
    unitCents: number;
  }>,
) {
  return products.map((item) => ({
    productId: item.productId,
    name: item.name,
    quantity: item.quantity,
    unitCents: item.unitCents,
  }));
}

export async function createOrderFromUserCart(
  userId: string,
  input: CheckoutInput,
) {
  const cart = await getUserCart(userId);
  if (!("items" in cart) || cart.items.length === 0) {
    throw new Error("Cart is empty.");
  }

  const orderItems = await buildItemsFromProducts(
    cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      name: item.product.name,
      unitCents: item.product.priceCents,
    })),
  );

  const totalCents = orderItems.reduce(
    (sum, item) => sum + item.unitCents * item.quantity,
    0,
  );

  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId,
        status: OrderStatus.PENDING,
        totalCents,
        ...input,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.productId! },
        data: {
          stock: { decrement: item.quantity },
          popularity: { increment: item.quantity },
        },
      });
    }

    return created;
  });

  await clearUserCart(userId);
  return order;
}

export async function createOrderFromGuestCart(
  input: CheckoutInput,
  guestItems: GuestItem[],
) {
  if (guestItems.length === 0) {
    throw new Error("Cart is empty.");
  }

  const products = await db.product.findMany({
    where: {
      id: { in: guestItems.map((item) => item.productId) },
    },
  });

  const productMap = new Map(products.map((product) => [product.id, product]));
  const orderItems = await buildItemsFromProducts(
    guestItems.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error("Some cart items are no longer available.");
      }

      return {
        productId: product.id,
        quantity: item.quantity,
        name: product.name,
        unitCents: product.priceCents,
      };
    }),
  );

  const totalCents = orderItems.reduce(
    (sum, item) => sum + item.unitCents * item.quantity,
    0,
  );

  return db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        status: OrderStatus.PENDING,
        totalCents,
        ...input,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.productId! },
        data: {
          stock: { decrement: item.quantity },
          popularity: { increment: item.quantity },
        },
      });
    }

    return created;
  });
}

export async function markOrderPaid(orderId: string) {
  return db.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.PAID },
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return db.order.update({
    where: { id: orderId },
    data: { status },
  });
}

export async function getOrderById(orderId: string) {
  return db.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: true,
    },
  });
}

export async function getOrdersForUser(userId: string) {
  return db.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllOrders() {
  return db.order.findMany({
    include: {
      items: true,
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderStats() {
  const [totalRevenue, pendingCount, paidCount, ordersCount] =
    await Promise.all([
      db.order.aggregate({
        where: { status: OrderStatus.PAID },
        _sum: { totalCents: true },
      }),
      db.order.count({ where: { status: OrderStatus.PENDING } }),
      db.order.count({ where: { status: OrderStatus.PAID } }),
      db.order.count(),
    ]);

  return {
    totalRevenueCents: totalRevenue._sum.totalCents ?? 0,
    pendingCount,
    paidCount,
    ordersCount,
  };
}
