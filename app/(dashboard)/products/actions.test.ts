import { describe, it, expect, vi, beforeEach } from "vitest"

// --- Mocks (vi.hoisted so the fns exist before vi.mock factories run) --------
const { profile, createProduct, updateProduct, deleteProduct, revalidatePath } =
  vi.hoisted(() => ({
    profile: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    revalidatePath: vi.fn(),
  }))

vi.mock("@/lib/api", () => ({
  getApiClientFromCookies: () => ({
    mafaaza_api: { profile },
    masters: { createProduct, updateProduct, deleteProduct },
  }),
}))

vi.mock("next/headers", () => ({
  cookies: async () => ({ toString: () => "better-auth.session_token=abc" }),
}))

vi.mock("next/cache", () => ({ revalidatePath }))

import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/app/(dashboard)/products/actions"

const SESSION_ERROR = "Sesi Anda telah berakhir. Silakan masuk kembali."
const GENERIC_ERROR = "Terjadi kesalahan. Silakan coba lagi."

function fd(entries: Record<string, string>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(entries)) f.append(k, v)
  return f
}

beforeEach(() => {
  vi.clearAllMocks()
  // Authenticated by default; individual tests override.
  profile.mockResolvedValue({ email: "admin@mafaaza.test", role: "admin" })
})

describe("createProductAction", () => {
  it("rejects unauthenticated callers with a generic session error and never calls the API", async () => {
    profile.mockRejectedValueOnce(new Error("401 unauthorized"))
    const res = await createProductAction({ ok: false }, fd({ name: "Kopi", price: "1000" }))
    expect(res).toEqual({ ok: false, error: SESSION_ERROR })
    expect(createProduct).not.toHaveBeenCalled()
  })

  it("requires a non-empty name", async () => {
    const res = await createProductAction({ ok: false }, fd({ name: "  ", price: "1000" }))
    expect(res).toEqual({ ok: false, error: "Nama produk wajib diisi." })
    expect(createProduct).not.toHaveBeenCalled()
  })

  it("rejects a negative price", async () => {
    const res = await createProductAction({ ok: false }, fd({ name: "Kopi", price: "-5" }))
    expect(res).toEqual({ ok: false, error: "Harga harus berupa angka >= 0." })
    expect(createProduct).not.toHaveBeenCalled()
  })

  it("creates a product with mapped params and revalidates the list", async () => {
    createProduct.mockResolvedValueOnce({ product: { id: "p1" } })
    const res = await createProductAction(
      { ok: false },
      fd({ name: "Kopi Susu", sku: "KS-1", price: "15000", unit: "cup", description: "enak" }),
    )
    expect(res).toEqual({ ok: true })
    expect(createProduct).toHaveBeenCalledWith({
      name: "Kopi Susu",
      sku: "KS-1",
      price: 15000,
      unit: "cup",
      description: "enak",
    })
    expect(revalidatePath).toHaveBeenCalledWith("/products")
  })

  it("defaults unit to pcs and omits blank optional fields", async () => {
    createProduct.mockResolvedValueOnce({ product: { id: "p2" } })
    await createProductAction({ ok: false }, fd({ name: "Teh", price: "0" }))
    expect(createProduct).toHaveBeenCalledWith({
      name: "Teh",
      sku: undefined,
      price: 0,
      unit: "pcs",
      description: undefined,
    })
  })

  it("maps a backend error to a generic message (no raw leak) and logs server-side", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    createProduct.mockRejectedValueOnce(new Error("Encore: duplicate key in products.sku table"))
    const res = await createProductAction({ ok: false }, fd({ name: "Kopi", price: "1000" }))
    expect(res).toEqual({ ok: false, error: GENERIC_ERROR })
    if (!res.ok) expect(res.error).not.toContain("Encore")
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})

describe("updateProductAction", () => {
  it("rejects unauthenticated callers", async () => {
    profile.mockRejectedValueOnce(new Error("401"))
    const res = await updateProductAction("p1", fd({ name: "Kopi", price: "1000" }))
    expect(res).toEqual({ ok: false, error: SESSION_ERROR })
    expect(updateProduct).not.toHaveBeenCalled()
  })

  it("updates mapped fields, maps isActive checkbox, and revalidates", async () => {
    updateProduct.mockResolvedValueOnce({ product: { id: "p1" } })
    const res = await updateProductAction(
      "p1",
      fd({ name: "Kopi Baru", sku: "KS-9", price: "20000", unit: "cup", description: "x", isActive: "on" }),
    )
    expect(res).toEqual({ ok: true })
    // objectContaining so the assertion targets intended fields without
    // over-constraining incidental keys.
    expect(updateProduct).toHaveBeenCalledWith(
      "p1",
      expect.objectContaining({
        name: "Kopi Baru",
        sku: "KS-9",
        price: 20000,
        unit: "cup",
        description: "x",
        isActive: true,
      }),
    )
    expect(revalidatePath).toHaveBeenCalledWith("/products")
  })

  it("treats a missing isActive as false", async () => {
    updateProduct.mockResolvedValueOnce({ product: { id: "p1" } })
    await updateProductAction("p1", fd({ name: "Kopi", price: "1000" }))
    const [, params] = updateProduct.mock.calls[0]
    expect(params.isActive).toBe(false)
  })

  it("maps a backend error to a generic message", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    updateProduct.mockRejectedValueOnce(new Error("Encore: not found"))
    const res = await updateProductAction("p1", fd({ name: "Kopi", price: "1000" }))
    expect(res).toEqual({ ok: false, error: GENERIC_ERROR })
    spy.mockRestore()
  })
})

describe("deleteProductAction (soft delete)", () => {
  it("rejects unauthenticated callers and never calls the API", async () => {
    profile.mockRejectedValueOnce(new Error("401"))
    const res = await deleteProductAction("p1")
    expect(res).toEqual({ ok: false, error: SESSION_ERROR })
    expect(deleteProduct).not.toHaveBeenCalled()
  })

  it("soft-deletes (force:false) and revalidates the list", async () => {
    deleteProduct.mockResolvedValueOnce(undefined)
    const res = await deleteProductAction("p1")
    expect(res).toEqual({ ok: true })
    expect(deleteProduct).toHaveBeenCalledWith("p1", { force: false })
    expect(revalidatePath).toHaveBeenCalledWith("/products")
  })

  it("maps a backend error to a generic message", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    deleteProduct.mockRejectedValueOnce(new Error("Encore: fk constraint on order_items"))
    const res = await deleteProductAction("p1")
    expect(res).toEqual({ ok: false, error: GENERIC_ERROR })
    if (!res.ok) expect(res.error).not.toContain("constraint")
    spy.mockRestore()
  })
})
