import { CheckCircle2, Plus } from "lucide-react";
import Link from "next/link";
import type { dashboard } from "@/lib/api/client";
import { formatPrice } from "@/lib/format";

interface RecentOrdersCardProps {
  orders?: dashboard.RecentOrderItem[];
}

export function RecentOrdersCard({ orders }: RecentOrdersCardProps) {
  const orderList = orders
    ? orders.map((o) => ({
        id: o.id,
        invoice: o.invoiceNumber,
        total: formatPrice(o.totalAmount),
        status: o.status,
        time: new Date(o.createdAt).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }))
    : [
        { id: "1", invoice: "INV/2026/08/0001", total: "Rp 185.000", status: "paid", time: "10:30" },
        { id: "2", invoice: "INV/2026/08/0002", total: "Rp 92.500", status: "paid", time: "11:15" },
        { id: "3", invoice: "INV/2026/08/0003", total: "Rp 410.000", status: "paid", time: "12:00" },
      ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-foreground">Transaksi Terbaru</h2>
        <Link
          href="/orders"
          className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          Lihat Semua
        </Link>
      </div>

      {orderList.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted-foreground">
          Belum ada transaksi hari ini.
        </div>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {orderList.map((order) => (
            <li key={order.id} className="flex items-center gap-2.5">
              <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-brand" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{order.total}</p>
                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                  {order.invoice} · {order.time} WIB
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  order.status === "paid"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
              >
                {order.status === "paid" ? "Lunas" : order.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

