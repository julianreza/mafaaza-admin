import type { dashboard } from "@/lib/api/client";
import { formatPrice } from "@/lib/format";

interface TopProductsCardProps {
  products?: dashboard.TopProductItem[];
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TopProductsCard({ products }: TopProductsCardProps) {
  const itemList = products
    ? products.map((p) => ({
        id: p.id,
        name: p.name,
        sold: p.quantitySold,
        revenue: formatPrice(p.totalRevenue),
      }))
    : [
        { id: "1", name: "Paket Ayam Krispi Dada + Nasi", sold: 142, revenue: "Rp 2.840.000" },
        { id: "2", name: "Paket Geprek Sambal Bawang", sold: 98, revenue: "Rp 2.156.000" },
        { id: "3", name: "Ayam Goreng Paha Atas", sold: 74, revenue: "Rp 1.110.000" },
      ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-foreground">Produk Terlaris</h2>
        <span className="text-xs text-muted-foreground">Total Porsi Terjual</span>
      </div>

      {itemList.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted-foreground">
          Belum ada data penjualan produk.
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {itemList.map((product) => (
            <li key={product.id} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand"
              >
                {initials(product.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Terjual {product.sold} porsi
                </p>
              </div>
              <span className="shrink-0 font-semibold text-xs text-foreground">
                {product.revenue}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

