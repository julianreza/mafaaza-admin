import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import type { transactions } from "@/lib/api/client";
import { formatPrice } from "@/lib/format";

interface KpiRowProps {
  summary?: transactions.DashboardSummaryResponse;
}

export function KpiRow({ summary }: KpiRowProps) {
  const kpis = summary
    ? [
        {
          label: "Penjualan Hari Ini",
          value: formatPrice(summary.todayRevenue),
          note: `${summary.todayRevenueGrowthPercent >= 0 ? "+" : ""}${summary.todayRevenueGrowthPercent}% dibanding kemarin`,
          direction: summary.todayRevenueGrowthPercent >= 0 ? ("up" as const) : ("down" as const),
          highlight: true,
        },
        {
          label: "Transaksi Hari Ini",
          value: `${summary.todayOrdersCount}`,
          note: `${summary.todayOrdersGrowthPercent >= 0 ? "+" : ""}${summary.todayOrdersGrowthPercent}% dibanding kemarin`,
          direction: summary.todayOrdersGrowthPercent >= 0 ? ("up" as const) : ("down" as const),
          highlight: false,
        },
        {
          label: "Produk Aktif",
          value: `${summary.activeProductsCount}`,
          note: "Menu aktif",
          direction: "up" as const,
          highlight: false,
        },
        {
          label: "Stok Menipis",
          value: `${summary.lowStockCount}`,
          note: summary.lowStockCount > 0 ? "Perlu restock" : "Stok aman",
          direction: summary.lowStockCount > 0 ? ("down" as const) : ("up" as const),
          highlight: false,
        },
      ]
    : [
        {
          label: "Penjualan Hari Ini",
          value: "Rp 12,5jt",
          note: "Naik dari kemarin",
          direction: "up" as const,
          highlight: true,
        },
        {
          label: "Transaksi",
          value: "38",
          note: "Naik dari kemarin",
          direction: "up" as const,
          highlight: false,
        },
        {
          label: "Produk Aktif",
          value: "48",
          note: "3 produk baru",
          direction: "up" as const,
          highlight: false,
        },
        {
          label: "Stok Menipis",
          value: "2",
          note: "Perlu restock",
          direction: "down" as const,
          highlight: false,
        },
      ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const Trend = kpi.direction === "up" ? TrendingUp : TrendingDown;
        return (
          <div
            key={kpi.label}
            className={
              kpi.highlight
                ? "rounded-2xl border border-white/10 bg-brand-deep p-5 text-white shadow-xs"
                : "rounded-2xl border border-border bg-card p-5 shadow-xs"
            }
          >
            <div className="flex items-start justify-between gap-2">
              <p
                className={`text-sm font-medium ${kpi.highlight ? "text-white/80" : "text-muted-foreground"}`}
              >
                {kpi.label}
              </p>
              <span
                aria-hidden="true"
                className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
                  kpi.highlight ? "bg-white text-brand-deep" : "bg-muted text-muted-foreground"
                }`}
              >
                <ArrowUpRight className="size-3.5" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight">{kpi.value}</p>
            <div
              className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${
                kpi.highlight ? "text-white/80" : "text-muted-foreground"
              }`}
            >
              <Trend className="size-3.5" />
              <span>{kpi.note}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}

