import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Bell, Mail, Search } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { NavUser } from "@/components/nav-user";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getApiClientFromCookies } from "@/lib/api";

/**
 * Server-side session validation — this is the actual security boundary.
 *
 * `middleware.ts` only checks that a session cookie EXISTS (cheap, no network).
 * Here we call the backend's protected /profile endpoint with that cookie, which
 * runs the real Encore auth handler and therefore Better Auth's session lookup.
 * An expired or forged cookie fails here and the user is sent back to /login.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const api = getApiClientFromCookies(cookieStore.toString());

  let user: { name: string; email: string; role: string };
  try {
    const profile = await api.mafaaza_api.profile();
    user = {
      // /profile does not return a display name yet, so fall back to the local
      // part of the email until the endpoint exposes it.
      name: profile.email.split("@")[0] ?? profile.email,
      email: profile.email,
      role: profile.role,
    };
  } catch {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-svh bg-peach-soft dark:bg-background">
        <header className="flex h-16 shrink-0 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <SidebarTrigger className="-ml-1 rounded-lg p-1.5 transition-colors hover:bg-peach-muted dark:hover:bg-muted" />

          {/* ponytail: ⌘F is a visual hint only — wiring it needs a command
              palette nobody asked for. Add the handler when that exists. */}
          <div className="relative hidden w-full max-w-sm sm:block">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              placeholder="Cari..."
              aria-label="Cari"
              className="h-9 w-full rounded-full border border-border bg-card pl-9 pr-14 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
              ⌘F
            </kbd>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-peach-muted hover:text-foreground dark:hover:bg-muted"
              aria-label="Pesan"
            >
              <Mail className="size-5" />
            </button>
            <button
              type="button"
              className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-peach-muted hover:text-foreground dark:hover:bg-muted"
              aria-label="Notifikasi"
            >
              <Bell className="size-5" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-brand" />
            </button>
            <div className="ml-1 w-56">
              <NavUser user={user} />
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col px-4 pb-6 sm:px-6 lg:px-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
