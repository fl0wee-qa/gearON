import { db } from "@/lib/db";
import { getOrderStats } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [stats, recentOrders, productCount] = await Promise.all([
    getOrderStats(),
    db.order.findMany({
      include: { user: true, items: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.product.count(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black tracking-tight uppercase italic">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-sm">
          Operational overview for gearON commerce.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/70 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm">Revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-primary text-2xl font-black">
            {formatPrice(stats.totalRevenueCents)}
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm">Orders</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-black">
            {stats.ordersCount}
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-black">
            {stats.pendingCount}
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm">Products</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-black">
            {productCount}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-card/70 rounded-2xl">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="border-border/70 flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3"
            >
              <div>
                <p className="font-semibold">{order.id}</p>
                <p className="text-muted-foreground text-xs">
                  {order.user?.email ?? order.customerEmail}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatPrice(order.totalCents)}</p>
                <p className="text-muted-foreground text-xs">{order.status}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
