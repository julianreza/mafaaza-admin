import { describe, it, expect, vi, beforeEach } from "vitest"

const { profile, createExpense, updateExpense, deleteExpense, revalidatePath } =
  vi.hoisted(() => ({
    profile: vi.fn(),
    createExpense: vi.fn(),
    updateExpense: vi.fn(),
    deleteExpense: vi.fn(),
    revalidatePath: vi.fn(),
  }))

vi.mock("@/lib/api", () => ({
  getApiClientFromCookies: () => ({
    mafaaza_api: { profile },
    expenses: { createExpense, updateExpense, deleteExpense },
  }),
}))

vi.mock("next/headers", () => ({
  cookies: async () => ({ toString: () => "better-auth.session_token=abc" }),
}))

vi.mock("next/cache", () => ({ revalidatePath }))

import {
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
} from "@/app/(dashboard)/expenses/actions"

function fd(entries: Record<string, string>) {
  const f = new FormData()
  for (const [k, v] of Object.entries(entries)) f.append(k, v)
  return f
}

beforeEach(() => {
  vi.clearAllMocks()
  profile.mockResolvedValue({ email: "admin@mafaaza.test", role: "admin" })
})

describe("createExpenseAction", () => {
  it("requires a non-empty description", async () => {
    const res = await createExpenseAction(fd({ description: "  ", amount: "10000" }))
    expect(res).toEqual({ ok: false, error: "Deskripsi pengeluaran wajib diisi." })
    expect(createExpense).not.toHaveBeenCalled()
  })

  it("requires amount > 0", async () => {
    const res = await createExpenseAction(fd({ description: "Pembelian Kertas", amount: "0" }))
    expect(res).toEqual({ ok: false, error: "Nominal pengeluaran harus lebih besar dari 0." })
    expect(createExpense).not.toHaveBeenCalled()
  })

  it("creates an expense successfully and revalidates path", async () => {
    createExpense.mockResolvedValueOnce({ expense: { id: "exp-1" } })
    const res = await createExpenseAction(
      fd({
        category: "operational",
        description: "Listrik Kantor",
        amount: "150000",
        occurredAt: "2026-08-13",
        referenceNumber: "EXP/2026/08/0001",
      })
    )
    expect(res).toEqual({ ok: true })
    expect(createExpense).toHaveBeenCalledWith({
      category: "operational",
      description: "Listrik Kantor",
      amount: 150000,
      occurredAt: "2026-08-13",
      referenceNumber: "EXP/2026/08/0001",
    })
    expect(revalidatePath).toHaveBeenCalledWith("/expenses")
  })
})

describe("updateExpenseAction", () => {
  it("updates an expense successfully and revalidates path", async () => {
    updateExpense.mockResolvedValueOnce({ expense: { id: "exp-1" } })
    const res = await updateExpenseAction(
      "exp-1",
      fd({
        category: "salary",
        description: "Gaji Staf",
        amount: "3000000",
        occurredAt: "2026-08-13",
      })
    )
    expect(res).toEqual({ ok: true })
    expect(updateExpense).toHaveBeenCalledWith("exp-1", {
      category: "salary",
      description: "Gaji Staf",
      amount: 3000000,
      occurredAt: "2026-08-13",
    })
    expect(revalidatePath).toHaveBeenCalledWith("/expenses")
  })
})

describe("deleteExpenseAction", () => {
  it("deletes an expense successfully and revalidates path", async () => {
    deleteExpense.mockResolvedValueOnce({ success: true })
    const res = await deleteExpenseAction("exp-1")
    expect(res).toEqual({ ok: true })
    expect(deleteExpense).toHaveBeenCalledWith("exp-1")
    expect(revalidatePath).toHaveBeenCalledWith("/expenses")
  })
})
