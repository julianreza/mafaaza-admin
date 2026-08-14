import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { getApiClientFromCookies } from "@/lib/api"
import { ProductsView } from "./products-view"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const { page, search } = await searchParams

  const api = getApiClientFromCookies((await cookies()).toString())

  try {
    await api.mafaaza_api.profile()
  } catch {
    redirect("/login")
  }

  const parsedPage = page ? parseInt(page, 10) : 1
  const pageNum = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const limit = 20

  // Guard the fetch: the session is already validated above, but the backend
  // call can still fail (network/500). Degrade to an empty list rather than
  // throwing an unhandled error that blanks the whole route.
  let result: Awaited<ReturnType<typeof api.masters.listProducts>>
  try {
    result = await api.masters.listProducts({
      page: pageNum,
      limit,
      search: search || undefined,
    })
  } catch (err) {
    console.error("[ProductsPage] listProducts failed:", err)
    result = { products: [], total: 0, page: pageNum, limit }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="rounded-2xl border border-white/10 bg-brand-deep px-6 py-7 text-white sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">Manajemen Produk</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Kelola produk toko Anda.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/85">
            Tambah, edit, atau nonaktifkan produk tanpa menghapus data.
          </p>
        </div>
      </section>

      <ProductsView products={result.products} total={result.total} page={result.page} limit={result.limit} search={search || ""} />
    </div>
  )
}
