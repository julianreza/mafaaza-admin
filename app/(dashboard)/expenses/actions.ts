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
