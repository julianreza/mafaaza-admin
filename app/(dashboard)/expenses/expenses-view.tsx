"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Plus,
  Search,
  RotateCcw,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Briefcase,
  UserCheck,
  MoreHorizontal,
} from "lucide-react"
import type { expenses } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ExpenseFormDialog } from "./expense-form-dialog"
import { DeleteExpenseDialog } from "./delete-expense-dialog"

interface SummaryStats {
  totalMonth: number
  operationalMonth: number
  salaryMonth: number
  otherMonth: number
}

interface ExpensesViewProps {
  expenses: expenses.Expense[]
  total: number
  page: number
  limit: number
  summary: SummaryStats
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDateIndonesian(dateStr: string): string {
  if (!dateStr) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr))
}

function getCategoryBadge(category: expenses.ExpenseCategory) {
  switch (category) {
    case "operational":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900">
          Operasional
        </Badge>
      )
    case "salary":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900">
          Gaji / Salary
        </Badge>
      )
    case "purchase":
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-900">
          Pembelian
        </Badge>
      )
    case "utility":
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900">
          Utilitas
        </Badge>
      )
    case "other":
    default:
      return (
        <Badge variant="outline" className="bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
          Lainnya
        </Badge>
      )
  }
}

export function ExpensesView({
  expenses: items,
  total,
  page,
  limit,
  summary,
}: ExpensesViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "all")
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "")
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "")

  const [formOpen, setFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<expenses.Expense | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingExpense, setDeletingExpense] = useState<expenses.Expense | null>(null)

  const totalPages = Math.ceil(total / limit) || 1

  function updateQuery(newParams: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(newParams).forEach(([key, val]) => {
      if (val) {
        params.set(key, val)
      } else {
        params.delete(key)
      }
    })
    params.set("page", "1")
    router.push(`/expenses?${params.toString()}`)
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateQuery({ search: search.trim() || null })
  }

  function handleCategoryChange(val: string | null) {
    const categoryValue = val || "all"
    setCategory(categoryValue)
    updateQuery({ category: categoryValue === "all" ? null : categoryValue })
  }

  function handleStartDateChange(val: string) {
    setStartDate(val)
    updateQuery({ startDate: val || null })
  }

  function handleEndDateChange(val: string) {
    setEndDate(val)
    updateQuery({ endDate: val || null })
  }

  function handleResetFilters() {
    setSearch("")
    setCategory("all")
    setStartDate("")
    setEndDate("")
    router.push("/expenses")
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`/expenses?${params.toString()}`)
  }

  function openCreateModal() {
    setEditingExpense(null)
    setFormOpen(true)
  }

  function openEditModal(item: expenses.Expense) {
    setEditingExpense(item)
    setFormOpen(true)
  }

  function openDeleteModal(item: expenses.Expense) {
    setDeletingExpense(item)
    setDeleteOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Top Bar Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Daftar Pengeluaran
          </h2>
          <p className="text-sm text-muted-foreground">
            Kelola dan pantau semua transaksi pengeluaran operasional toko.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2 shrink-0">
          <Plus className="size-4" />
          <span>Catat Pengeluaran Baru</span>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Bulan Ini
            </span>
            <div className="rounded-lg bg-red-500/10 p-2 text-red-600">
              <TrendingDown className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            {formatIDR(summary.totalMonth)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Operasional
            </span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600">
              <Briefcase className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            {formatIDR(summary.operationalMonth)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Gaji / Salary
            </span>
            <div className="rounded-lg bg-green-500/10 p-2 text-green-600">
              <UserCheck className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            {formatIDR(summary.salaryMonth)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pengeluaran Lainnya
            </span>
            <div className="rounded-lg bg-zinc-500/10 p-2 text-zinc-600">
              <MoreHorizontal className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            {formatIDR(summary.otherMonth)}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari No. Ref / Deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </form>

          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="operational">Operasional</SelectItem>
              <SelectItem value="salary">Gaji / Salary</SelectItem>
              <SelectItem value="purchase">Pembelian</SelectItem>
              <SelectItem value="utility">Utilitas</SelectItem>
              <SelectItem value="other">Lainnya</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            placeholder="Tanggal Mulai"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
          />

          <Input
            type="date"
            placeholder="Tanggal Selesai"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="gap-2"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset Filter</span>
          </Button>
        </div>
      </div>

      {/* Table Data */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3.5">No. Referensi</th>
                <th className="px-4 py-3.5">Tanggal Kejadian</th>
                <th className="px-4 py-3.5">Kategori</th>
                <th className="px-4 py-3.5">Deskripsi</th>
                <th className="px-4 py-3.5 text-right">Jumlah</th>
                <th className="px-4 py-3.5">Dicatat Oleh</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    Belum ada data pengeluaran recorded.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-foreground">
                      {item.referenceNumber || "-"}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                      {formatDateIndonesian(item.occurredAt)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getCategoryBadge(item.category)}
                    </td>
                    <td className="px-4 py-3.5 text-foreground max-w-xs truncate">
                      {item.description}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-foreground whitespace-nowrap">
                      {formatIDR(item.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground truncate max-w-[120px]">
                      {item.recordedBy}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon" className="size-8" />}
                        >
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Aksi</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(item)}>
                            <Pencil className="mr-2 size-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteModal(item)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" />
                            <span>Hapus</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border px-4 py-3.5">
          <p className="text-xs text-muted-foreground">
            Halaman <span className="font-semibold text-foreground">{page}</span> dari{" "}
            <span className="font-semibold text-foreground">{totalPages}</span> (Total{" "}
            <span className="font-semibold text-foreground">{total}</span> data)
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="gap-1 text-xs"
            >
              <ChevronLeft className="size-3.5" />
              <span>Sebelumnya</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="gap-1 text-xs"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ExpenseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        expense={editingExpense}
      />
      <DeleteExpenseDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        expense={deletingExpense}
      />
    </div>
  )
}
