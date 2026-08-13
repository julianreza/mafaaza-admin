"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import type { expenses } from "@/lib/api/client"
import { createExpenseAction, updateExpenseAction } from "./actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ExpenseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: expenses.Expense | null
}

const CATEGORIES: { label: string; value: expenses.ExpenseCategory }[] = [
  { label: "Operasional", value: "operational" },
  { label: "Gaji / Salary", value: "salary" },
  { label: "Pembelian", value: "purchase" },
  { label: "Utilitas", value: "utility" },
  { label: "Lainnya", value: "other" },
]

export function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
}: ExpenseFormDialogProps) {
  const isEditing = !!expense

  const [category, setCategory] = useState<expenses.ExpenseCategory>("operational")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [occurredAt, setOccurredAt] = useState("")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setErrorMessage(null)
      if (expense) {
        setCategory(expense.category)
        setDescription(expense.description)
        setAmount(expense.amount.toString())
        const dateStr = expense.occurredAt
          ? new Date(expense.occurredAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
        setOccurredAt(dateStr)
        setReferenceNumber(expense.referenceNumber || "")
      } else {
        setCategory("operational")
        setDescription("")
        setAmount("")
        setOccurredAt(new Date().toISOString().split("T")[0])
        setReferenceNumber("")
      }
    }
  }, [open, expense])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMessage(null)

    if (!description.trim()) {
      setErrorMessage("Deskripsi pengeluaran wajib diisi.")
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage("Nominal harus berupa angka > 0.")
      return
    }

    setSubmitting(true)
    const formData = new FormData()
    formData.append("category", category)
    formData.append("description", description)
    formData.append("amount", amount)
    formData.append("occurredAt", occurredAt)
    if (referenceNumber.trim()) {
      formData.append("referenceNumber", referenceNumber.trim())
    }

    let result
    if (isEditing && expense) {
      result = await updateExpenseAction(expense.id, formData)
    } else {
      result = await createExpenseAction(formData)
    }

    setSubmitting(false)

    if (result.ok) {
      toast.success(
        isEditing
          ? "Pengeluaran berhasil diperbarui"
          : "Pengeluaran berhasil dicatat"
      )
      onOpenChange(false)
    } else {
      setErrorMessage(result.error)
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Pengeluaran" : "Catat Pengeluaran Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Ubah rincian data pengeluaran."
              : "Masukkan informasi pengeluaran baru operasional toko Anda."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMessage && (
            <div className="rounded-lg bg-destructive/15 p-3 text-sm font-medium text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select
              value={category}
              onValueChange={(val) => setCategory(val as expenses.ExpenseCategory)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Deskripsi <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Contoh: Pembelian ATK Kantor"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                Jumlah / Nominal (IDR) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="any"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occurredAt">Tanggal Pengeluaran</Label>
              <Input
                id="occurredAt"
                type="date"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                required
              />
            </div>
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="referenceNumber">No. Referensi (Opsional)</Label>
              <Input
                id="referenceNumber"
                placeholder="Kosongkan untuk otomatis di-generate (EXP/...)"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? isEditing
                  ? "Menyimpan..."
                  : "Menambahkan..."
                : isEditing
                ? "Simpan Perubahan"
                : "Catat Pengeluaran"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
