"use client"

import { useState, useTransition, useMemo } from "react"

import { Loader2, PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

import type { masters } from "@/lib/api/client"
import { formatPrice } from "@/lib/format"
import { createOrderAction } from "./actions"

interface OrderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: masters.ProductWithCategory[]
  onSuccess: () => void
}

// A single editable cart line. `unitPrice` is a string so the input can be left
// blank (meaning "use the product's default price" on the backend).
interface LineItem {
  key: string
  productId: string
  quantity: string
}

function newLine(): LineItem {
  return { key: crypto.randomUUID(), productId: "", quantity: "1" }
}

export function OrderFormDialog({
  open,
  onOpenChange,
  products,
  onSuccess,
}: OrderFormDialogProps) {
  const [pending, startTransition] = useTransition()

  const [items, setItems] = useState<LineItem[]>(() => [newLine()])
  const [discount, setDiscount] = useState("")
  const [notes, setNotes] = useState("")

  const productById = useMemo(() => {
    const map = new Map<string, masters.ProductWithCategory>()
    for (const p of products) map.set(p.id, p)
    return map
  }, [products])

  const updateLine = (key: string, patch: Partial<LineItem>) => {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)))
  }

  const addLine = () => setItems((prev) => [...prev, newLine()])

  const removeLine = (key: string) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.key !== key) : prev))

  // Live subtotal calculation using the selected product's default price.
  const estimatedSubtotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const product = productById.get(it.productId)
      const qty = parseFloat(it.quantity)
      const price = product?.price ?? 0
      if (!Number.isFinite(qty) || !Number.isFinite(price)) return sum
      return sum + qty * price
    }, 0)
  }, [items, productById])

  const estimatedTotal = useMemo(() => {
    const disc = discount !== "" ? parseFloat(discount) : 0
    const total = estimatedSubtotal - (Number.isFinite(disc) ? disc : 0)
    return total > 0 ? total : 0
  }, [estimatedSubtotal, discount])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side validation
    const cleaned = items.filter((it) => it.productId)
    if (cleaned.length === 0) {
      toast.error("Pesanan harus memiliki minimal satu item dengan produk.")
      return
    }
    for (const it of cleaned) {
      const qty = parseFloat(it.quantity)
      if (!Number.isFinite(qty) || qty <= 0) {
        toast.error("Jumlah setiap item harus lebih dari 0.")
        return
      }
    }
    if (discount !== "") {
      const disc = parseFloat(discount)
      if (!Number.isFinite(disc) || disc < 0) {
        toast.error("Diskon harus berupa angka >= 0.")
        return
      }
    }

    const payload = cleaned.map((it) => ({
      productId: it.productId,
      quantity: parseFloat(it.quantity),
    }))

    startTransition(async () => {
      const formData = new FormData()
      formData.append("items", JSON.stringify(payload))
      if (discount) formData.append("discountAmount", discount)
      if (notes) formData.append("notes", notes)

      const result = await createOrderAction({ ok: false }, formData)

      if (!result.ok) {
        toast.error(result.error || "Terjadi kesalahan.")
        return
      }

      toast.success("Pesanan berhasil dibuat.")
      onSuccess()
    }) 
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Buat Pesanan Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-3">
            <Label>Item Pesanan <span className="text-destructive">*</span></Label>
            {items.map((line) => {
              const selected = productById.get(line.productId)
              return (
                <div
                  key={line.key}
                  className="grid grid-cols-[1fr_auto] gap-2 rounded-lg border border-border/70 p-3"
                >
                  <div className="grid gap-2.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start font-normal"
                            disabled={pending}
                          />
                        }
                      >
                        {selected ? selected.name : "Pilih produk..."}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="max-h-64 w-64 overflow-y-auto">
                        {products.length === 0 ? (
                          <DropdownMenuItem disabled>Tidak ada produk aktif</DropdownMenuItem>
                        ) : (
                          products.map((p) => (
                            <DropdownMenuItem
                              key={p.id}
                              onClick={() => updateLine(line.key, { productId: p.id })}
                            >
                              <span className="flex-1 truncate">{p.name}</span>
                              <span className="ml-2 text-xs text-muted-foreground">
                                {formatPrice(p.price)}
                              </span>
                            </DropdownMenuItem>
                          ))
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 grid gap-1">
                        <Label className="text-xs text-muted-foreground">Jumlah</Label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={line.quantity}
                          onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
                          disabled={pending}
                        />
                      </div>
                      <div className="flex flex-col items-end justify-center pt-4 text-xs">
                        <span className="text-muted-foreground font-medium">Harga Satuan</span>
                        <span className="font-semibold text-foreground text-sm">
                          {selected ? formatPrice(selected.price) : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 self-start text-destructive"
                    onClick={() => removeLine(line.key)}
                    disabled={pending || items.length <= 1}
                    aria-label="Hapus item"
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              )
            })}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="justify-self-start"
              onClick={addLine}
              disabled={pending}
            >
              <PlusIcon className="mr-2 size-4" />
              Tambah Item
            </Button>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="discount">Diskon (Opsional)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="0"
              disabled={pending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan pesanan..."
              disabled={pending}
            />
          </div>

          <div className="rounded-lg bg-muted/40 px-4 py-3 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Estimasi Subtotal</span>
              <span>{formatPrice(estimatedSubtotal)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between font-medium text-foreground">
              <span>Estimasi Total</span>
              <span>{formatPrice(estimatedTotal)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Buat Pesanan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
