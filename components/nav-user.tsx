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
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center rounded-lg p-1 text-left transition-colors hover:bg-peach-muted dark:hover:bg-muted"
          />
        }
      >
        <div className="flex w-full items-center gap-3">
          <Avatar className="size-9 rounded-full">
            <AvatarFallback className="rounded-full bg-brand text-white">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 flex-1 text-left text-sm leading-tight sm:grid">
            <span className="truncate font-semibold text-foreground">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto hidden size-4 shrink-0 text-muted-foreground sm:block" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="min-w-56 rounded-xl border-border bg-popover p-1 shadow-lg"
        side="bottom"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-2 font-normal">
            <div className="flex items-center gap-3 text-left text-sm">
              <Avatar className="size-9 rounded-full">
                <AvatarFallback className="rounded-full bg-brand text-white">{initials(user.name)}</AvatarFallback>
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
          <DropdownMenuItem onClick={() => setTheme("light")} className="transition-colors hover:bg-brand-soft hover:text-foreground">
            <Sun className="text-muted-foreground" /> Terang
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")} className="transition-colors hover:bg-brand-soft hover:text-foreground">
            <Moon className="text-muted-foreground" /> Gelap
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")} className="transition-colors hover:bg-brand-soft hover:text-foreground">
            <Monitor className="text-muted-foreground" /> Sistem
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
  );
}
