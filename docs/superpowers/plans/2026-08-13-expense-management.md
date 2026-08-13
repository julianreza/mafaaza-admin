# Expense Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the Expense Management module in `mafaaza-admin` frontend under `/expenses`, fully integrated with the Encore backend `expenses` service.

**Architecture:** Build a Next.js App Router page (`/expenses`) using Server Components for auth check and data fetching, Server Actions for CRUD operations (`createExpense`, `updateExpense`, `deleteExpense`), and Client Components for Stat Cards summary, search/filter controls, data table display, dialog modals, and pagination.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Shadcn UI / Radix components, Lucide React icons, Vitest.

## Global Constraints
- Strictly follow IDR currency formatting: `new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)`
- Strictly follow Indonesian date formatting for `occurredAt`: `new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date))` (e.g., `13 Agt 2026`).
- Category badges mapping: `operational` (blue), `salary` (green), `purchase` (purple), `utility` (yellow/amber), `other` (gray).
- Server Actions must check auth and authorization (`ALLOWED_MUTATE_ROLES = ["admin"]`) and catch backend errors safely.

---

### Task 1: Navigation Sidebar Link & Server Actions

**Files:**
- Create: `app/(dashboard)/expenses/actions.ts`
- Modify: `components/app-sidebar.tsx:33-40`
- Test: `app/(dashboard)/expenses/actions.test.ts`

**Interfaces:**
- Consumes: `getApiClientFromCookies` from `@/lib/api`, `expenses.ExpenseCategory` from `@/lib/api/client`
- Produces: `createExpenseAction`, `updateExpenseAction`, `deleteExpenseAction`

- [ ] **Step 1: Write failing test for expense server actions**

Create `app/(dashboard)/expenses/actions.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"

const { profile, createExpense, updateExpense, deleteExpense, revalidatePath } =
  vi.hoisted(() => ({
    profile: vi.fn(),
    createExpense: vi.fn(),
    updateExpense: vi.fn(),
    deleteExpense: vi.fn(),
    revalidatePath: vi.fn(),
  }))

vi.mock("@/lib/api", () => ({
  getApiClientFromCookies: () => ({
    mafaaza_api: { profile },
    expenses: { createExpense, updateExpense, deleteExpense },
  }),
}))

vi.mock("next/headers", () => ({
  cookies: async () => ({ toString: () => "better-auth.session_token=abc" }),
}))

vi.mock("next/cache", () => ({ revalidatePath }))

import {
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
} from "@/app/(dashboard)/expenses/actions"

function fd(entries: Record<string, string>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(entries)) f.append(k, v)
  return f
}

beforeEach(() => {
  vi.clearAllMocks()
  profile.mockResolvedValue({ email: "admin@mafaaza.test", role: "admin" })
})

describe("createExpenseAction", () => {
  it("requires a non-empty description", async () => {
    const res = await createExpenseAction(fd({ description: "  ", amount: "10000" }))
    expect(res).toEqual({ ok: false, error: "Deskripsi pengeluaran wajib diisi." })
    expect(createExpense).not.toHaveBeenCalled()
  })

  it("requires amount > 0", async () => {
    const res = await createExpenseAction(fd({ description: "Pembelian Kertas", amount: "0" }))
    expect(res).toEqual({ ok: false, error: "Nominal pengeluaran harus lebih besar dari 0." })
    expect(createExpense).not.toHaveBeenCalled()
  })

  it("creates an expense successfully and revalidates path", async () => {
    createExpense.mockResolvedValueOnce({ expense: { id: "exp-1" } })
    const res = await createExpenseAction(
      fd({
        category: "operational",
        description: "Listrik Kantor",
        amount: "150000",
        occurredAt: "2026-08-13",
        referenceNumber: "EXP/2026/08/0001",
      })
    )
    expect(res).toEqual({ ok: true })
    expect(createExpense).toHaveBeenCalledWith({
      category: "operational",
      description: "Listrik Kantor",
      amount: 150000,
      occurredAt: "2026-08-13",
      referenceNumber: "EXP/2026/08/0001",
    })
    expect(revalidatePath).toHaveBeenCalledWith("/expenses")
  })
})

describe("updateExpenseAction", () => {
  it("updates an expense successfully and revalidates path", async () => {
    updateExpense.mockResolvedValueOnce({ expense: { id: "exp-1" } })
    const res = await updateExpenseAction(
      "exp-1",
      fd({
        category: "salary",
        description: "Gaji Staf",
        amount: "3000000",
        occurredAt: "2026-08-13",
      })
    )
    expect(res).toEqual({ ok: true })
    expect(updateExpense).toHaveBeenCalledWith("exp-1", {
      category: "salary",
      description: "Gaji Staf",
      amount: 3000000,
      occurredAt: "2026-08-13",
    })
    expect(revalidatePath).toHaveBeenCalledWith("/expenses")
  })
})

describe("deleteExpenseAction", () => {
  it("deletes an expense successfully and revalidates path", async () => {
    deleteExpense.mockResolvedValueOnce({ success: true })
    const res = await deleteExpenseAction("exp-1")
    expect(res).toEqual({ ok: true })
    expect(deleteExpense).toHaveBeenCalledWith("exp-1")
    expect(revalidatePath).toHaveBeenCalledWith("/expenses")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/\(dashboard\)/expenses/actions.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Write Server Actions implementation & update app-sidebar.tsx**

Create `app/(dashboard)/expenses/actions.ts`:
```typescript
"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { getApiClientFromCookies, type Client } from "@/lib/api"
import type { expenses } from "@/lib/api/client"

type ActionResult = { ok: true } | { ok: false; error: string }

const GENERIC_ERROR = "Terjadi kesalahan. Silakan coba lagi."
const SESSION_ERROR = "Sesi Anda telah berakhir. Silakan masuk kembali."
const AUTHZ_ERROR = "Anda tidak memiliki izin untuk melakukan tindakan ini."
const ALLOWED_MUTATE_ROLES: readonly string[] = ["admin"]

async function getMutatingApi(): Promise<{ api: Client } | { error: string }> {
  const api = getApiClientFromCookies((await cookies()).toString())
  try {
    const profile = await api.mafaaza_api.profile()
    if (!ALLOWED_MUTATE_ROLES.includes(profile.role)) {
      return { error: AUTHZ_ERROR }
    }
    return { api }
  } catch {
    return { error: SESSION_ERROR }
  }
}

export async function createExpenseAction(formData: FormData): Promise<ActionResult> {
  const auth = await getMutatingApi()
  if ("error" in auth) return { ok: false, error: auth.error }

  const category = (formData.get("category") as expenses.ExpenseCategory) || "other"
  const description = (formData.get("description") as string)?.trim()
  const amountStr = formData.get("amount") as string
  const occurredAt = (formData.get("occurredAt") as string) || undefined
  const referenceNumber = (formData.get("referenceNumber") as string)?.trim() || undefined

  if (!description) {
    return { ok: false, error: "Deskripsi pengeluaran wajib diisi." }
  }

  const amount = parseFloat(amountStr || "0")
  if (isNaN(amount) || amount <= 0) {
    return { ok: false, error: "Nominal pengeluaran harus lebih besar dari 0." }
  }

  try {
    await auth.api.expenses.createExpense({
      category,
      description,
      amount,
      occurredAt,
      referenceNumber,
    })

    revalidatePath("/expenses")
    return { ok: true }
  } catch (err) {
    console.error("[createExpenseAction] failed:", err)
    return { ok: false, error: GENERIC_ERROR }
  }
}

export async function updateExpenseAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const auth = await getMutatingApi()
  if ("error" in auth) return { ok: false, error: auth.error }

  const category = (formData.get("category") as expenses.ExpenseCategory) || undefined
  const description = (formData.get("description") as string)?.trim()
  const amountStr = formData.get("amount") as string | undefined
  const occurredAt = (formData.get("occurredAt") as string) || undefined

  if (description !== undefined && description === "") {
    return { ok: false, error: "Deskripsi pengeluaran wajib diisi." }
  }

  const amount = amountStr ? parseFloat(amountStr) : undefined
  if (amount !== undefined && (isNaN(amount) || amount <= 0)) {
    return { ok: false, error: "Nominal pengeluaran harus lebih besar dari 0." }
  }

  try {
    await auth.api.expenses.updateExpense(id, {
      category,
      description,
      amount,
      occurredAt,
    })

    revalidatePath("/expenses")
    return { ok: true }
  } catch (err) {
    console.error("[updateExpenseAction] failed:", err)
    return { ok: false, error: GENERIC_ERROR }
  }
}

export async function deleteExpenseAction(id: string): Promise<ActionResult> {
  const auth = await getMutatingApi()
  if ("error" in auth) return { ok: false, error: auth.error }

  try {
    await auth.api.expenses.deleteExpense(id)
    revalidatePath("/expenses")
    return { ok: true }
  } catch (err) {
    console.error("[deleteExpenseAction] failed:", err)
    return { ok: false, error: GENERIC_ERROR }
  }
}
```

In `components/app-sidebar.tsx`, import `Wallet` from `lucide-react` and add `{ title: "Pengeluaran", href: "/expenses", icon: Wallet }` to `menuItems`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/\(dashboard\)/expenses/actions.test.ts`
Expected: PASS

- [ ] **Step 5: Commit Task 1**

```bash
git add app/\(dashboard\)/expenses/actions.ts app/\(dashboard\)/expenses/actions.test.ts components/app-sidebar.tsx
git commit -m "feat(expenses): add server actions and sidebar navigation link"
```

---

### Task 2: Expense Form Dialog (`app/(dashboard)/expenses/expense-form-dialog.tsx`)

**Files:**
- Create: `app/(dashboard)/expenses/expense-form-dialog.tsx`

**Interfaces:**
- Consumes: `expenses.Expense` from `@/lib/api/client`, `createExpenseAction`, `updateExpenseAction` from `./actions`
- Produces: `ExpenseFormDialog` component

- [ ] **Step 1: Create ExpenseFormDialog component**

Create `app/(dashboard)/expenses/expense-form-dialog.tsx`:
```tsx
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
```

- [ ] **Step 2: Commit Task 2**

```bash
git add app/\(dashboard\)/expenses/expense-form-dialog.tsx
git commit -m "feat(expenses): add expense form modal component"
```

---

### Task 3: Delete Expense Dialog Component (`app/(dashboard)/expenses/delete-expense-dialog.tsx`)

**Files:**
- Create: `app/(dashboard)/expenses/delete-expense-dialog.tsx`

**Interfaces:**
- Consumes: `expenses.Expense` from `@/lib/api/client`, `deleteExpenseAction` from `./actions`
- Produces: `DeleteExpenseDialog` component

- [ ] **Step 1: Create DeleteExpenseDialog component**

Create `app/(dashboard)/expenses/delete-expense-dialog.tsx`:
```tsx
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
```

- [ ] **Step 2: Commit Task 3**

```bash
git add app/\(dashboard\)/expenses/delete-expense-dialog.tsx
git commit -m "feat(expenses): add delete expense alert dialog component"
```

---

### Task 4: Client Expenses View (`app/(dashboard)/expenses/expenses-view.tsx`)

**Files:**
- Create: `app/(dashboard)/expenses/expenses-view.tsx`

**Interfaces:**
- Consumes: `expenses.Expense`, `expenses.ExpenseCategory` from `@/lib/api/client`, `ExpenseFormDialog`, `DeleteExpenseDialog`
- Produces: `ExpensesView` component

- [ ] **Step 1: Create ExpensesView component**

Create `app/(dashboard)/expenses/expenses-view.tsx`:
```tsx
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

  function handleCategoryChange(val: string) {
    setCategory(val)
    updateQuery({ category: val === "all" ? null : val })
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
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8" />} />
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Aksi</span>
                          </Button>
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
```

- [ ] **Step 2: Commit Task 4**

```bash
git add app/\(dashboard\)/expenses/expenses-view.tsx
git commit -m "feat(expenses): add client expenses view component with stat cards, filters, and table"
```

---

### Task 5: Expenses Page Server Component & Page Test (`app/(dashboard)/expenses/page.tsx`)

**Files:**
- Create: `app/(dashboard)/expenses/page.tsx`
- Create: `app/(dashboard)/expenses/page.test.tsx`

**Interfaces:**
- Consumes: `getApiClientFromCookies` from `@/lib/api`, `ExpensesView` component
- Produces: `/expenses` route page

- [ ] **Step 1: Write failing test for expenses page**

Create `app/(dashboard)/expenses/page.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

const { profile, listExpenses } = vi.hoisted(() => ({
  profile: vi.fn(),
  listExpenses: vi.fn(),
}))

vi.mock("@/lib/api", () => ({
  getApiClientFromCookies: () => ({
    mafaaza_api: { profile },
    expenses: { listExpenses },
  }),
}))

vi.mock("next/headers", () => ({
  cookies: async () => ({ toString: () => "session=abc" }),
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

import ExpensesPage from "./page"

beforeEach(() => {
  vi.clearAllMocks()
  profile.mockResolvedValue({ email: "admin@mafaaza.test", role: "admin" })
  listExpenses.mockResolvedValue({
    expenses: [
      {
        id: "exp-1",
        referenceNumber: "EXP/2026/08/0001",
        category: "operational",
        description: "Listrik",
        amount: 500000,
        recordedBy: "admin",
        occurredAt: "2026-08-13T00:00:00Z",
        createdAt: "2026-08-13T00:00:00Z",
        updatedAt: "2026-08-13T00:00:00Z",
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  })
})

describe("ExpensesPage", () => {
  it("renders page header and expenses data", async () => {
    const pageComponent = await ExpensesPage({ searchParams: Promise.resolve({}) })
    render(pageComponent)
    expect(screen.getByText("Manajemen Pengeluaran")).toBeInTheDocument()
    expect(screen.getByText("EXP/2026/08/0001")).toBeInTheDocument()
    expect(screen.getByText("Listrik")).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/\(dashboard\)/expenses/page.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Write ExpensesPage Server Component implementation**

Create `app/(dashboard)/expenses/page.tsx`:
```tsx
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getApiClientFromCookies } from "@/lib/api"
import type { expenses } from "@/lib/api/client"
import { ExpensesView } from "./expenses-view"

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    search?: string
    category?: string
    startDate?: string
    endDate?: string
  }>
}) {
  const { page, search, category, startDate, endDate } = await searchParams

  const api = getApiClientFromCookies((await cookies()).toString())

  try {
    await api.mafaaza_api.profile()
  } catch {
    redirect("/login")
  }

  const parsedPage = page ? parseInt(page, 10) : 1
  const pageNum = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const limit = 20

  const categoryFilter = category && category !== "all"
    ? (category as expenses.ExpenseCategory)
    : undefined

  let result: Awaited<ReturnType<typeof api.expenses.listExpenses>>
  try {
    result = await api.expenses.listExpenses({
      page: pageNum,
      limit,
      search: search || undefined,
      category: categoryFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })
  } catch (err) {
    console.error("[ExpensesPage] listExpenses failed:", err)
    result = { expenses: [], total: 0, page: pageNum, limit, totalPages: 1 }
  }

  // Fetch summary for current month stats
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0]
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0]

  let monthExpenses: expenses.Expense[] = []
  try {
    const monthRes = await api.expenses.listExpenses({
      startDate: firstDayOfMonth,
      endDate: lastDayOfMonth,
      limit: 100,
    })
    monthExpenses = monthRes.expenses
  } catch (err) {
    console.error("[ExpensesPage] month listExpenses failed:", err)
  }

  const summary = {
    totalMonth: monthExpenses.reduce((sum, item) => sum + item.amount, 0),
    operationalMonth: monthExpenses
      .filter((item) => item.category === "operational")
      .reduce((sum, item) => sum + item.amount, 0),
    salaryMonth: monthExpenses
      .filter((item) => item.category === "salary")
      .reduce((sum, item) => sum + item.amount, 0),
    otherMonth: monthExpenses
      .filter((item) => item.category !== "operational" && item.category !== "salary")
      .reduce((sum, item) => sum + item.amount, 0),
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="rounded-2xl border border-white/10 bg-brand-deep px-6 py-7 text-white sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            Manajemen Pengeluaran
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Catat dan kontrol pengeluaran toko Anda.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/85">
            Kelola data pengeluaran operasional, gaji, pembelian, dan utilitas secara rapi dan transparan.
          </p>
        </div>
      </section>

      <ExpensesView
        expenses={result.expenses}
        total={result.total}
        page={result.page}
        limit={result.limit}
        summary={summary}
      />
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/\(dashboard\)/expenses/page.test.tsx`
Expected: PASS

- [ ] **Step 5: Run full test suite & build check**

Run: `npm test && npm run build`
Expected: All tests pass and Next.js build succeeds with zero errors.

- [ ] **Step 6: Commit Task 5**

```bash
git add app/\(dashboard\)/expenses/page.tsx app/\(dashboard\)/expenses/page.test.tsx
git commit -m "feat(expenses): add ExpensesPage route component and page test"
```
