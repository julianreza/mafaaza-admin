import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

import { getApiClientFromCookies } from "@/lib/api";
import { KpiRow } from "@/components/dashboard/kpi-row";
import { LowStockCard } from "@/components/dashboard/low-stock-card";
import { RecentOrdersCard } from "@/components/dashboard/recent-orders-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { ShiftCard } from "@/components/dashboard/shift-card";
import { TargetGauge } from "@/components/dashboard/target-gauge";
import { TopProductsCard } from "@/components/dashboard/top-products-card";

export default async function DashboardPage() {
  const api = getApiClientFromCookies((await cookies()).toString());

  try {
    await api.mafaaza_api.profile();
  } catch {
    redirect("/login");
  }

  // Fetch all 6 dashboard API endpoints in parallel gracefully
  const [
    summaryRes,
    chartRes,
    topRes,
    lowStockRes,
    recentRes,
    targetRes,
  ] = await Promise.allSettled([
    api.transactions.getDashboardSummary(),
    api.transactions.getSalesChart({ period: "today" }),
    api.transactions.getTopProducts({ limit: 5 }),
    api.masters.getLowStock({ limit: 5 }),
    api.transactions.getRecentOrders({ limit: 5 }),
    api.transactions.getSalesTarget(),
  ]);

  const summary = summaryRes.status === "fulfilled" ? summaryRes.value : undefined;
  const salesChart = chartRes.status === "fulfilled" ? chartRes.value : undefined;
  const topProducts = topRes.status === "fulfilled" ? topRes.value : undefined;
  const lowStock = lowStockRes.status === "fulfilled" ? lowStockRes.value : undefined;
  const recentOrders = recentRes.status === "fulfilled" ? recentRes.value : undefined;
  const target = targetRes.status === "fulfilled" ? targetRes.value : undefined;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pantau penjualan, stok, dan transaksi outlet Mafaaza Anda.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/orders"
            className="flex items-center gap-1.5 rounded-full bg-brand-deep px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-xs"
          >
            <Plus aria-hidden="true" className="size-4" />
            Transaksi Baru
          </Link>
        </div>
      </div>

      <KpiRow summary={summary} />

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <div className="xl:col-span-2">
          <SalesChart points={salesChart?.points} />
        </div>
        <LowStockCard products={lowStock?.products} />
        <RecentOrdersCard orders={recentOrders?.orders} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <TopProductsCard products={topProducts?.products} />
        <TargetGauge target={target} />
        <ShiftCard />
      </section>
    </div>
  );
}

