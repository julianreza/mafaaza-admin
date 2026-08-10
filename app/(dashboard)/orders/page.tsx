import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { getApiClientFromCookies } from "@/lib/api"
import type { masters, transactions } from "@/lib/api/client"
import { OrdersView } from "./orders-view"

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
  const { page, search, status } = await searchParams

  const api = getApiClientFromCookies((await cookies()).toString())

  try {
    await api.mafaaza_api.profile()
  } catch {
    redirect("/login")
  }

  const parsedPage = page ? parseInt(page, 10) : 1
  const pageNum = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const limit = 20

  // Only forward a valid status filter to the backend; anything else is ignored.
  const validStatuses: readonly transactions.OrderStatus[] = [
    "draft",
    "confirmed",
    "paid",
    "cancelled",
  ]
  const statusFilter =
    status && validStatuses.includes(status as transactions.OrderStatus)
      ? (status as transactions.OrderStatus)
      : undefined

  // Guard the fetch: the session is already validated above, but the backend
  // call can still fail (network/500). Degrade to an empty list rather than
  // throwing an unhandled error that blanks the whole route.
  let result: Awaited<ReturnType<typeof api.transactions.listOrders>>
  try {
    result = await api.transactions.listOrders({
      page: pageNum,
      limit,
      invoiceSearch: search || undefined,
      status: statusFilter,
    })
  } catch (err) {
    console.error("[OrdersPage] listOrders failed:", err)
    result = { orders: [], total: 0, page: pageNum, limit }
  }

  // Product picker source for the create form — active products only.
  let products: masters.ProductWithCategory[] = []
  try {
    const productsResult = await api.masters.listProducts({
      page: 1,
      limit: 100,
      isActive: true,
    })
    products = productsResult.products
  } catch (err) {
    console.error("[OrdersPage] listProducts failed:", err)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 px-6 py-7 text-white shadow-xl shadow-brand/20 animate-gradient-orbit sm:px-8">
        <div aria-hidden="true" className="absolute -right-16 -top-20 size-56 rounded-full bg-white/15 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-24 left-1/3 size-64 rounded-full bg-indigo-200/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">Manajemen Transaksi</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Kelola pesanan toko Anda.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/85">
            Buat pesanan baru, perbarui status pembayaran, dan pantau transaksi.
          </p>
        </div>
      </section>

      <OrdersView
        orders={result.orders}
        total={result.total}
        page={result.page}
        limit={result.limit}
        search={search || ""}
        status={statusFilter ?? ""}
        products={products}
      />
    </div>
  )
}
