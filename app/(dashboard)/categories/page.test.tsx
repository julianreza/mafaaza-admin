import { describe, it, expect, vi, beforeEach } from "vitest"

const { profile, listCategories, redirect } = vi.hoisted(() => ({
  profile: vi.fn(),
  listCategories: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`)
  }),
}))

vi.mock("@/lib/api", () => ({
  getApiClientFromCookies: () => ({
    mafaaza_api: { profile },
    masters: { listCategories },
  }),
}))

vi.mock("next/headers", () => ({
  cookies: async () => ({ toString: () => "better-auth.session_token=abc" }),
}))

vi.mock("next/navigation", () => ({ redirect }))

vi.mock("@/app/(dashboard)/categories/categories-view", () => ({
  CategoriesView: (props: unknown) => props,
}))

import CategoriesPage from "@/app/(dashboard)/categories/page"
import { CategoriesView } from "@/app/(dashboard)/categories/categories-view"

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

async function renderPage(sp: { page?: string; search?: string }) {
  const element = await CategoriesPage({ searchParams: Promise.resolve(sp) })
  return findByType(element, CategoriesView)?.props
}

beforeEach(() => {
  vi.clearAllMocks()
  profile.mockResolvedValue({ email: "admin@mafaaza.test", role: "admin" })
  listCategories.mockResolvedValue({ categories: [], total: 0, page: 1, limit: 20 })
})

describe("CategoriesPage — auth", () => {
  it("redirects to /login when the session is invalid and never fetches", async () => {
    profile.mockRejectedValueOnce(new Error("401"))
    await expect(
      CategoriesPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("NEXT_REDIRECT:/login")
    expect(redirect).toHaveBeenCalledWith("/login")
    expect(listCategories).not.toHaveBeenCalled()
  })
})

describe("CategoriesPage — list + search + pagination", () => {
  it("fetches page 1 with no search by default", async () => {
    await renderPage({})
    expect(listCategories).toHaveBeenCalledWith({ page: 1, limit: 20, search: undefined })
  })

  it("passes the search term through", async () => {
    await renderPage({ search: "makanan" })
    expect(listCategories).toHaveBeenCalledWith({ page: 1, limit: 20, search: "makanan" })
  })

  it("parses a valid page number", async () => {
    await renderPage({ page: "3" })
    expect(listCategories).toHaveBeenCalledWith({ page: 3, limit: 20, search: undefined })
  })

  it.each(["abc", "0", "-2", ""])(
    "sanitizes an invalid page (%s) to 1",
    async (page) => {
      await renderPage({ page })
      expect(listCategories).toHaveBeenCalledWith({ page: 1, limit: 20, search: undefined })
    },
  )

  it("forwards fetched categories, total, page and search to the view", async () => {
    listCategories.mockResolvedValueOnce({
      categories: [{ id: "c1", name: "Minuman" }],
      total: 1,
      page: 2,
      limit: 20,
    })
    const props = await renderPage({ page: "2", search: "mi" })
    expect(props.categories).toEqual([{ id: "c1", name: "Minuman" }])
    expect(props.total).toBe(1)
    expect(props.page).toBe(2)
    expect(props.search).toBe("mi")
  })
})

describe("CategoriesPage — fetch guard", () => {
  it("degrades to an empty list (no throw) when the backend fetch fails", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    listCategories.mockRejectedValueOnce(new Error("Encore: 500"))
    const props = await renderPage({ page: "5" })
    expect(props.categories).toEqual([])
    expect(props.total).toBe(0)
    expect(props.page).toBe(5)
    spy.mockRestore()
  })
})
