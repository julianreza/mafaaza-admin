"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ReceiptText,
  ShoppingCart,
  Tags,
  Users,
  Wallet,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";

const navGroups = [
  {
    label: "Ringkasan",
    items: [{ title: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "Transaksi",
    items: [
      { title: "Penjualan", href: "/orders", icon: ShoppingCart },
      { title: "Pengeluaran", href: "/expenses", icon: Wallet },
    ],
  },
  {
    label: "Master Data",
    items: [
      { title: "Produk", href: "/products", icon: Package },
      { title: "Kategori", href: "/categories", icon: Tags },
      { title: "Pelanggan", href: "/customers", icon: Users },
    ],
  },
  {
    label: "Laporan",
    items: [{ title: "Laporan", href: "/reports", icon: ReceiptText }],
  },
];

interface AppSidebarProps {
  user: { name: string; email: string; role: string };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="relative overflow-hidden border-r border-sidebar-border bg-gradient-to-b from-sidebar via-sidebar to-brand-soft/50 dark:to-brand/10">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 top-1/3 size-40 rounded-full bg-accent-2/10 blur-3xl animate-float-slow" />

      <SidebarHeader className="relative z-10 border-b border-sidebar-border/70">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-r from-brand via-brand-accent to-accent-2 text-white shadow-sm animate-gradient-orbit">
                <ReceiptText aria-hidden="true" className="size-5" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-sidebar-foreground">Mafaaza</span>
                <span className="truncate text-xs text-muted-foreground">Pencatatan Penjualan</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="relative z-10 py-2">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="py-2">
            <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/55">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href} className="px-1">
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        render={<Link href={item.href} />}
                        className={isActive ? "border-l-2 border-brand bg-brand/10 text-brand shadow-sm dark:bg-brand/20" : "border-l-2 border-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-brand"}
                      >
                        <item.icon className="size-4" />
                        <span className={isActive ? "font-semibold" : "font-medium"}>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="relative z-10 border-t border-sidebar-border/70">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
