"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GuestCartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  quantity: number;
  brand: string;
};

type GuestCartState = {
  items: GuestCartItem[];
  addItem: (item: Omit<GuestCartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

export const useGuestCart = create<GuestCartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        const existing = get().items.find(
          (cartItem) => cartItem.productId === item.productId,
        );

        if (existing) {
          set({
            items: get().items.map((cartItem) =>
              cartItem.productId === item.productId
                ? { ...cartItem, quantity: cartItem.quantity + quantity }
                : cartItem,
            ),
          });
          return;
        }

        set({
          items: [...get().items, { ...item, quantity }],
        });
      },
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: "gearon-guest-cart",
    },
  ),
);

export function getGuestCartTotals(items: GuestCartItem[]) {
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCents = items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  );

  return { count, totalCents };
}
