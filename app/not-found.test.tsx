import { describe, it, expect } from "vitest";
import NotFoundPage, { metadata } from "./not-found";

// Helper to inspect element tree nodes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findStringsInTree(node: any, result: string[] = []): string[] {
  if (!node) return result;
  if (typeof node === "string" || typeof node === "number") {
    result.push(String(node));
    return result;
  }
  if (Array.isArray(node)) {
    for (const child of node) findStringsInTree(child, result);
    return result;
  }
  if (typeof node === "object" && node.props) {
    if (node.props.children) {
      findStringsInTree(node.props.children, result);
    }
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findLinksInTree(node: any, links: string[] = []): string[] {
  if (!node) return links;
  if (Array.isArray(node)) {
    for (const child of node) findLinksInTree(child, links);
    return links;
  }
  if (typeof node === "object") {
    if (node.props?.href) {
      links.push(node.props.href);
    }
    if (node.props?.children) {
      findLinksInTree(node.props.children, links);
    }
  }
  return links;
}

describe("NotFoundPage", () => {
  it("has correct page metadata title", () => {
    expect(metadata.title).toBe("404 - Halaman Tidak Ditemukan | Mafaaza Admin");
  });

  it("renders 404 number, heading, and brand title", () => {
    const tree = NotFoundPage();
    const strings = findStringsInTree(tree);
    const joined = strings.join(" ");

    expect(joined).toContain("404");
    expect(joined).toContain("Halaman Tidak Ditemukan");
    expect(joined).toContain("Mafaaza Admin");
    expect(joined).toContain("Kembali ke Dashboard");
  });

  it("contains navigation links to home, orders, products, expenses, and login", () => {
    const tree = NotFoundPage();
    const links = findLinksInTree(tree);

    expect(links).toContain("/");
    expect(links).toContain("/orders");
    expect(links).toContain("/products");
    expect(links).toContain("/expenses");
    expect(links).toContain("/login");
  });
});
