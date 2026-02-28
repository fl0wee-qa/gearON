import { format } from "date-fns";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/auth/sign-in?callbackUrl=/profile");
  }

  const orders = await getOrdersForUser(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black tracking-tight uppercase italic">
          Profile
        </h1>
        <p className="text-muted-foreground text-sm">
          Orders and account overview.
        </p>
      </div>

      <Card className="border-border/70 bg-card/70 rounded-2xl">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Name:</span>{" "}
            {session.user.name ?? "N/A"}
          </p>
          <p>
            <span className="text-muted-foreground">Email:</span>{" "}
            {session.user.email}
          </p>
          <p>
            <span className="text-muted-foreground">Role:</span>{" "}
            {session.user.role}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Orders</h2>
        {orders.length === 0 ? (
          <Card className="border-border/70 bg-card/70 rounded-2xl">
            <CardContent className="text-muted-foreground p-6 text-sm">
              No orders yet.
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card
              key={order.id}
              className="border-border/70 bg-card/70 rounded-2xl"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Order {order.id}</CardTitle>
                <Badge
                  variant={order.status === "PAID" ? "success" : "outline"}
                >
                  {order.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2">
                  <span>{format(order.createdAt, "PPP p")}</span>
                  <span>Total: {formatPrice(order.totalCents)}</span>
                </div>

                <div className="border-border/70 space-y-2 rounded-xl border p-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>{formatPrice(item.unitCents * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
