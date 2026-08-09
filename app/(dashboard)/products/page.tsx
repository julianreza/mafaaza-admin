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

  const pageNum = page ? parseInt(page, 10) : 1
  const limit = 20

  const result = await api.masters.listProducts({
    page: pageNum,
    limit,
    search: search || undefined,
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 px-6 py-7 text-white shadow-xl shadow-brand/20 animate-gradient-orbit sm:px-8">
        <div aria-hidden="true" className="absolute -right-16 -top-20 size-56 rounded-full bg-white/15 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-24 left-1/3 size-64 rounded-full bg-indigo-200/20 blur-3xl" />
        <div className="relative max-w-2xl">
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
