"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { getApiClientFromCookies } from "@/lib/api"

export async function createProductAction(
  prevState: { ok: boolean; error?: string },
  formData: FormData
) {
  const name = formData.get("name") as string
  const sku = formData.get("sku") as string | undefined
  const priceStr = formData.get("price") as string | undefined
  const unit = formData.get("unit") as string | undefined
  const description = formData.get("description") as string | undefined

  // Validation
  if (!name || name.trim() === "") {
    return { ok: false, error: "Nama produk wajib diisi." }
  }

  const price = parseFloat(priceStr || "0")
  if (isNaN(price) || price < 0) {
    return { ok: false, error: "Harga harus berupa angka >= 0." }
  }

  try {
    const api = getApiClientFromCookies((await cookies()).toString())
    await api.masters.createProduct({
      name,
      sku: sku || undefined,
      price,
      unit: unit || "pcs",
      description: description || undefined,
    })

    revalidatePath("/products")
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal membuat produk."
    return { ok: false, error: message }
  }
}

export async function updateProductAction(
  id: string,
  formData: FormData
) {
  const categoryId = formData.get("categoryId") as string | undefined
  const name = formData.get("name") as string | undefined
  const sku = formData.get("sku") as string | undefined
  const priceStr = formData.get("price") as string | undefined
  const unit = formData.get("unit") as string | undefined
  const description = formData.get("description") as string | undefined
  const isActive = formData.get("isActive") as string | undefined

  // Validation
  if (!name || name.trim() === "") {
    return { ok: false, error: "Nama produk wajib diisi." }
  }

  const price = priceStr ? parseFloat(priceStr) : undefined
  if (price !== undefined && (isNaN(price) || price < 0)) {
    return { ok: false, error: "Harga harus berupa angka >= 0." }
  }

  try {
    const api = getApiClientFromCookies((await cookies()).toString())
    const params: Record<string, unknown> = {}

    if (categoryId !== undefined) params.categoryId = categoryId || null
    if (name !== undefined) params.name = name
    if (sku !== undefined) params.sku = sku || null
    if (price !== undefined) params.price = price
    if (unit !== undefined) params.unit = unit
    if (description !== undefined) params.description = description || null
    if (isActive !== undefined) params.isActive = isActive === "on"

    await api.masters.updateProduct(id, params)

    revalidatePath("/products")
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui produk."
    return { ok: false, error: message }
  }
}

export async function deleteProductAction(id: string) {
  try {
    const api = getApiClientFromCookies((await cookies()).toString())
    await api.masters.deleteProduct(id, { force: false })

    revalidatePath("/products")
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menghapus produk."
    return { ok: false, error: message }
  }
}
