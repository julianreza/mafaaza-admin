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
                className="transition-colors hover:bg-sidebar-accent data-[popup-open]:bg-sidebar-accent"
              />
            }
          >
            <div className="flex items-center gap-3">
              <Avatar className="size-9 rounded-xl ring-1 ring-brand/25 shadow-sm">
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-brand to-brand-accent text-white">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-sidebar-foreground">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground transition-transform group-data-[popup-open]:rotate-180" />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border-border/80 bg-popover/95 p-1 shadow-xl backdrop-blur-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-2 font-normal">
                <div className="flex items-center gap-3 text-left text-sm">
                  <Avatar className="size-9 rounded-xl ring-1 ring-brand/20">
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-brand to-brand-accent text-white">{initials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 leading-tight">
                    <span className="truncate font-semibold text-foreground">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.role}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setTheme("light")} className="transition-colors hover:bg-amber-500/10 hover:text-foreground">
                <Sun className="text-amber-500" /> Terang
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="transition-colors hover:bg-brand/10 hover:text-foreground">
                <Moon className="text-brand" /> Gelap
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="transition-colors hover:bg-blue-500/10 hover:text-foreground">
                <Monitor className="text-blue-500" /> Sistem
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={handleSignOut}
                disabled={signingOut}
                variant="destructive"
                className="transition-colors hover:bg-destructive/10"
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
