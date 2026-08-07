import { cookies } from "next/headers";
import { Package, ShoppingCart } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApiClientFromCookies } from "@/lib/api";

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default async function DashboardPage() {
  const api = getApiClientFromCookies((await cookies()).toString());

  // Fetched in parallel — these are independent reads.
  const [products, orders] = await Promise.all([
    api.masters.listProducts({ limit: 1 }),
    api.masters.listOrders({ limit: 5 }),
  ]);

  const revenue = orders.orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Package className="size-4" />
              Total Produk
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {products.total}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <ShoppingCart className="size-4" />
              Total Transaksi
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {orders.total}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Pendapatan (5 transaksi terakhir)</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {idr.format(revenue)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terakhir</CardTitle>
          <CardDescription>
            {orders.total === 0
              ? "Belum ada transaksi tercatat."
              : `Menampilkan ${orders.orders.length} dari ${orders.total} transaksi.`}
          </CardDescription>
        </CardHeader>
        {orders.orders.length > 0 && (
          <CardContent>
            <ul className="divide-y">
              {orders.orders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div className="grid gap-0.5">
                    <span className="font-medium">
                      {order.invoiceNumber ?? "(draf)"}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {order.customerName ?? "Tanpa pelanggan"} · {order.status}
                    </span>
                  </div>
                  <span className="tabular-nums">
                    {idr.format(order.totalAmount)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
