import { CheckoutForm } from "@/components/checkout-form";
import { stripeEnabled } from "@/lib/env";

export default function CheckoutPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-black tracking-tight uppercase italic">
        Checkout
      </h1>
      <CheckoutForm stripeEnabled={stripeEnabled} />
    </div>
  );
}
