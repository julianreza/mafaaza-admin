import { describe, it, expect, vi, beforeEach } from "vitest"

// --- Mocks (vi.hoisted so the fns exist before vi.mock factories run) --------
const { profile, createOrder, updateOrderStatus, deleteOrder, revalidatePath } =
  vi.hoisted(() => ({
    profile: vi.fn(),
    createOrder: vi.fn(),
    updateOrderStatus: vi.fn(),
    deleteOrder: vi.fn(),
    revalidatePath: vi.fn(),
  }))

vi.mock("@/lib/api", () => ({
  getApiClientFromCookies: () => ({
    mafaaza_api: { profile },
    masters: { createOrder, updateOrderStatus, deleteOrder },
  }),
}))

vi.mock("next/headers", () => ({
  cookies: async () => ({ toString: () => "better-auth.session_token=abc" }),
}))

vi.mock("next/cache", () => ({ revalidatePath }))

import {
  createOrderAction,
  updateOrderStatusAction,
  deleteOrderAction,
} from "@/app/(dashboard)/orders/actions"

const SESSION_ERROR = "Sesi Anda telah berakhir. Silakan masuk kembali."
const GENERIC_ERROR = "Terjadi kesalahan. Silakan coba lagi."
const AUTHZ_ERROR = "Anda tidak memiliki izin untuk melakukan tindakan ini."

function fd(entries: Record<string, string>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(entries)) f.append(k, v)
  return f
}

function itemsFd(items: unknown, extra: Record<string, string> = {}) {
  return fd({ items: JSON.stringify(items), ...extra })
}

beforeEach(() => {
  vi.clearAllMocks()
  // Authenticated admin by default; individual tests override.
  profile.mockResolvedValue({ email: "admin@mafaaza.test", role: "admin" })
})

describe("createOrderAction", () => {
  const okItems = [{ productId: "p1", quantity: 2 }]

  it("rejects unauthenticated callers with a session error and never calls the API", async () => {
    profile.mockRejectedValueOnce(new Error("401 unauthorized"))
    const res = await createOrderAction({ ok: false }, itemsFd(okItems))
    expect(res).toEqual({ ok: false, error: SESSION_ERROR })
    expect(createOrder).not.toHaveBeenCalled()
  })

  it("rejects a non-admin role with an authz error and never calls the API", async () => {
    profile.mockResolvedValueOnce({ email: "staff@mafaaza.test", role: "user" })
    const res = await createOrderAction({ ok: false }, itemsFd(okItems))
    expect(res).toEqual({ ok: false, error: AUTHZ_ERROR })
    expect(createOrder).not.toHaveBeenCalled()
  })

  it("rejects an empty items list and never calls the API", async () => {
    const res = await createOrderAction({ ok: false }, itemsFd([]))
    expect(res.ok).toBe(false)
    expect(createOrder).not.toHaveBeenCalled()
  })

  it("rejects an item with a non-positive quantity", async () => {
    const res = await createOrderAction({ ok: false }, itemsFd([{ productId: "p1", quantity: 0 }]))
    expect(res.ok).toBe(false)
    expect(createOrder).not.toHaveBeenCalled()
  })

  it("rejects an item missing a productId", async () => {
    const res = await createOrderAction({ ok: false }, itemsFd([{ quantity: 1 }]))
    expect(res.ok).toBe(false)
    expect(createOrder).not.toHaveBeenCalled()
  })

  it("rejects malformed items JSON", async () => {
    const res = await createOrderAction({ ok: false }, fd({ items: "not-json" }))
    expect(res.ok).toBe(false)
    expect(createOrder).not.toHaveBeenCalled()
  })

  it("maps items, discount and notes correctly and revalidates the list", async () => {
    createOrder.mockResolvedValueOnce({ order: { id: "o1" } })
    const res = await createOrderAction(
      { ok: false },
      itemsFd(
        [
          { productId: "p1", quantity: 2, unitPrice: 15000 },
          { productId: "p2", quantity: 1 },
        ],
        { discountAmount: "5000", notes: "tanpa gula" },
      ),
    )
    expect(res).toEqual({ ok: true })
    expect(createOrder).toHaveBeenCalledWith({
      items: [
        { productId: "p1", quantity: 2, unitPrice: 15000 },
        { productId: "p2", quantity: 1 },
      ],
      discountAmount: 5000,
      notes: "tanpa gula",
    })
    expect(revalidatePath).toHaveBeenCalledWith("/orders")
  })

  it("omits discount and notes when blank (walk-in, no customerId)", async () => {
    createOrder.mockResolvedValueOnce({ order: { id: "o2" } })
    await createOrderAction({ ok: false }, itemsFd([{ productId: "p1", quantity: 1 }]))
    expect(createOrder).toHaveBeenCalledWith({
      items: [{ productId: "p1", quantity: 1 }],
      discountAmount: undefined,
      notes: undefined,
    })
    const [payload] = createOrder.mock.calls[0]
    expect(payload).not.toHaveProperty("customerId")
  })

  it("maps a backend error to a generic message (no raw leak) and logs server-side", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    createOrder.mockRejectedValueOnce(new Error("Encore: insufficient stock in products table"))
    const res = await createOrderAction({ ok: false }, itemsFd([{ productId: "p1", quantity: 1 }]))
    expect(res).toEqual({ ok: false, error: GENERIC_ERROR })
    if (!res.ok) expect(res.error).not.toContain("Encore")
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})

describe("updateOrderStatusAction", () => {
  it("rejects unauthenticated callers and never calls the API", async () => {
    profile.mockRejectedValueOnce(new Error("401"))
    const res = await updateOrderStatusAction("o1", fd({ status: "confirmed" }))
    expect(res).toEqual({ ok: false, error: SESSION_ERROR })
    expect(updateOrderStatus).not.toHaveBeenCalled()
  })

  it("rejects a non-admin role and never calls the API", async () => {
    profile.mockResolvedValueOnce({ email: "staff@mafaaza.test", role: "user" })
    const res = await updateOrderStatusAction("o1", fd({ status: "confirmed" }))
    expect(res).toEqual({ ok: false, error: AUTHZ_ERROR })
    expect(updateOrderStatus).not.toHaveBeenCalled()
  })

  it("rejects an invalid status enum value", async () => {
    const res = await updateOrderStatusAction("o1", fd({ status: "shipped" }))
    expect(res.ok).toBe(false)
    expect(updateOrderStatus).not.toHaveBeenCalled()
  })

  it("requires paidAmount when transitioning to paid", async () => {
    const res = await updateOrderStatusAction("o1", fd({ status: "paid" }))
    expect(res.ok).toBe(false)
    expect(updateOrderStatus).not.toHaveBeenCalled()
  })

  it("updates status with paidAmount and revalidates", async () => {
    updateOrderStatus.mockResolvedValueOnce({ order: { id: "o1" } })
    const res = await updateOrderStatusAction("o1", fd({ status: "paid", paidAmount: "20000" }))
    expect(res).toEqual({ ok: true })
    expect(updateOrderStatus).toHaveBeenCalledWith("o1", {
      status: "paid",
      paidAmount: 20000,
    })
    expect(revalidatePath).toHaveBeenCalledWith("/orders")
  })

  it("updates a non-paid status without paidAmount", async () => {
    updateOrderStatus.mockResolvedValueOnce({ order: { id: "o1" } })
    const res = await updateOrderStatusAction("o1", fd({ status: "confirmed" }))
    expect(res).toEqual({ ok: true })
    expect(updateOrderStatus).toHaveBeenCalledWith("o1", {
      status: "confirmed",
      paidAmount: undefined,
    })
  })

  it("maps a backend error to a generic message", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    updateOrderStatus.mockRejectedValueOnce(new Error("Encore: invalid transition"))
    const res = await updateOrderStatusAction("o1", fd({ status: "confirmed" }))
    expect(res).toEqual({ ok: false, error: GENERIC_ERROR })
    spy.mockRestore()
  })
})

describe("deleteOrderAction (hard delete)", () => {
  it("rejects unauthenticated callers and never calls the API", async () => {
    profile.mockRejectedValueOnce(new Error("401"))
    const res = await deleteOrderAction("o1")
    expect(res).toEqual({ ok: false, error: SESSION_ERROR })
    expect(deleteOrder).not.toHaveBeenCalled()
  })

  it("rejects a non-admin role and never calls the API", async () => {
    profile.mockResolvedValueOnce({ email: "staff@mafaaza.test", role: "user" })
    const res = await deleteOrderAction("o1")
    expect(res).toEqual({ ok: false, error: AUTHZ_ERROR })
    expect(deleteOrder).not.toHaveBeenCalled()
  })

  it("hard-deletes (no force flag) and revalidates the list", async () => {
    deleteOrder.mockResolvedValueOnce(undefined)
    const res = await deleteOrderAction("o1")
    expect(res).toEqual({ ok: true })
    expect(deleteOrder).toHaveBeenCalledWith("o1")
    expect(revalidatePath).toHaveBeenCalledWith("/orders")
  })

  it("maps a backend error to a generic message", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    deleteOrder.mockRejectedValueOnce(new Error("Encore: fk constraint"))
    const res = await deleteOrderAction("o1")
    expect(res).toEqual({ ok: false, error: GENERIC_ERROR })
    spy.mockRestore()
  })
})
