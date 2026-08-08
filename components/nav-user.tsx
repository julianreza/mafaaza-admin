"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import { ChevronsUpDown, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface NavUserProps {
  user: { name: string; email: string; role: string };
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const { setTheme } = useTheme();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await authClient.signOut();
      // Full navigation so middleware re-evaluates and the server layout re-runs.
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Gagal keluar. Coba lagi.");
      setSigningOut(false);
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground transition-all duration-200 hover:bg-sidebar-accent/70"
              />
            }
          >
            <div className="flex items-center gap-3 transition-transform hover:scale-105">
              <Avatar className="size-8 rounded-lg ring-2 ring-brand/40 shadow-glow-gradient-brand hover:ring-accent-2/60 transition-all">
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-brand to-accent-2 text-white">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight hidden md:block">
                <span className="truncate font-semibold text-sidebar-primary-foreground">{user.name}</span>
                <span className="truncate text-xs text-sidebar-foreground">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 transition-transform group-data-[popup-open]:rotate-180" />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl shadow-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-brand to-accent-2 text-white">{initials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-sidebar-primary-foreground">{user.name}</span>
                    <span className="text-muted-foreground truncate text-xs">{user.role}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setTheme("light")} className="transition-colors hover:bg-accent">
                <Sun /> Terang
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="transition-colors hover:bg-accent">
                <Moon /> Gelap
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="transition-colors hover:bg-accent">
                <Monitor /> Sistem
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={handleSignOut}
                disabled={signingOut}
                variant="destructive"
                className="transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut /> {signingOut ? "Keluar..." : "Keluar"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
