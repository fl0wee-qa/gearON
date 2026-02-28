import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { stripeEnabled } from "@/lib/env";
import { markOrderPaid } from "@/lib/orders";
import { getStripeServer } from "@/lib/stripe";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    orderId?: string;
    session_id?: string;
    mock?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const orderId = resolvedSearchParams.orderId;
  const sessionId = resolvedSearchParams.session_id;
  const isMock = resolvedSearchParams.mock === "1";

  let paymentStatus: "PAID" | "PENDING" | "UNKNOWN" = "UNKNOWN";

  if (orderId && isMock) {
    paymentStatus = "PAID";
  } else if (orderId && stripeEnabled && sessionId) {
    const stripe = getStripeServer();
    if (stripe) {
      const checkoutSession =
        await stripe.checkout.sessions.retrieve(sessionId);
      if (checkoutSession.payment_status === "paid") {
        await markOrderPaid(orderId);
        paymentStatus = "PAID";
      } else {
        paymentStatus = "PENDING";
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="border-border/70 bg-card/70 rounded-2xl">
        <CardHeader>
          <CardTitle className="font-display text-3xl font-black uppercase italic">
            Order Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Badge variant={paymentStatus === "PAID" ? "success" : "outline"}>
            {paymentStatus === "PAID" ? "Payment received" : "Payment pending"}
          </Badge>

          <p className="text-muted-foreground text-sm">
            {orderId
              ? `Order ${orderId} has been created.`
              : "Order id missing. Please contact support if payment was made."}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-xl">
              <Link href="/profile">View My Orders</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/catalog">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
