import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
      <SidebarInset className="animate-in fade-in duration-300 bg-gradient-to-br from-brand/5 via-transparent to-accent-2/5">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-foreground/10 bg-card/40 backdrop-blur-md px-4 transition-all duration-300 hover:bg-sidebar-accent/30 shadow-glow-gradient-brand">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-semibold tracking-tight text-sidebar-primary-foreground">Mafaaza Admin</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 animate-in slide-in-from-bottom-4 duration-500 bg-card/70 backdrop-blur-sm">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
