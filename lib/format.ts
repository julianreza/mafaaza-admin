// Shared display formatters. Extracted to one place so a change to currency or
// date formatting applies everywhere (previously duplicated across the orders
// feature files — Code Review Sage finding #7).

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
})

/** Format a number as Indonesian Rupiah with no fraction digits. */
export function formatPrice(price: number): string {
  return idrFormatter.format(price)
}

const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

/** Format an ISO timestamp as a short id-ID date; returns "—" when invalid. */
export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  return shortDateFormatter.format(date)
}
