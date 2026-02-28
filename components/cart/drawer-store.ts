"use client";

import { create } from "zustand";

type CartDrawerState = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useCartDrawer = create<CartDrawerState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
