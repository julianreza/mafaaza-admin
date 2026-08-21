"use client"

import { useState, useTransition, useMemo } from "react"
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { toast } from "sonner"

import type { masters } from "@/lib/api/client"
import { createProductAction, updateProductAction } from "./actions"

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: masters.ProductWithCategory | null
  categories?: masters.Category[]
  onSuccess: () => void
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories = [],
  onSuccess,
}: ProductFormDialogProps) {
  const [pending, startTransition] = useTransition()

  const [name, setName] = useState(() => product?.name ?? "")
  const [categoryId, setCategoryId] = useState(() => product?.categoryId ?? "")
  const [sku, setSku] = useState(() => product?.sku ?? "")
  const [price, setPrice] = useState(() => product?.price?.toString() ?? "")
  const [unit, setUnit] = useState(() => product?.unit ?? "pcs")
  const [description, setDescription] = useState(() => product?.description ?? "")
  const [isActive, setIsActive] = useState(() => product?.isActive ?? true)

  const isEdit = !!product

  // Include inactive category if current product is assigned to it
  const availableCategories = useMemo(() => {
    const list = [...categories]
    if (
      product?.categoryId &&
      !list.some((c) => c.id === product.categoryId)
    ) {
      list.unshift({
        id: product.categoryId,
        name: product.categoryName || "Kategori Terpilih",
        description: null,
        isActive: false,
        createdAt: "",
        updatedAt: "",
      })
    }
    return list
  }, [categories, product])

  // Select items format mapping for Base UI Select
  const categorySelectItems = useMemo(() => {
    return [
      { value: "none", label: "Tanpa Kategori" },
      ...availableCategories.map((cat) => ({
        value: cat.id,
        label: cat.name,
      })),
    ]
  }, [availableCategories])

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
      formData.append("categoryId", categoryId)
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
            <Label htmlFor="category">Kategori</Label>
            <Select
              items={categorySelectItems}
              value={categoryId || "none"}
              onValueChange={(val) => setCategoryId(val === "none" ? "" : (val ?? ""))}
              disabled={pending}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Pilih kategori (opsional)">
                  {(val) => {
                    const item = categorySelectItems.find((i) => i.value === val)
                    return item ? item.label : "Pilih kategori (opsional)"
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categorySelectItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
