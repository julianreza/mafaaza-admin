"use client"

import { useState, useTransition } from "react"

import { Loader2 } from "lucide-react"

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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

import type { masters } from "@/lib/api/client"
import { createProductAction, updateProductAction } from "./actions"

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: masters.ProductWithCategory | null
  onSuccess: () => void
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductFormDialogProps) {
  const [pending, startTransition] = useTransition()

  const [name, setName] = useState(() => product?.name ?? "")
  const [sku, setSku] = useState(() => product?.sku ?? "")
  const [price, setPrice] = useState(() => product?.price?.toString() ?? "")
  const [unit, setUnit] = useState(() => product?.unit ?? "pcs")
  const [description, setDescription] = useState(() => product?.description ?? "")
  const [isActive, setIsActive] = useState(() => product?.isActive ?? true)

  const isEdit = !!product

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const priceNum = parseFloat(price)
    if (!name.trim()) {
      toast.error("Nama produk wajib diisi.")
      return
    }
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Harga harus berupa angka >= 0.")
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append("name", name)
      if (sku) formData.append("sku", sku)
      formData.append("price", price)
      if (unit) formData.append("unit", unit)
      if (description) formData.append("description", description)
      if (isEdit) formData.append("isActive", isActive ? "on" : "")

      let result: { ok: boolean; error?: string }

      if (isEdit && product) {
        result = await updateProductAction(product.id, formData)
      } else {
        result = await createProductAction({ ok: false }, formData)
      }

      if (!result.ok) {
        toast.error(result.error || "Terjadi kesalahan.")
        return
      }

      toast.success(isEdit ? "Produk berhasil diperbarui." : "Produk berhasil ditambahkan.")
      onSuccess()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nama <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama produk..."
              required
              disabled={pending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sku">SKU (Opsional)</Label>
            <Input
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="SKU produk..."
              disabled={pending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Harga <span className="text-destructive">*</span></Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              required
              disabled={pending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="unit">Satuan</Label>
            <Input
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="pcs"
              disabled={pending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi produk..."
              disabled={pending}
            />
          </div>

          {isEdit && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked: boolean) => setIsActive(checked)}
                disabled={pending}
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
