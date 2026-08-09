import { describe, it, expect, vi, beforeEach } from "vitest"

const { profile, listProducts, redirect } = vi.hoisted(() => ({
  profile: vi.fn(),
  listProducts: vi.fn(),
  // Mirror Next's redirect(), which throws to halt rendering.
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`)
  }),
}))

vi.mock("@/lib/api", () => ({
  getApiClientFromCookies: () => ({
    mafaaza_api: { profile },
    masters: { listProducts },
  }),
}))

vi.mock("next/headers", () => ({
  cookies: async () => ({ toString: () => "better-auth.session_token=abc" }),
}))

vi.mock("next/navigation", () => ({ redirect }))

// Replace the client view with a marker component so we can read the props the
// page forwards without rendering to a DOM.
vi.mock("@/app/(dashboard)/products/products-view", () => ({
  ProductsView: (props: unknown) => props,
}))

import ProductsPage from "@/app/(dashboard)/products/page"
import { ProductsView } from "@/app/(dashboard)/products/products-view"

// Depth-first search of a React element tree for the first node of a given type.
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
  const element = await ProductsPage({ searchParams: Promise.resolve(sp) })
  return findByType(element, ProductsView)?.props
}

beforeEach(() => {
  vi.clearAllMocks()
  profile.mockResolvedValue({ email: "admin@mafaaza.test", role: "admin" })
  listProducts.mockResolvedValue({ products: [], total: 0, page: 1, limit: 20 })
})

describe("ProductsPage — auth", () => {
  it("redirects to /login when the session is invalid and never fetches", async () => {
    profile.mockRejectedValueOnce(new Error("401"))
    await expect(
      ProductsPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("NEXT_REDIRECT:/login")
    expect(redirect).toHaveBeenCalledWith("/login")
    expect(listProducts).not.toHaveBeenCalled()
  })
})

describe("ProductsPage — list + search + pagination", () => {
  it("fetches page 1 with no search by default", async () => {
    await renderPage({})
    expect(listProducts).toHaveBeenCalledWith({ page: 1, limit: 20, search: undefined })
  })

  it("passes the search term through", async () => {
    await renderPage({ search: "kopi" })
    expect(listProducts).toHaveBeenCalledWith({ page: 1, limit: 20, search: "kopi" })
  })

  it("parses a valid page number", async () => {
    await renderPage({ page: "3" })
    expect(listProducts).toHaveBeenCalledWith({ page: 3, limit: 20, search: undefined })
  })

  it.each(["abc", "0", "-2", ""])(
    "sanitizes an invalid page (%s) to 1",
    async (page) => {
      await renderPage({ page })
      expect(listProducts).toHaveBeenCalledWith({ page: 1, limit: 20, search: undefined })
    },
  )

  it("forwards fetched products, total, page and search to the view", async () => {
    listProducts.mockResolvedValueOnce({
      products: [{ id: "p1", name: "Kopi" }],
      total: 1,
      page: 2,
      limit: 20,
    })
    const props = await renderPage({ page: "2", search: "ko" })
    expect(props.products).toEqual([{ id: "p1", name: "Kopi" }])
    expect(props.total).toBe(1)
    expect(props.page).toBe(2)
    expect(props.search).toBe("ko")
  })
})

describe("ProductsPage — fetch guard", () => {
  it("degrades to an empty list (no throw) when the backend fetch fails", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    listProducts.mockRejectedValueOnce(new Error("Encore: 500"))
    const props = await renderPage({ page: "5" })
    expect(props.products).toEqual([])
    expect(props.total).toBe(0)
    expect(props.page).toBe(5)
    spy.mockRestore()
  })
})
