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
import { EllipsisIcon, PlusIcon, SearchIcon, FilterIcon } from "lucide-react"

import type { masters, transactions } from "@/lib/api/client"
import { OrderFormDialog } from "./order-form-dialog"
import { OrderStatusDialog } from "./order-status-dialog"
import { DeleteOrderDialog } from "./delete-order-dialog"

// The list endpoint returns an inline row shape (no `items`), distinct from the
// full `transactions.Order`. Alias it so the table and dialogs share one type.
type OrderRow = transactions.ListOrdersResponse["orders"][number]

interface OrdersViewProps {
  orders: OrderRow[]
  total: number
  page: number
  limit: number
  search: string
  status: string
  products: masters.ProductWithCategory[]
}

const STATUS_META: Record<
  transactions.OrderStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  draft: { label: "Draf", variant: "secondary" },
  confirmed: { label: "Dikonfirmasi", variant: "outline" },
  paid: { label: "Lunas", variant: "default" },
  cancelled: { label: "Dibatalkan", variant: "destructive" },
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Semua Status" },
  { value: "draft", label: "Draf" },
  { value: "confirmed", label: "Dikonfirmasi" },
  { value: "paid", label: "Lunas" },
  { value: "cancelled", label: "Dibatalkan" },
]

export function OrdersView({
  orders,
  total,
  page,
  limit,
  search,
  status,
  products,
}: OrdersViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [statusOrder, setStatusOrder] = useState<OrderRow | null>(null)
  const [deleteOrder, setDeleteOrder] = useState<OrderRow | null>(null)
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
    router.push(`/orders?${params.toString()}`)
  }, [router, searchParams])

  // Debounced search input sync
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== (searchParams.get("search") ?? "")) {
        handleSearchChange(searchInput)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchInput, searchParams, handleSearchChange])

  const handleStatusFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("status", value)
    } else {
      params.delete("status")
    }
    params.set("page", "1")
    router.push(`/orders?${params.toString()}`)
  }

  const totalPages = Math.ceil(total / limit)

  const handleSuccess = () => {
    setCreateDialogOpen(false)
    setStatusOrder(null)
    setDeleteOrder(null)
    router.refresh()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (iso: string) => {
    const date = new Date(iso)
    if (isNaN(date.getTime())) return "—"
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date)
  }

  const activeStatusLabel =
    STATUS_FILTERS.find((f) => f.value === status)?.label ?? "Semua Status"

  return (
    <>
      <Card className="border-border/70 bg-card/90 shadow-sm backdrop-blur-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">Daftar Pesanan</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Menampilkan {orders.length} dari {total} pesanan
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari no. invoice..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-9 w-56"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" size="sm" className="h-9" />}
              >
                <FilterIcon className="mr-2 size-4" />
                {activeStatusLabel}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {STATUS_FILTERS.map((filter) => (
                  <DropdownMenuItem
                    key={filter.value || "all"}
                    onClick={() => handleStatusFilter(filter.value)}
                  >
                    {filter.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <PlusIcon className="mr-2 size-4" />
              Buat Pesanan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <SearchIcon className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Tidak ada pesanan</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                {search || status
                  ? "Coba ubah pencarian atau filter status Anda."
                  : "Mulai dengan membuat pesanan baru."}
              </p>
              {!search && !status && (
                <Button variant="outline" className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                  <PlusIcon className="mr-2 size-4" />
                  Buat Pesanan Pertama
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border/70 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-muted/50">
                      <TableHead>No. Invoice</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Dibayar</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="w-24 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const meta = STATUS_META[order.status]
                      return (
                        <TableRow key={order.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium text-foreground">
                            {order.invoiceNumber || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {order.customerName || "Walk-in"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={meta.variant}>{meta.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-foreground">
                            {formatPrice(order.totalAmount)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatPrice(order.paidAmount)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={<Button variant="ghost" size="icon-sm" className="h-8 w-8" />}
                              >
                                <EllipsisIcon className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => setStatusOrder(order)}>
                                  Ubah Status
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteOrder(order)}
                                >
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
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
                        router.push(`/orders?${params.toString()}`)
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
                        router.push(`/orders?${params.toString()}`)
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
        <OrderFormDialog
          open
          onOpenChange={setCreateDialogOpen}
          products={products}
          onSuccess={handleSuccess}
        />
      )}

      {statusOrder && (
        <OrderStatusDialog
          open={!!statusOrder}
          onOpenChange={(open) => {
            if (!open) setStatusOrder(null)
          }}
          order={statusOrder}
          onSuccess={handleSuccess}
        />
      )}

      {deleteOrder && (
        <DeleteOrderDialog
          open={!!deleteOrder}
          onOpenChange={(open) => {
            if (!open) setDeleteOrder(null)
          }}
          order={deleteOrder}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
