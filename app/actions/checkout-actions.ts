"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { env, stripeEnabled } from "@/lib/env";
import {
  createOrderFromGuestCart,
  createOrderFromUserCart,
  getOrderById,
  markOrderPaid,
} from "@/lib/orders";
import { getStripeServer } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/validators";

const createOrderSchema = checkoutSchema.extend({
  guestItems: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().max(50),
      }),
    )
    .optional(),
});

const completeMockSchema = z.object({
  orderId: z.string().min(1),
});

const verifyStripeSchema = z.object({
  orderId: z.string().min(1),
  sessionId: z.string().min(1),
});

export type CreateOrderResult =
  | { ok: true; mode: "stripe"; checkoutUrl: string; orderId: string }
  | { ok: true; mode: "mock"; orderId: string }
  | { ok: false; message: string };

export async function createOrderAction(
  input: z.infer<typeof createOrderSchema>,
): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "Invalid checkout details." };
  }

  const session = await getAuthSession();
  const checkoutFields = {
    customerName: parsed.data.customerName,
    customerEmail: parsed.data.customerEmail,
    addressLine1: parsed.data.addressLine1,
    city: parsed.data.city,
    country: parsed.data.country,
  };

  const order = session?.user?.id
    ? await createOrderFromUserCart(session.user.id, checkoutFields)
    : await createOrderFromGuestCart(
        checkoutFields,
        parsed.data.guestItems ?? [],
      );

  if (stripeEnabled) {
    const stripe = getStripeServer();

    if (stripe) {
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: order.items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            unit_amount: item.unitCents,
            product_data: {
              name: item.name,
            },
          },
        })),
        success_url: `${env.NEXTAUTH_URL}/checkout/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.NEXTAUTH_URL}/checkout?cancelled=1`,
        metadata: {
          orderId: order.id,
        },
      });

      if (checkoutSession.url) {
        return {
          ok: true,
          mode: "stripe",
          checkoutUrl: checkoutSession.url,
          orderId: order.id,
        };
      }
    }
  }

  return { ok: true, mode: "mock", orderId: order.id };
}

export async function completeMockCheckoutAction(
  input: z.infer<typeof completeMockSchema>,
) {
  const parsed = completeMockSchema.parse(input);
  await markOrderPaid(parsed.orderId);

  revalidatePath("/profile");
  revalidatePath("/admin/orders");

  return { ok: true };
}

export async function verifyStripeCheckoutAction(
  input: z.infer<typeof verifyStripeSchema>,
) {
  const parsed = verifyStripeSchema.parse(input);
  const stripe = getStripeServer();

  if (!stripe) {
    return { ok: false, message: "Stripe is not configured." };
  }

  const checkoutSession = await stripe.checkout.sessions.retrieve(
    parsed.sessionId,
  );

  if (checkoutSession.payment_status === "paid") {
    await markOrderPaid(parsed.orderId);
    revalidatePath("/profile");
    revalidatePath("/admin/orders");
    return { ok: true };
  }

  const order = await getOrderById(parsed.orderId);
  return {
    ok: false,
    message: `Payment status is ${checkoutSession.payment_status}. Order ${order?.id ?? "not found"}.`,
  };
}
