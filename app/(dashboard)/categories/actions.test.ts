import { describe, it, expect, vi, beforeEach } from "vitest"

// --- Mocks (vi.hoisted so the fns exist before vi.mock factories run) --------
const { profile, createCategory, updateCategory, deleteCategory, revalidatePath } =
  vi.hoisted(() => ({
    profile: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
    revalidatePath: vi.fn(),
  }))

vi.mock("@/lib/api", () => ({
  getApiClientFromCookies: () => ({
    mafaaza_api: { profile },
    masters: { createCategory, updateCategory, deleteCategory },
  }),
}))

vi.mock("next/headers", () => ({
  cookies: async () => ({ toString: () => "better-auth.session_token=abc" }),
}))

vi.mock("next/cache", () => ({ revalidatePath }))

import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/app/(dashboard)/categories/actions"

const SESSION_ERROR = "Sesi Anda telah berakhir. Silakan masuk kembali."
const GENERIC_ERROR = "Terjadi kesalahan. Silakan coba lagi."
const AUTHZ_ERROR = "Anda tidak memiliki izin untuk melakukan tindakan ini."

function fd(entries: Record<string, string>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(entries)) f.append(k, v)
  return f
}

beforeEach(() => {
  vi.clearAllMocks()
  profile.mockResolvedValue({ email: "admin@mafaaza.test", role: "admin" })
})

describe("createCategoryAction", () => {
  it("rejects unauthenticated callers with a generic session error and never calls the API", async () => {
    profile.mockRejectedValueOnce(new Error("401 unauthorized"))
    const res = await createCategoryAction({ ok: false }, fd({ name: "Minuman" }))
    expect(res).toEqual({ ok: false, error: SESSION_ERROR })
    expect(createCategory).not.toHaveBeenCalled()
  })

  it("rejects a non-admin role with an authz error and never calls the API", async () => {
    profile.mockResolvedValueOnce({ email: "staff@mafaaza.test", role: "user" })
    const res = await createCategoryAction({ ok: false }, fd({ name: "Minuman" }))
    expect(res).toEqual({ ok: false, error: AUTHZ_ERROR })
    expect(createCategory).not.toHaveBeenCalled()
  })

  it("requires a non-empty name", async () => {
    const res = await createCategoryAction({ ok: false }, fd({ name: "  " }))
    expect(res).toEqual({ ok: false, error: "Nama kategori wajib diisi." })
    expect(createCategory).not.toHaveBeenCalled()
  })

  it("creates a category with trimmed name & description and revalidates the list", async () => {
    createCategory.mockResolvedValueOnce({ category: { id: "c1", name: "Makanan" } })
    const res = await createCategoryAction(
      { ok: false },
      fd({ name: "  Makanan  ", description: " Aneka makanan " }),
    )
    expect(res).toEqual({ ok: true })
    expect(createCategory).toHaveBeenCalledWith({
      name: "Makanan",
      description: "Aneka makanan",
    })
    expect(revalidatePath).toHaveBeenCalledWith("/categories")
  })

  it("handles empty description as undefined", async () => {
    createCategory.mockResolvedValueOnce({ category: { id: "c2", name: "Minuman" } })
    await createCategoryAction({ ok: false }, fd({ name: "Minuman" }))
    expect(createCategory).toHaveBeenCalledWith({
      name: "Minuman",
      description: undefined,
    })
  })

  it("maps a backend error to a generic message without leaking details", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    createCategory.mockRejectedValueOnce(new Error("Internal db error"))
    const res = await createCategoryAction({ ok: false }, fd({ name: "Minuman" }))
    expect(res).toEqual({ ok: false, error: GENERIC_ERROR })
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})

describe("updateCategoryAction", () => {
  it("rejects unauthenticated callers", async () => {
    profile.mockRejectedValueOnce(new Error("401"))
    const res = await updateCategoryAction("c1", fd({ name: "Minuman" }))
    expect(res).toEqual({ ok: false, error: SESSION_ERROR })
    expect(updateCategory).not.toHaveBeenCalled()
  })

  it("rejects a non-admin role and never calls the API", async () => {
    profile.mockResolvedValueOnce({ email: "staff@mafaaza.test", role: "user" })
    const res = await updateCategoryAction("c1", fd({ name: "Minuman" }))
    expect(res).toEqual({ ok: false, error: AUTHZ_ERROR })
    expect(updateCategory).not.toHaveBeenCalled()
  })

  it("rejects empty name if provided", async () => {
    const res = await updateCategoryAction("c1", fd({ name: "  " }))
    expect(res).toEqual({ ok: false, error: "Nama kategori tidak boleh kosong." })
    expect(updateCategory).not.toHaveBeenCalled()
  })

  it("updates mapped fields, maps isActive checkbox, and revalidates", async () => {
    updateCategory.mockResolvedValueOnce({ category: { id: "c1" } })
    const res = await updateCategoryAction(
      "c1",
      fd({ name: "Makanan Ringan", description: "Camilan", isActive: "on" }),
    )
    expect(res).toEqual({ ok: true })
    expect(updateCategory).toHaveBeenCalledWith(
      "c1",
      expect.objectContaining({
        name: "Makanan Ringan",
        description: "Camilan",
        isActive: true,
      }),
    )
    expect(revalidatePath).toHaveBeenCalledWith("/categories")
  })

  it("treats missing isActive as false", async () => {
    updateCategory.mockResolvedValueOnce({ category: { id: "c1" } })
    await updateCategoryAction("c1", fd({ name: "Minuman" }))
    const [, params] = updateCategory.mock.calls[0]
    expect(params.isActive).toBe(false)
  })

  it("maps a backend error to a generic message", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    updateCategory.mockRejectedValueOnce(new Error("Encore: not found"))
    const res = await updateCategoryAction("c1", fd({ name: "Minuman" }))
    expect(res).toEqual({ ok: false, error: GENERIC_ERROR })
    spy.mockRestore()
  })
})

describe("deleteCategoryAction (soft delete)", () => {
  it("rejects unauthenticated callers and never calls the API", async () => {
    profile.mockRejectedValueOnce(new Error("401"))
    const res = await deleteCategoryAction("c1")
    expect(res).toEqual({ ok: false, error: SESSION_ERROR })
    expect(deleteCategory).not.toHaveBeenCalled()
  })

  it("rejects a non-admin role and never calls the API", async () => {
    profile.mockResolvedValueOnce({ email: "staff@mafaaza.test", role: "user" })
    const res = await deleteCategoryAction("c1")
    expect(res).toEqual({ ok: false, error: AUTHZ_ERROR })
    expect(deleteCategory).not.toHaveBeenCalled()
  })

  it("soft-deletes (force:false) and revalidates the list", async () => {
    deleteCategory.mockResolvedValueOnce(undefined)
    const res = await deleteCategoryAction("c1")
    expect(res).toEqual({ ok: true })
    expect(deleteCategory).toHaveBeenCalledWith("c1", { force: false })
    expect(revalidatePath).toHaveBeenCalledWith("/categories")
  })

  it("maps a backend error to a generic message", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    deleteCategory.mockRejectedValueOnce(new Error("Encore: fk error"))
    const res = await deleteCategoryAction("c1")
    expect(res).toEqual({ ok: false, error: GENERIC_ERROR })
    spy.mockRestore()
  })
})
