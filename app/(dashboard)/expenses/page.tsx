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
