"use client"

import { useState } from "react"
import { toast } from "sonner"
import type { expenses } from "@/lib/api/client"
import { deleteExpenseAction } from "./actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: expenses.Expense | null
}

export function DeleteExpenseDialog({
  open,
  onOpenChange,
  expense,
}: DeleteExpenseDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  async function handleDelete() {
    if (!expense) return

    setSubmitting(true)
    const result = await deleteExpenseAction(expense.id)
    setSubmitting(false)

    if (result.ok) {
      toast.success("Pengeluaran berhasil dihapus")
      onOpenChange(false)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Pengeluaran</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus pengeluaran ini? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {expense && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm space-y-1 my-2">
            <p className="font-semibold text-foreground">{expense.description}</p>
            <p className="text-muted-foreground">
              No. Ref: <span className="font-mono">{expense.referenceNumber || "-"}</span>
            </p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={submitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {submitting ? "Menghapus..." : "Hapus Pengeluaran"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
