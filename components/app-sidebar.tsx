"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Package,
  ReceiptText,
  Settings,
  Tags,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

const menuItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Penjualan", href: "/orders", icon: ReceiptText },
  { title: "Produk", href: "/products", icon: Package },
  { title: "Kategori", href: "/categories", icon: Tags },
  { title: "Pelanggan", href: "/customers", icon: Users },
  { title: "Pengeluaran", href: "/expenses", icon: Wallet },
  { title: "Laporan", href: "/reports", icon: BarChart3 },
];

const generalItems = [
  { title: "Pengaturan", href: "/settings", icon: Settings },
  { title: "Bantuan", href: "/help", icon: HelpCircle },
];

const labelClass =
  "px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70";

function itemClass(isActive: boolean): string {
  return [
    "relative h-9 gap-2.5 rounded-lg px-2 text-sm transition-colors",
    "before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px]",
    "before:-translate-y-1/2 before:rounded-r-full",
    "group-data-[collapsible=icon]:before:hidden",
    isActive
      ? "bg-brand-soft font-semibold text-foreground before:bg-brand [&>svg]:text-brand"
      : "font-medium text-muted-foreground before:bg-transparent hover:bg-muted hover:text-foreground",
  ].join(" ");
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Gagal keluar. Coba lagi.");
      setSigningOut(false);
    }
  }

  function isActive(href: string): boolean {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="px-4 pt-5 pb-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-white">
            <ReceiptText aria-hidden="true" className="size-4" />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
            Mafaaza
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className={labelClass}>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                    className={itemClass(isActive(item.href))}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={labelClass}>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {generalItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                    className={itemClass(isActive(item.href))}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Keluar"
                  disabled={signingOut}
                  onClick={handleSignOut}
                  className={itemClass(false)}
                >
                  <LogOut className="size-4" />
                  <span>{signingOut ? "Keluar..." : "Keluar"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <div className="rounded-2xl border border-white/10 bg-brand-deep p-4 text-white group-data-[collapsible=icon]:hidden">
          <p className="text-sm font-semibold">Unduh Aplikasi Mobile</p>
          <p className="mt-1 text-xs text-white/70">Kelola toko dari mana saja</p>
          <button
            type="button"
            className="mt-3 w-full rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-deep transition-opacity hover:opacity-90"
          >
            Unduh
          </button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
