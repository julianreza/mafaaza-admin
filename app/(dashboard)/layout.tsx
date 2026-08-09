import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReceiptText } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
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
      <AppSidebar user={user} />
      <SidebarInset className="relative min-h-svh overflow-hidden bg-gradient-to-br from-brand-soft via-background to-accent-2-soft/60 dark:from-brand-soft/35 dark:via-background dark:to-accent-2-soft/25">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 right-[12%] size-80 rounded-full bg-brand/10 blur-3xl animate-float-slow" />
          <div className="absolute -bottom-32 left-[18%] size-96 rounded-full bg-accent-2/10 blur-3xl animate-float-slow [animation-delay:8s]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-20" />
        </div>

        <header className="relative z-10 flex h-16 shrink-0 items-center gap-3 border-b border-border/80 bg-background/85 px-4 backdrop-blur-xl dark:bg-card/85 sm:px-6">
          <SidebarTrigger className="-ml-1 transition-colors hover:bg-brand/10 hover:text-brand" />
          <Separator
            orientation="vertical"
            className="data-[orientation=vertical]:h-5"
          />
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-r from-brand via-brand-accent to-accent-2 text-white shadow-sm animate-gradient-orbit">
              <ReceiptText aria-hidden="true" className="size-4" />
            </div>
            <div className="grid leading-tight">
              <h1 className="text-sm font-semibold text-foreground">Mafaaza</h1>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
        </header>
        <main className="relative z-10 flex flex-1 flex-col p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
