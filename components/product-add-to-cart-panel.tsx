"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { addToCartAction } from "@/app/actions/cart-actions";
import { useCartDrawer } from "@/components/cart/drawer-store";
import { useGuestCart } from "@/components/cart/guest-cart-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

type AddToCartPanelProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    priceCents: number;
    stock: number;
    brand: { name: string };
  };
};

export function AddToCartPanel({ product }: AddToCartPanelProps) {
  const { data: session } = useSession();
  const addGuest = useGuestCart((state) => state.addItem);
  const setCartOpen = useCartDrawer((state) => state.setOpen);
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();

  const addToCart = () => {
    startTransition(async () => {
      try {
        if (session?.user?.id) {
          await addToCartAction({ productId: product.id, quantity });
        } else {
          addGuest(
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              priceCents: product.priceCents,
              brand: product.brand.name,
            },
            quantity,
          );
        }

        toast.success(`${product.name} added to cart`);
        setCartOpen(true);
      } catch {
        toast.error("Could not add item to cart.");
      }
    });
  };

  return (
    <>
      <div className="border-border/70 bg-card/70 space-y-4 rounded-2xl border p-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Price</span>
          <strong className="text-primary text-2xl">
            {formatPrice(product.priceCents)}
          </strong>
        </div>

        <div className="border-border flex items-center justify-between rounded-xl border p-2">
          <span className="text-sm font-medium">Quantity</span>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-lg"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center text-sm font-semibold">
              {quantity}
            </span>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-lg"
              onClick={() =>
                setQuantity((value) => Math.min(product.stock, value + 1))
              }
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <Button
          className="w-full rounded-xl"
          size="lg"
          onClick={addToCart}
          disabled={product.stock < 1 || isPending}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          {product.stock < 1 ? "Out of Stock" : "Add to Cart"}
        </Button>

        <Badge variant={product.stock > 0 ? "success" : "outline"}>
          {product.stock > 0
            ? `${product.stock} units in stock`
            : "Out of stock"}
        </Badge>
      </div>

      <div className="border-border bg-background/95 fixed inset-x-0 bottom-0 z-30 border-t p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{product.name}</p>
            <p className="text-primary text-xs">
              {formatPrice(product.priceCents)}
            </p>
          </div>
          <Button
            className="rounded-xl"
            onClick={addToCart}
            disabled={product.stock < 1 || isPending}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </>
  );
}
