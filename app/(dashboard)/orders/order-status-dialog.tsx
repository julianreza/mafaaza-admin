"use client"

import { useState, useTransition } from "react"

import { Loader2, ChevronDownIcon } from "lucide-react"

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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

import type { transactions } from "@/lib/api/client"
import { formatPrice } from "@/lib/format"
import { updateOrderStatusAction } from "./actions"

type OrderRow = transactions.ListOrdersResponse["orders"][number]

interface OrderStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: OrderRow
  onSuccess: () => void
}

const STATUS_OPTIONS: { value: transactions.OrderStatus; label: string }[] = [
  { value: "draft", label: "Draf" },
  { value: "confirmed", label: "Dikonfirmasi" },
  { value: "paid", label: "Lunas" },
  { value: "cancelled", label: "Dibatalkan" },
]

export function OrderStatusDialog({
  open,
  onOpenChange,
  order,
  onSuccess,
}: OrderStatusDialogProps) {
  const [pending, startTransition] = useTransition()

  const [status, setStatus] = useState<transactions.OrderStatus>(order.status)
  const [paidAmount, setPaidAmount] = useState(
    order.paidAmount ? String(order.paidAmount) : ""
  )

  const statusLabel =
    STATUS_OPTIONS.find((o) => o.value === status)?.label ?? "Pilih status..."

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (status === "paid") {
      const paid = parseFloat(paidAmount)
      if (paidAmount === "" || isNaN(paid) || paid < 0) {
        toast.error("Jumlah dibayar wajib diisi (>= 0) saat menandai lunas.")
        return
      }
      if (paid < order.totalAmount) {
        toast.error("Jumlah dibayar harus menutupi total pesanan.")
        return
      }
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append("status", status)
      if (paidAmount !== "") formData.append("paidAmount", paidAmount)

      const result = await updateOrderStatusAction(order.id, formData)

      if (!result.ok) {
        toast.error(result.error || "Terjadi kesalahan.")
        return
      }

      toast.success("Status pesanan berhasil diperbarui.")
      onSuccess()
    }) 
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Status Pesanan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="rounded-lg bg-muted/40 px-4 py-3 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>No. Invoice</span>
              <span className="font-medium text-foreground">{order.invoiceNumber || "—"}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-muted-foreground">
              <span>Total</span>
              <span className="font-medium text-foreground">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Status</Label>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between font-normal"
                    disabled={pending}
                  />
                }
              >
                {statusLabel}
                <ChevronDownIcon className="size-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[--anchor-width]">
                {STATUS_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setStatus(option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {status === "paid" && (
            <div className="grid gap-2">
              <Label htmlFor="paidAmount">
                Jumlah Dibayar <span className="text-destructive">*</span>
              </Label>
              <Input
                id="paidAmount"
                type="number"
                min="0"
                step="0.01"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="0"
                required
                disabled={pending}
              />
              <p className="text-xs text-muted-foreground">
                Wajib diisi saat menandai pesanan sebagai lunas.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
