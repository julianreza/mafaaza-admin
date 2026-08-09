import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ReceiptText, Users, Wallet } from "lucide-react";

const stats = [
  {
    title: "Total Penjualan",
    value: "Rp 12.500.000",
    icon: ReceiptText,
    trend: "+12% dari kemarin",
    surface: "from-emerald-500/15 via-card to-card",
    iconSurface: "from-emerald-500 to-teal-500",
    trendColor: "text-emerald-700 dark:text-emerald-400",
  },
  {
    title: "Produk",
    value: "48",
    icon: Package,
    trend: "3 produk baru",
    surface: "from-blue-500/15 via-card to-card",
    iconSurface: "from-blue-500 to-indigo-500",
    trendColor: "text-blue-700 dark:text-blue-400",
  },
  {
    title: "Pelanggan",
    value: "127",
    icon: Users,
    trend: "+5 minggu ini",
    surface: "from-violet-500/15 via-card to-card",
    iconSurface: "from-violet-500 to-fuchsia-500",
    trendColor: "text-violet-700 dark:text-violet-400",
  },
  {
    title: "Pengeluaran",
    value: "Rp 3.200.000",
    icon: Wallet,
    trend: "-8% dari kemarin",
    surface: "from-amber-500/15 via-card to-card",
    iconSurface: "from-amber-500 to-orange-500",
    trendColor: "text-amber-700 dark:text-amber-400",
  },
];

const weeklyBars = [42, 58, 48, 76, 64, 88, 70];

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#f59e0b] px-6 py-7 text-white shadow-xl shadow-brand/20 animate-gradient-orbit sm:px-8">
        <div aria-hidden="true" className="absolute -right-16 -top-20 size-56 rounded-full bg-white/15 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-24 left-1/3 size-64 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">Ringkasan bisnis</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Pantau penjualan, stok, dan pelanggan dalam satu tempat.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/85">Gunakan ringkasan ini untuk melihat ritme bisnis hari ini dan menentukan langkah berikutnya.</p>
        </div>
      </section>

      <section aria-label="Statistik utama" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className={`overflow-hidden border-border/70 bg-gradient-to-br ${stat.surface} shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">{stat.title}</CardTitle>
              <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.iconSurface} text-white shadow-sm transition-transform duration-300 hover:scale-105`}>
                <stat.icon aria-hidden="true" className="size-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
              <p className={`mt-2 text-xs font-semibold ${stat.trendColor}`}>{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <Card className="overflow-hidden border-border/70 bg-card/90 shadow-sm backdrop-blur-sm xl:col-span-3">
          <CardHeader className="border-b border-border/70 bg-gradient-to-r from-brand/10 via-transparent to-accent-2/10">
            <CardTitle className="text-base font-semibold text-foreground">Performa penjualan minggu ini</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-end gap-3" aria-label="Grafik penjualan tujuh hari terakhir">
              {weeklyBars.map((height, index) => (
                <div key={height} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-28 w-full items-end rounded-lg bg-muted/70 p-1">
                    <div
                      aria-hidden="true"
                      className="w-full rounded-md bg-gradient-to-t from-brand to-brand-accent transition-all duration-700"
                      style={{ height: `${height}%`, transitionDelay: `${index * 70}ms` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">{["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][index]}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between rounded-xl bg-brand-soft/70 px-4 py-3 text-sm dark:bg-brand-soft/40">
              <span className="text-muted-foreground">Penjualan hari ini</span>
              <span className="font-semibold text-foreground">Rp 4.200.000</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-sm backdrop-blur-sm xl:col-span-2">
          <CardHeader className="border-b border-border/70 bg-gradient-to-r from-accent-2/10 via-transparent to-brand/10">
            <CardTitle className="text-base font-semibold text-foreground">Pengeluaran terbaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            {["Belanja operasional", "Transportasi", "Perlengkapan toko"].map((item, index) => (
              <div key={item} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${["bg-amber-500", "bg-violet-500", "bg-teal-500"][index]}`} />
                  <span className="truncate text-sm font-medium text-foreground">{item}</span>
                </div>
                <span className="shrink-0 text-sm font-semibold text-foreground">Rp 150.000</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
