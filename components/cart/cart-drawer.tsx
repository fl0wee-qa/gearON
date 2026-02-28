"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  removeCartItemAction,
  syncGuestCartAction,
  updateCartItemAction,
} from "@/app/actions/cart-actions";
import { useCartDrawer } from "@/components/cart/drawer-store";
import {
  getGuestCartTotals,
  useGuestCart,
} from "@/components/cart/guest-cart-store";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatPrice } from "@/lib/utils";

type DbCartResponse = {
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    product: {
      id: string;
      slug: string;
      name: string;
      priceCents: number;
      brand: { name: string };
    };
  }>;
  totalCents: number;
};

export function CartDrawer() {
  const { data: session } = useSession();
  const open = useCartDrawer((state) => state.open);
  const setOpen = useCartDrawer((state) => state.setOpen);

  const guestItems = useGuestCart((state) => state.items);
  const updateGuestItem = useGuestCart((state) => state.updateQuantity);
  const removeGuestItem = useGuestCart((state) => state.removeItem);
  const clearGuest = useGuestCart((state) => state.clear);

  const [dbCart, setDbCart] = useState<DbCartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingGuest, setIsSyncingGuest] = useState(false);
  const [isPending, startTransition] = useTransition();

  const guestTotals = useMemo(
    () => getGuestCartTotals(guestItems),
    [guestItems],
  );

  const fetchDbCart = async () => {
    if (!session?.user?.id) {
      setDbCart(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/cart", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Could not fetch cart");
      }

      const data = (await response.json()) as DbCartResponse;
      setDbCart(data);
    } catch {
      toast.error("Could not load cart.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchDbCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  useEffect(() => {
    const run = async () => {
      if (!session?.user?.id || guestItems.length === 0 || isSyncingGuest) {
        return;
      }

      setIsSyncingGuest(true);
      try {
        await syncGuestCartAction({
          items: guestItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        });
        clearGuest();
        await fetchDbCart();
      } catch {
        toast.error("Could not sync guest cart.");
      } finally {
        setIsSyncingGuest(false);
      }
    };

    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, guestItems.length]);

  const dbItemCount =
    dbCart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const totalCount = session?.user?.id ? dbItemCount : guestTotals.count;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full p-0 sm:max-w-lg">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b p-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-display text-2xl">
                Your Cart
              </SheetTitle>
              <Badge variant="secondary">{totalCount} items</Badge>
            </div>
            <SheetDescription>
              {session?.user?.id
                ? "Your account cart is synced across sessions."
                : "Guest cart is stored locally until checkout."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Loading cart...</p>
            ) : null}

            {session?.user?.id ? (
              <>
                {dbCart?.items.map((item) => (
                  <div
                    key={item.id}
                    className="border-border bg-card rounded-2xl border p-3"
                  >
                    <div className="flex gap-3">
                      <ImagePlaceholder
                        ratioClass="aspect-square"
                        className="h-20 w-20 shrink-0"
                        label="Item"
                      />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="hover:text-primary line-clamp-2 text-sm font-semibold"
                          onClick={() => setOpen(false)}
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-muted-foreground text-xs">
                          {item.product.brand.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-lg"
                              disabled={isPending}
                              onClick={() => {
                                startTransition(async () => {
                                  await updateCartItemAction({
                                    itemId: item.id,
                                    quantity: item.quantity - 1,
                                  });
                                  await fetchDbCart();
                                });
                              }}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-lg"
                              disabled={isPending}
                              onClick={() => {
                                startTransition(async () => {
                                  await updateCartItemAction({
                                    itemId: item.id,
                                    quantity: item.quantity + 1,
                                  });
                                  await fetchDbCart();
                                });
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              {formatPrice(
                                item.product.priceCents * item.quantity,
                              )}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg"
                              disabled={isPending}
                              onClick={() => {
                                startTransition(async () => {
                                  await removeCartItemAction({
                                    itemId: item.id,
                                  });
                                  await fetchDbCart();
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {guestItems.map((item) => (
                  <div
                    key={item.productId}
                    className="border-border bg-card rounded-2xl border p-3"
                  >
                    <div className="flex gap-3">
                      <ImagePlaceholder
                        ratioClass="aspect-square"
                        className="h-20 w-20 shrink-0"
                        label="Item"
                      />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Link
                          href={`/products/${item.slug}`}
                          className="hover:text-primary line-clamp-2 text-sm font-semibold"
                          onClick={() => setOpen(false)}
                        >
                          {item.name}
                        </Link>
                        <p className="text-muted-foreground text-xs">
                          {item.brand}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-lg"
                              onClick={() =>
                                updateGuestItem(
                                  item.productId,
                                  item.quantity - 1,
                                )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-lg"
                              onClick={() =>
                                updateGuestItem(
                                  item.productId,
                                  item.quantity + 1,
                                )
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              {formatPrice(item.priceCents * item.quantity)}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg"
                              onClick={() => removeGuestItem(item.productId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {totalCount === 0 && !isLoading ? (
              <div className="border-border flex h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed">
                <ShoppingBag className="text-muted-foreground h-8 w-8" />
                <p className="text-muted-foreground text-sm">
                  Your cart is empty.
                </p>
              </div>
            ) : null}
          </div>

          <div className="bg-background space-y-3 border-t p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">
                {session?.user?.id
                  ? formatPrice(dbCart?.totalCents ?? 0)
                  : formatPrice(guestTotals.totalCents)}
              </span>
            </div>
            <Button
              asChild
              className="w-full rounded-xl"
              disabled={totalCount === 0}
              data-testid="cart-checkout-button"
            >
              <Link href="/checkout" onClick={() => setOpen(false)}>
                Proceed to Checkout
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
