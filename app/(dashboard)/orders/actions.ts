"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { getApiClientFromCookies, type Client } from "@/lib/api"
import type { transactions } from "@/lib/api/client"

type ActionResult = { ok: true } | { ok: false; error: string }

// Generic, client-safe messages. Raw backend/Encore errors are logged
// server-side only — never returned to the browser (they can leak internal
// details, stack context, or endpoint shape).
const GENERIC_ERROR = "Terjadi kesalahan. Silakan coba lagi."
const SESSION_ERROR = "Sesi Anda telah berakhir. Silakan masuk kembali."
const AUTHZ_ERROR = "Anda tidak memiliki izin untuk melakukan tindakan ini."

// Roles allowed to create/update/delete orders. The backend defaults every
// account to "user" and only elevates to "admin" via the Better Auth admin
// plugin (see mafaaza-api services/auth/schema.ts), so mutations are admin-only.
const ALLOWED_MUTATE_ROLES: readonly string[] = ["admin"]

// Valid order statuses, mirrored from the backend `transactions.OrderStatus` union.
const ORDER_STATUSES: readonly transactions.OrderStatus[] = [
  "draft",
  "confirmed",
  "paid",
  "cancelled",
]

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
 * permitted to mutate orders. Use this in every create/update/delete action.
 */
async function getMutatingApi(): Promise<{ api: Client } | { error: string }> {
  const auth = await getAuthedApi()
  if ("error" in auth) return auth
  if (!ALLOWED_MUTATE_ROLES.includes(auth.role)) {
    return { error: AUTHZ_ERROR }
  }
  return { api: auth.api }
}

/**
 * Create an order from a multi-line-item cart.
 *
 * The client serializes the cart to a JSON string under the `items` FormData
 * field; we parse and validate it here (never trusting the shape). There is no
 * customers endpoint, so orders are always walk-in — `customerId` is omitted.
 */
export async function createOrderAction(
  prevState: { ok: boolean; error?: string },
  formData: FormData
): Promise<ActionResult> {
  const auth = await getMutatingApi()
  if ("error" in auth) return { ok: false, error: auth.error }

  const itemsRaw = formData.get("items") as string | null
  const discountStr = formData.get("discountAmount") as string | undefined
  const notes = formData.get("notes") as string | undefined

  // Parse + validate line items.
  let parsed: unknown
  try {
    parsed = JSON.parse(itemsRaw || "[]")
  } catch {
    return { ok: false, error: "Data item tidak valid." }
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { ok: false, error: "Pesanan harus memiliki minimal satu item." }
  }

  const items: transactions.CreateOrderItemInput[] = []
  for (const raw of parsed) {
    if (typeof raw !== "object" || raw === null) {
      return { ok: false, error: "Data item tidak valid." }
    }
    const item = raw as Record<string, unknown>
    const productId = typeof item.productId === "string" ? item.productId : ""
    const quantity = Number(item.quantity)
    if (!productId) {
      return { ok: false, error: "Setiap item harus memiliki produk." }
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { ok: false, error: "Jumlah item harus lebih dari 0." }
    }
    const mapped: transactions.CreateOrderItemInput = { productId, quantity }
    if (item.unitPrice !== undefined && item.unitPrice !== null && item.unitPrice !== "") {
      const unitPrice = Number(item.unitPrice)
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return { ok: false, error: "Harga satuan harus berupa angka >= 0." }
      }
      mapped.unitPrice = unitPrice
    }
    items.push(mapped)
  }

  let discountAmount: number | undefined
  if (discountStr) {
    const parsedDiscount = parseFloat(discountStr)
    if (isNaN(parsedDiscount) || parsedDiscount < 0) {
      return { ok: false, error: "Diskon harus berupa angka >= 0." }
    }
    discountAmount = parsedDiscount
  }

  try {
    await auth.api.transactions.createOrder({
      items,
      discountAmount,
      notes: notes || undefined,
    })

    revalidatePath("/orders")
    return { ok: true }
  } catch (err) {
    console.error("[createOrderAction] failed:", err)
    return { ok: false, error: GENERIC_ERROR }
  }
}

/**
 * "Edit" an order. The backend only allows status transitions (there is no full
 * order edit), so this maps to `updateOrderStatus`. `paidAmount` is required by
 * the backend when transitioning to `paid`.
 */
export async function updateOrderStatusAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const auth = await getMutatingApi()
  if ("error" in auth) return { ok: false, error: auth.error }

  const status = formData.get("status") as string | null
  const paidAmountStr = formData.get("paidAmount") as string | undefined

  if (!status || !ORDER_STATUSES.includes(status as transactions.OrderStatus)) {
    return { ok: false, error: "Status pesanan tidak valid." }
  }

  // `FormData.get` yields `null` (not `undefined`) for an absent field, so a
  // truthy guard is required — treating `null` as present would wrongly reject
  // every status change that omits paidAmount. An explicit "0" is still handled.
  let paidAmount: number | undefined
  if (paidAmountStr) {
    const parsedPaid = parseFloat(paidAmountStr)
    if (isNaN(parsedPaid) || parsedPaid < 0) {
      return { ok: false, error: "Jumlah dibayar harus berupa angka >= 0." }
    }
    paidAmount = parsedPaid
  }

  if (status === "paid" && paidAmount === undefined) {
    return { ok: false, error: "Jumlah dibayar wajib diisi saat menandai lunas." }
  }

  try {
    await auth.api.transactions.updateOrderStatus(id, {
      status: status as transactions.OrderStatus,
      paidAmount,
    })

    revalidatePath("/orders")
    return { ok: true }
  } catch (err) {
    console.error("[updateOrderStatusAction] failed:", err)
    return { ok: false, error: GENERIC_ERROR }
  }
}

/**
 * Hard-delete an order. Unlike products (soft delete via `force:false`), the
 * backend `deleteOrder` endpoint performs a hard delete and takes no force flag.
 */
export async function deleteOrderAction(id: string): Promise<ActionResult> {
  const auth = await getMutatingApi()
  if ("error" in auth) return { ok: false, error: auth.error }

  try {
    await auth.api.transactions.deleteOrder(id)

    revalidatePath("/orders")
    return { ok: true }
  } catch (err) {
    console.error("[deleteOrderAction] failed:", err)
    return { ok: false, error: GENERIC_ERROR }
  }
}
