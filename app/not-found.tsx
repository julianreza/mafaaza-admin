import Link from "next/link";
import { ReceiptText, Home, ShoppingBag, SearchX, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "404 - Halaman Tidak Ditemukan | Mafaaza Admin",
};

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-svh items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-soft/60 via-background to-background p-4 sm:p-6 md:p-8 overflow-hidden selection:bg-brand/10 selection:text-brand">
      {/* Background ambient glow matching login page & brand palette */}
      <div className="pointer-events-none absolute -top-40 -right-40 size-[550px] rounded-full bg-brand/10 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-[550px] rounded-full bg-brand-accent/10 blur-3xl animate-pulse" />

      {/* Main Glassmorphism / Elevated Card Container */}
      <div className="relative flex w-full max-w-2xl flex-col items-center overflow-hidden rounded-[28px] border border-border/80 bg-card p-6 sm:p-10 md:p-12 shadow-2xl shadow-brand/10 transition-all sm:rounded-[36px] text-center">
        
        {/* Top Brand Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-brand text-white shadow-md shadow-brand/25">
            <ReceiptText aria-hidden="true" className="size-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Mafaaza Admin
          </span>
        </div>

        {/* 404 Visual Showcase Badge */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Number with bold brand typography */}
            <span className="text-7xl sm:text-8xl md:text-9xl font-extrabold tracking-tighter text-foreground select-none">
              404
            </span>
            
            {/* Floating Soft Badge */}
            <div className="absolute -bottom-2 -right-3 flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-soft px-3 py-1 text-xs font-semibold text-brand shadow-sm">
              <SearchX className="size-3.5" />
              <span>Lost in Orders</span>
            </div>
          </div>
        </div>

        {/* Headline & Friendly Description */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
          Halaman Tidak Ditemukan
        </h1>
        <p className="max-w-md text-sm sm:text-base text-muted-foreground mb-8 leading-relaxed">
          Maaf, halaman yang Anda cari tidak tersedia, telah dipindahkan, atau tautan yang dimasukkan mungkin keliru.
        </p>

        {/* Primary & Secondary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md justify-center mb-8">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full sm:w-auto min-w-[180px] h-11 rounded-xl bg-brand text-white hover:bg-brand-deep shadow-md shadow-brand/20 font-medium gap-2 transition-transform active:scale-[0.98]"
            )}
          >
            <Home className="size-4" />
            <span>Kembali ke Dashboard</span>
          </Link>

          <Link
            href="/orders"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full sm:w-auto min-w-[160px] h-11 rounded-xl border-border/90 hover:bg-muted/80 font-medium gap-2"
            )}
          >
            <ShoppingBag className="size-4" />
            <span>Kelola Pesanan</span>
          </Link>
        </div>

        {/* Quick Links / Shortcut Pills */}
        <div className="pt-6 border-t border-border/60 w-full flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="size-3.5 text-brand" />
            <span>Tautan Cepat:</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/products" className="hover:text-foreground underline-offset-4 hover:underline transition-colors">
              Menu Produk
            </Link>
            <span>•</span>
            <Link href="/expenses" className="hover:text-foreground underline-offset-4 hover:underline transition-colors">
              Pengeluaran
            </Link>
            <span>•</span>
            <Link href="/login" className="hover:text-foreground underline-offset-4 hover:underline transition-colors">
              Masuk Akun
            </Link>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="mt-8 text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} Mafaaza POS & Admin System
        </div>

      </div>
    </div>
  );
}
