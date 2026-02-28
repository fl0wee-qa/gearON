import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { getUserCart } from "@/lib/cart";

export async function GET() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const cart = await getUserCart(session.user.id);
  return NextResponse.json(cart);
}
