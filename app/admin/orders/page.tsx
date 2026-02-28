import { OrdersManager } from "@/components/admin/orders-manager";
import { getAllOrders } from "@/lib/orders";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-black tracking-tight uppercase italic">
        Orders
      </h1>
      <OrdersManager orders={orders} />
    </div>
  );
}
