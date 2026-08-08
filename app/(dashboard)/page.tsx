import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptText, Package, Users, Wallet } from "lucide-react";

const stats = [
  {
    title: "Total Penjualan",
    value: "Rp 12.500.000",
    icon: ReceiptText,
    trend: "+12% dari kemarin",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Produk",
    value: "48",
    icon: Package,
    trend: "3 produk baru",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    title: "Pelanggan",
    value: "127",
    icon: Users,
    trend: "+5 minggu ini",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Pengeluaran",
    value: "Rp 3.200.000",
    icon: Wallet,
    trend: "-8% dari kemarin",
    gradient: "from-orange-500 to-red-500",
  },
];

export default function DashboardPage() {
  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Ringkasan aktivitas bisnis hari ini
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-3d shadow-sm hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`bg-gradient-to-br ${stat.gradient} text-white rounded-lg p-1.5 shadow-sm`}>
                <stat.icon className="h-3.5 w-3.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-brand to-accent-2 bg-clip-text text-transparent">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="border-b border-foreground/10 bg-gradient-to-r from-brand/5 via-transparent to-accent-2/5">
            <CardTitle className="text-base">Ringkasan Penjualan</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <p className="text-sm text-muted-foreground">
              Statistik penjualan akan ditampilkan di sini setelah integrasi API selesai.
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader className="border-b border-foreground/10 bg-gradient-to-r from-brand/5 via-transparent to-accent-2/5">
            <CardTitle className="text-base">Pengeluaran Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full bg-gradient-to-br from-brand to-accent-2`} />
                    <span className="text-muted-foreground">Pengeluaran operasional</span>
                  </div>
                  <span className="font-medium bg-gradient-to-r from-brand to-accent-2 bg-clip-text text-transparent">Rp 150.000</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
