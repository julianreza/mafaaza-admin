"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { EllipsisIcon, PlusIcon, SearchIcon } from "lucide-react"

import type { masters } from "@/lib/api/client"
import { ProductFormDialog } from "./product-form-dialog"
import { DeleteProductDialog } from "./delete-product-dialog"

interface ProductsViewProps {
  products: masters.ProductWithCategory[]
  total: number
  page: number
  limit: number
  search: string
}

export function ProductsView({
  products,
  total,
  page,
  limit,
  search,
}: ProductsViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<masters.ProductWithCategory | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<masters.ProductWithCategory | null>(null)
  const [searchInput, setSearchInput] = useState(search)

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("search", value)
    } else {
      params.delete("search")
    }
    params.set("page", "1")
    router.push(`/products?${params.toString()}`)
  }, [router, searchParams])

  // Debounced search input sync
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Only sync if searchInput is different from search param
      if (searchInput !== (searchParams.get("search") ?? "")) {
        handleSearchChange(searchInput)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchInput, searchParams, handleSearchChange])

  const totalPages = Math.ceil(total / limit)

  const handleEdit = (product: masters.ProductWithCategory) => {
    setEditProduct(product)
  }

  const handleDelete = (product: masters.ProductWithCategory) => {
    setDeleteProduct(product)
  }

  const handleSuccess = () => {
    setCreateDialogOpen(false)
    setEditProduct(null)
    setDeleteProduct(null)
    router.refresh()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <>
      <Card className="border-border/70 bg-card/90 shadow-sm backdrop-blur-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">Daftar Produk</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Menampilkan {products.length} dari {total} produk
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-9 w-64"
              />
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <PlusIcon className="mr-2 size-4" />
              Tambah Produk
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <SearchIcon className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Tidak ada produk</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                {search ? "Coba ubah kata kunci pencarian Anda." : "Mulai dengan menambahkan produk baru."}
              </p>
              {!search && (
                <Button variant="outline" className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                  <PlusIcon className="mr-2 size-4" />
                  Tambah Produk Pertama
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border/70 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-muted/50">
                      <TableHead className="w-16">Nama</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Harga</TableHead>
                      <TableHead>Satuan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium text-foreground">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.sku || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.categoryName || "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium text-foreground">
                          {formatPrice(product.price)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.unit}
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                                <EllipsisIcon className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleEdit(product)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDelete(product)}
                              >
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    Halaman {page} dari {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString())
                        params.set("page", (page - 1).toString())
                        router.push(`/products?${params.toString()}`)
                      }}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString())
                        params.set("page", (page + 1).toString())
                        router.push(`/products?${params.toString()}`)
                      }}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {createDialogOpen && (
        <ProductFormDialog
          open
          onOpenChange={setCreateDialogOpen}
          product={null}
          onSuccess={handleSuccess}
        />
      )}

      {editProduct && (
        <ProductFormDialog
          open={!!editProduct}
          onOpenChange={(open) => {
            if (!open) setEditProduct(null)
          }}
          product={editProduct}
          onSuccess={handleSuccess}
        />
      )}

      {deleteProduct && (
        <DeleteProductDialog
          open={!!deleteProduct}
          onOpenChange={(open) => {
            if (!open) setDeleteProduct(null)
          }}
          product={deleteProduct}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
