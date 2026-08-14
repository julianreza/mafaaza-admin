import { AlertTriangle, ShoppingCart } from "lucide-react";
import type { dashboard } from "@/lib/api/client";

interface LowStockCardProps {
  products?: dashboard.LowStockItem[];
}

export function LowStockCard({ products }: LowStockCardProps) {
  const itemList = products
    ? products.map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        min: p.minStock,
        unit: p.unit || "unit",
      }))
    : [
        { id: "1", name: "Dada Ayam Potong", stock: 3, min: 10, unit: "kg" },
        { id: "2", name: "Minyak Goreng Padat", stock: 5, min: 12, unit: "pouch" },
      ];

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-xs">
      <h2 className="text-base font-bold text-foreground">Stok Menipis</h2>

      {itemList.length === 0 ? (
        <div className="mt-4 flex flex-1 items-center justify-center py-6 text-xs text-muted-foreground">
          Semua stok bahan dalam kondisi aman.
        </div>
      ) : (
        <ul className="mt-4 flex-1 space-y-4">
          {itemList.map((item) => (
            <li key={item.id} className="flex items-start gap-2.5">
              <AlertTriangle
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Sisa {item.stock} {item.unit} · minimum {item.min} {item.unit}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-deep px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        <ShoppingCart aria-hidden="true" className="size-4" />
        Buat Pesanan Beli
      </button>
    </div>
  );
}

