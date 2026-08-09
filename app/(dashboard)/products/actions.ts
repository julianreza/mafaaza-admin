"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { getApiClientFromCookies, type Client } from "@/lib/api"

type ActionResult = { ok: true } | { ok: false; error: string }

// Generic, client-safe messages. Raw backend/Encore errors are logged
// server-side only — never returned to the browser (they can leak internal
// details, stack context, or endpoint shape).
const GENERIC_ERROR = "Terjadi kesalahan. Silakan coba lagi."
const SESSION_ERROR = "Sesi Anda telah berakhir. Silakan masuk kembali."

/**
 * Resolve an API client whose session has been verified against the backend's
 * protected `/profile` endpoint.
 *
 * Each server action calls this itself and does NOT lean on the `(dashboard)`
 * layout guard: a Server Action is a POST endpoint that can be invoked directly
 * without ever rendering the guarded layout, so authorization must be checked
 * here too (defense in depth). Returns a generic session error on failure — the
 * underlying reason is never surfaced to the client.
 */
async function getAuthedApi(): Promise<{ api: Client } | { error: string }> {
  const api = getApiClientFromCookies((await cookies()).toString())
  try {
    await api.mafaaza_api.profile()
    return { api }
  } catch {
    return { error: SESSION_ERROR }
  }
}

export async function createProductAction(
  prevState: { ok: boolean; error?: string },
  formData: FormData
): Promise<ActionResult> {
  const auth = await getAuthedApi()
  if ("error" in auth) return { ok: false, error: auth.error }

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
    await auth.api.masters.createProduct({
      name,
      sku: sku || undefined,
      price,
      unit: unit || "pcs",
      description: description || undefined,
    })

    revalidatePath("/products")
    return { ok: true }
  } catch (err) {
    console.error("[createProductAction] failed:", err)
    return { ok: false, error: GENERIC_ERROR }
  }
}

export async function updateProductAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const auth = await getAuthedApi()
  if ("error" in auth) return { ok: false, error: auth.error }

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
    const params: Record<string, unknown> = {}

    if (categoryId !== undefined) params.categoryId = categoryId || null
    if (name !== undefined) params.name = name
    if (sku !== undefined) params.sku = sku || null
    if (price !== undefined) params.price = price
    if (unit !== undefined) params.unit = unit
    if (description !== undefined) params.description = description || null
    if (isActive !== undefined) params.isActive = isActive === "on"

    await auth.api.masters.updateProduct(id, params)

    revalidatePath("/products")
    return { ok: true }
  } catch (err) {
    console.error("[updateProductAction] failed:", err)
    return { ok: false, error: GENERIC_ERROR }
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const auth = await getAuthedApi()
  if ("error" in auth) return { ok: false, error: auth.error }

  try {
    await auth.api.masters.deleteProduct(id, { force: false })

    revalidatePath("/products")
    return { ok: true }
  } catch (err) {
    console.error("[deleteProductAction] failed:", err)
    return { ok: false, error: GENERIC_ERROR }
  }
}
