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
import { toast } from "sonner"

import type { masters } from "@/lib/api/client"
import { deleteProductAction } from "./actions"

interface DeleteProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: masters.ProductWithCategory
  onSuccess: () => void
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: DeleteProductDialogProps) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = () => {
    startTransition(async () => {
      setError(null)
      const result = await deleteProductAction(product.id)

      if (!result.ok) {
        setError(result.error || "Gagal menghapus produk.")
        return
      }

      toast.success("Produk berhasil dihapus (soft-delete).")
      onSuccess()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">Hapus Produk</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Anda akan menghapus produk <strong>{product.name}</strong>.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Ini akan melakukan soft-delete: produk akan dinonaktifkan dan tidak akan muncul di daftar, tetapi data tetap tersimpan di database.
          </p>
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm"
            >
              {error}
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Konfirmasi Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
