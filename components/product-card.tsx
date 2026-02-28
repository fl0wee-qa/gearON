"use client";

import { Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTransition } from "react";
import { toast } from "sonner";

import { addToCartAction } from "@/app/actions/cart-actions";
import { useCartDrawer } from "@/components/cart/drawer-store";
import { useGuestCart } from "@/components/cart/guest-cart-store";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

type ProductCardProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    priceCents: number;
    stock: number;
    featured: boolean;
    brand: { name: string };
    category: { name: string };
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession();
  const addGuest = useGuestCart((state) => state.addItem);
  const setCartOpen = useCartDrawer((state) => state.setOpen);
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    startTransition(async () => {
      try {
        if (session?.user?.id) {
          await addToCartAction({ productId: product.id, quantity: 1 });
        } else {
          addGuest({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            priceCents: product.priceCents,
            brand: product.brand.name,
          });
        }

        setCartOpen(true);
        toast.success(`${product.name} added to cart`);
      } catch {
        toast.error("Could not add item to cart.");
      }
    });
  };

  return (
    <Card
      className="group border-border/80 bg-card/70 overflow-hidden backdrop-blur"
      data-testid="product-card"
    >
      <div className="relative">
        <Link href={`/products/${product.slug}`} aria-label={product.name}>
          <ImagePlaceholder
            label="Product Placeholder"
            ratioClass="aspect-[4/3]"
            className="rounded-none"
          />
        </Link>
        <div className="pointer-events-none absolute top-3 left-3 flex gap-2">
          {product.featured ? <Badge variant="success">Featured</Badge> : null}
          {product.stock > 0 ? (
            <Badge variant="secondary">In Stock</Badge>
          ) : (
            <Badge variant="outline">Out of Stock</Badge>
          )}
        </div>
        <Button
          type="button"
          size="icon"
          className="absolute right-3 bottom-3 rounded-xl shadow-lg"
          disabled={isPending || product.stock < 1}
          onClick={handleAdd}
          data-testid="add-to-cart-button"
        >
          {isPending ? (
            <ShoppingBag className="h-4 w-4 animate-pulse" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>
      <CardContent className="space-y-2 p-4">
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
          {product.brand.name}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className="text-foreground hover:text-primary line-clamp-2 text-base leading-tight font-semibold transition-colors"
        >
          {product.name}
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            {product.category.name}
          </span>
          <span className="text-primary text-lg font-bold">
            {formatPrice(product.priceCents)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
