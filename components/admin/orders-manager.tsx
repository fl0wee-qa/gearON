"use client";

import { OrderStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { updateOrderStatusAction } from "@/app/actions/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export function OrdersManager({
  orders,
}: {
  orders: Array<{
    id: string;
    status: OrderStatus;
    customerEmail: string;
    customerName: string;
    totalCents: number;
    createdAt: Date;
    user: { email: string | null } | null;
  }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const updateStatus = (orderId: string, status: OrderStatus) => {
    startTransition(async () => {
      try {
        await updateOrderStatusAction({ orderId, status });
        toast.success("Order status updated.");
        router.refresh();
      } catch {
        toast.error("Could not update status.");
      }
    });
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <p className="font-semibold">{order.id}</p>
                <p className="text-muted-foreground text-xs">
                  {order.createdAt.toLocaleDateString()}
                </p>
              </TableCell>
              <TableCell>
                <p>{order.customerName}</p>
                <p className="text-muted-foreground text-xs">
                  {order.user?.email ?? order.customerEmail}
                </p>
              </TableCell>
              <TableCell>
                <Badge
                  variant={order.status === "PAID" ? "success" : "outline"}
                >
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>{formatPrice(order.totalCents)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {ORDER_STATUSES.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={order.status === status ? "default" : "outline"}
                      disabled={isPending}
                      onClick={() => updateStatus(order.id, status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
