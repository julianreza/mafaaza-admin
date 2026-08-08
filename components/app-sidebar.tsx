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
    <Sidebar collapsible="icon" className="transition-all duration-300 ease-in-out">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="bg-gradient-to-br from-brand to-accent-2 text-white flex aspect-square size-8 items-center justify-center rounded-lg shadow-glow-brand transition-transform hover:scale-105 hover:rotate-3">
                <ReceiptText className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-sidebar-primary-foreground">Mafaaza</span>
                <span className="truncate text-xs text-sidebar-foreground">Pencatatan Penjualan</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="animate-in slide-in-from-left duration-300">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/60 font-semibold">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item, i) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href} className={isActive ? "group/active" : ""}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        render={<Link href={item.href} />}
                        className={isActive ? "bg-gradient-to-r from-brand/20 to-accent-2/20 shadow-sm ring-1 ring-foreground/10" : ""}
                      >
                        <div className={isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground group-hover/active:text-sidebar-primary-foreground transition-colors"}>
                          <item.icon className={isActive ? "stroke-[2.5px]" : "stroke-[2px]"} />
                        </div>
                        <span className={isActive ? "font-medium" : "font-normal"}>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="animate-in slide-in-from-bottom duration-300">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
