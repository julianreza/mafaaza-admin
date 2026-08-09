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
const AUTHZ_ERROR = "Anda tidak memiliki izin untuk melakukan tindakan ini."

// Roles allowed to create/update/delete products. The backend defaults every
// account to "user" and only elevates to "admin" via the Better Auth admin
// plugin (see mafaaza-api services/auth/schema.ts), so mutations are admin-only.
const ALLOWED_MUTATE_ROLES: readonly string[] = ["admin"]

/**
 * Resolve an API client whose session has been verified against the backend's
 * protected `/profile` endpoint. Also returns the caller's role so callers can
 * make authorization decisions.
 *
 * Each server action calls this itself and does NOT lean on the `(dashboard)`
 * layout guard: a Server Action is a POST endpoint that can be invoked directly
 * without ever rendering the guarded layout, so authorization must be checked
 * here too (defense in depth). Returns a generic session error on failure — the
 * underlying reason is never surfaced to the client.
 */
async function getAuthedApi(): Promise<
  { api: Client; role: string } | { error: string }
> {
  const api = getApiClientFromCookies((await cookies()).toString())
  try {
    const profile = await api.mafaaza_api.profile()
    return { api, role: profile.role }
  } catch {
    return { error: SESSION_ERROR }
  }
}

/**
 * Like `getAuthedApi`, but additionally enforces that the caller holds a role
 * permitted to mutate products. Use this in every create/update/delete action.
 */
async function getMutatingApi(): Promise<{ api: Client } | { error: string }> {
  const auth = await getAuthedApi()
  if ("error" in auth) return auth
  if (!ALLOWED_MUTATE_ROLES.includes(auth.role)) {
    return { error: AUTHZ_ERROR }
  }
  return { api: auth.api }
}

export async function createProductAction(
  prevState: { ok: boolean; error?: string },
  formData: FormData
): Promise<ActionResult> {
  const auth = await getMutatingApi()
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
  const auth = await getMutatingApi()
  if ("error" in auth) return { ok: false, error: auth.error }

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

    // `FormData.get` returns `null` (not `undefined`) for an absent field, so a
    // `!== undefined` guard would always pass and send `categoryId: null`,
    // silently wiping the product's category on every edit. The edit form does
    // not include a category picker, so gate on `has()` — only touch categoryId
    // when the field is actually part of the submission. An explicitly-sent but
    // empty value is treated as an intentional clear.
    if (formData.has("categoryId")) {
      const categoryId = formData.get("categoryId") as string
      params.categoryId = categoryId || null
    }
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
  const auth = await getMutatingApi()
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
