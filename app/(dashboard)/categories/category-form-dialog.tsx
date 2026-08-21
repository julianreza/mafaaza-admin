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
import { createCategoryAction, updateCategoryAction } from "./actions"

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: masters.Category | null
  onSuccess: () => void
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryFormDialogProps) {
  const [pending, startTransition] = useTransition()

  const [name, setName] = useState(() => category?.name ?? "")
  const [description, setDescription] = useState(() => category?.description ?? "")
  const [isActive, setIsActive] = useState(() => category?.isActive ?? true)

  const isEdit = !!category

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Nama kategori wajib diisi.")
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append("name", name)
      if (description) formData.append("description", description)
      if (isEdit) formData.append("isActive", isActive ? "on" : "")

      let result: { ok: boolean; error?: string }

      if (isEdit && category) {
        result = await updateCategoryAction(category.id, formData)
      } else {
        result = await createCategoryAction({ ok: false }, formData)
      }

      if (!result.ok) {
        toast.error(result.error || "Terjadi kesalahan.")
        return
      }

      toast.success(isEdit ? "Kategori berhasil diperbarui." : "Kategori berhasil ditambahkan.")
      onSuccess()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              Nama <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama kategori..."
              required
              disabled={pending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi kategori (opsional)..."
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
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
