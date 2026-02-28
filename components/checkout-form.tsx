"use client";

import { ArrowRight, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  completeMockCheckoutAction,
  createOrderAction,
} from "@/app/actions/checkout-actions";
import {
  getGuestCartTotals,
  type GuestCartItem,
  useGuestCart,
} from "@/components/cart/guest-cart-store";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";

type DbCart = {
  items: Array<{
    id: string;
    quantity: number;
    productId: string;
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

type CheckoutItem = {
  key: string;
  productId: string;
  name: string;
  brand: string;
  priceCents: number;
  quantity: number;
};

function mapGuestItems(items: GuestCartItem[]): CheckoutItem[] {
  return items.map((item) => ({
    key: item.productId,
    productId: item.productId,
    name: item.name,
    brand: item.brand,
    priceCents: item.priceCents,
    quantity: item.quantity,
  }));
}

export function CheckoutForm({ stripeEnabled }: { stripeEnabled: boolean }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [dbCart, setDbCart] = useState<DbCart | null>(null);
  const [mockOrderId, setMockOrderId] = useState<string | null>(null);

  const guestItems = useGuestCart((state) => state.items);
  const clearGuest = useGuestCart((state) => state.clear);
  const guestTotals = useMemo(
    () => getGuestCartTotals(guestItems),
    [guestItems],
  );

  const [customerName, setCustomerName] = useState(session?.user?.name ?? "");
  const [customerEmail, setCustomerEmail] = useState(
    session?.user?.email ?? "",
  );
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("United States");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const load = async () => {
      if (!session?.user?.id) {
        setDbCart(null);
        return;
      }

      const response = await fetch("/api/cart", { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as DbCart;
      setDbCart(data);
    };

    void load();
  }, [session?.user?.id]);

  const items: CheckoutItem[] = session?.user?.id
    ? (dbCart?.items ?? []).map((item) => ({
        key: item.id,
        productId: item.productId,
        name: item.product.name,
        brand: item.product.brand.name,
        priceCents: item.product.priceCents,
        quantity: item.quantity,
      }))
    : mapGuestItems(guestItems);

  const totalCents = session?.user?.id
    ? (dbCart?.totalCents ?? 0)
    : guestTotals.totalCents;

  const submitOrder = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    startTransition(async () => {
      const result = await createOrderAction({
        customerName,
        customerEmail,
        addressLine1,
        city,
        country,
        guestItems: session?.user?.id
          ? undefined
          : items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      if (!session?.user?.id) {
        clearGuest();
      }

      if (result.mode === "stripe") {
        window.location.href = result.checkoutUrl;
        return;
      }

      setMockOrderId(result.orderId);
      toast.success("Order created. Complete mock payment to finish.");
    });
  };

  const confirmMock = () => {
    if (!mockOrderId) {
      return;
    }

    startTransition(async () => {
      await completeMockCheckoutAction({ orderId: mockOrderId });
      router.push(`/checkout/success?orderId=${mockOrderId}&mock=1`);
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="border-border/70 bg-card/70 rounded-2xl">
        <CardHeader>
          <CardTitle className="font-display text-2xl uppercase italic">
            Checkout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">Full name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="addressLine1">Address</Label>
              <Input
                id="addressLine1"
                value={addressLine1}
                onChange={(event) => setAddressLine1(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
              />
            </div>
          </div>

          {stripeEnabled ? (
            <Badge variant="secondary">Stripe test mode is enabled</Badge>
          ) : (
            <Badge variant="outline">
              Mock Checkout mode (no real payment)
            </Badge>
          )}

          {mockOrderId ? (
            <Card className="border-primary/40 bg-primary/5 rounded-xl">
              <CardContent className="space-y-3 p-4">
                <p className="text-sm font-semibold">Mock Checkout</p>
                <p className="text-muted-foreground text-sm">
                  This environment has no Stripe keys. Confirm payment to move
                  order from PENDING to PAID.
                </p>
                <Button
                  onClick={confirmMock}
                  disabled={isPending}
                  className="rounded-xl"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Confirm Mock Payment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Button
              onClick={submitOrder}
              disabled={isPending || items.length === 0}
              className="rounded-xl"
              size="lg"
            >
              Place Order
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/70 h-fit rounded-2xl lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.key}
                className="border-border/70 flex items-center gap-3 rounded-xl border p-2"
              >
                <ImagePlaceholder
                  ratioClass="aspect-square"
                  className="h-14 w-14"
                  label="Item"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {item.brand} x{item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {formatPrice(item.priceCents * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-border space-y-1 border-t pt-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(totalCents)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-emerald-500">Free</span>
            </div>
            <div className="flex items-center justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(totalCents)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
