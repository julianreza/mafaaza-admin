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

// Roles allowed to create/update/delete categories. The backend defaults every
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
 * permitted to mutate categories. Use this in every create/update/delete action.
 */
async function getMutatingApi(): Promise<{ api: Client } | { error: string }> {
  const auth = await getAuthedApi()
  if ("error" in auth) return auth
  if (!ALLOWED_MUTATE_ROLES.includes(auth.role)) {
    return { error: AUTHZ_ERROR }
  }
  return { api: auth.api }
}

export async function createCategoryAction(
  prevState: { ok: boolean; error?: string },
  formData: FormData
): Promise<ActionResult> {
  const auth = await getMutatingApi()
  if ("error" in auth) return { ok: false, error: auth.error }

  const name = formData.get("name") as string
  const description = formData.get("description") as string | undefined

  // Validation
  if (!name || name.trim() === "") {
    return { ok: false, error: "Nama kategori wajib diisi." }
  }

  try {
    await auth.api.masters.createCategory({
      name: name.trim(),
      description: description?.trim() || undefined,
    })

    revalidatePath("/categories")
    return { ok: true }
  } catch (err) {
    console.error("[createCategoryAction] failed:", err)
    return { ok: false, error: GENERIC_ERROR }
  }
}

export async function updateCategoryAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const auth = await getMutatingApi()
  if ("error" in auth) return { ok: false, error: auth.error }

  const name = formData.get("name") as string | null
  const description = formData.get("description") as string | null
  const isActive = formData.get("isActive") as string | null

  // Validation
  if (name !== null && name.trim() === "") {
    return { ok: false, error: "Nama kategori tidak boleh kosong." }
  }

  try {
    const params: {
      name?: string
      description?: string | null
      isActive?: boolean
    } = {}

    if (name !== null && name !== undefined) params.name = name.trim()
    if (description !== null && description !== undefined) {
      params.description = description.trim() || null
    }
    if (isActive !== null && isActive !== undefined) {
      params.isActive = isActive === "on"
    } else if (formData.has("isActive")) {
      params.isActive = false
    } else {
      // In case isActive checkbox is absent from form submission during edit
      params.isActive = false
    }

    await auth.api.masters.updateCategory(id, params)

    revalidatePath("/categories")
    return { ok: true }
  } catch (err) {
    console.error("[updateCategoryAction] failed:", err)
    return { ok: false, error: GENERIC_ERROR }
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const auth = await getMutatingApi()
  if ("error" in auth) return { ok: false, error: auth.error }

  try {
    await auth.api.masters.deleteCategory(id, { force: false })

    revalidatePath("/categories")
    return { ok: true }
  } catch (err) {
    console.error("[deleteCategoryAction] failed:", err)
    return { ok: false, error: GENERIC_ERROR }
  }
}
