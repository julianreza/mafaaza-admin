import { describe, it, expect, vi, beforeEach } from "vitest"

const { profile, listExpenses, redirect } = vi.hoisted(() => ({
  profile: vi.fn(),
  listExpenses: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`)
  }),
}))

vi.mock("@/lib/api", () => ({
  getApiClientFromCookies: () => ({
    mafaaza_api: { profile },
    expenses: { listExpenses },
  }),
}))

vi.mock("next/headers", () => ({
  cookies: async () => ({ toString: () => "session=abc" }),
}))

vi.mock("next/navigation", () => ({
  redirect,
}))

vi.mock("./expenses-view", () => ({
  ExpensesView: (props: unknown) => props,
}))

import ExpensesPage from "./page"
import { ExpensesView } from "./expenses-view"

// Helper to find a component node in React element tree
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findByType(node: any, type: unknown): any {
  if (!node || typeof node !== "object") return null
  if (node.type === type) return node
  const children = node.props?.children
  const arr = Array.isArray(children) ? children : [children]
  for (const child of arr) {
    const found = findByType(child, type)
    if (found) return found
  }
  return null
}

async function renderPage(sp: {
  page?: string
  search?: string
  category?: string
  startDate?: string
  endDate?: string
}) {
  const element = await ExpensesPage({ searchParams: Promise.resolve(sp) })
  return findByType(element, ExpensesView)?.props
}

const mockExpenseItem = {
  id: "exp-1",
  referenceNumber: "EXP/2026/08/0001",
  category: "operational",
  description: "Listrik",
  amount: 500000,
  recordedBy: "admin",
  occurredAt: "2026-08-13T00:00:00Z",
  createdAt: "2026-08-13T00:00:00Z",
  updatedAt: "2026-08-13T00:00:00Z",
}

beforeEach(() => {
  vi.clearAllMocks()
  profile.mockResolvedValue({ email: "admin@mafaaza.test", role: "admin" })
  listExpenses.mockResolvedValue({
    expenses: [mockExpenseItem],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  })
})

describe("ExpensesPage — Auth", () => {
  it("redirects to /login if profile fetch fails", async () => {
    profile.mockRejectedValueOnce(new Error("Unauthorized"))
    await expect(
      ExpensesPage({ searchParams: Promise.resolve({}) })
    ).rejects.toThrow("NEXT_REDIRECT:/login")
    expect(redirect).toHaveBeenCalledWith("/login")
    expect(listExpenses).not.toHaveBeenCalled()
  })
})

describe("ExpensesPage — Data Fetching & SearchParams", () => {
  it("fetches expenses and month summary with default params", async () => {
    const props = await renderPage({})
    expect(listExpenses).toHaveBeenCalled()
    expect(props.expenses).toEqual([mockExpenseItem])
    expect(props.total).toBe(1)
    expect(props.page).toBe(1)
    expect(props.limit).toBe(20)
    expect(props.summary).toEqual({
      totalMonth: 500000,
      operationalMonth: 500000,
      salaryMonth: 0,
      otherMonth: 0,
    })
  })

  it("passes search, category, startDate, and endDate to listExpenses", async () => {
    await renderPage({
      page: "2",
      search: "listrik",
      category: "operational",
      startDate: "2026-08-01",
      endDate: "2026-08-31",
    })
    expect(listExpenses).toHaveBeenCalledWith({
      page: 2,
      limit: 20,
      search: "listrik",
      category: "operational",
      startDate: "2026-08-01",
      endDate: "2026-08-31",
    })
  })

  it("handles category 'all' as undefined for filtering", async () => {
    await renderPage({ category: "all" })
    expect(listExpenses).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ category: undefined })
    )
  })

  it("degrades gracefully on listExpenses failure", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    listExpenses.mockRejectedValueOnce(new Error("API Error"))
    const props = await renderPage({})
    expect(props.expenses).toEqual([])
    expect(props.total).toBe(0)
    consoleSpy.mockRestore()
  })
})
