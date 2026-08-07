import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

function SkeletonCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton-card"
      className={cn("rounded-xl bg-muted p-6 animate-pulse", className)}
      {...props}
    />
  )
}

function SkeletonLine({ className, width = "100%", ...props }: React.ComponentProps<"div"> & { width?: string }) {
  return (
    <div
      data-slot="skeleton-line"
      className={cn("h-4 w-full rounded-md bg-muted", className)}
      style={{ width }}
      {...props}
    />
  )
}

export { Skeleton, SkeletonCard, SkeletonLine }
