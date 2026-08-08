"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    if (signInError) {
      // Better Auth returns an identical error for unknown email and wrong
      // password, so the message stays deliberately generic.
      setError(
        signInError.message ?? "Email atau kata sandi salah.",
      );
      setPending(false);
      return;
    }

    // Full refresh so middleware sees the new cookie and the server layout
    // re-validates the session.
    router.push(from);
    router.refresh();
  }

  return (
    <Card className="bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 ring-foreground/5 shadow-xl hover:scale-100">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Masuk
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Gunakan email dan kata sandi akun Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} aria-busy={pending} className="grid gap-5">
          {/* Email field */}
          <div className="grid gap-2 animate-in fade-in slide-in-from-bottom-1 duration-500 [animation-delay:100ms] fill-mode-both">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nama@contoh.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
              className="h-10 border-input/80 hover:border-brand/40 focus-visible:border-brand focus-visible:ring-brand/25 transition-colors"
            />
          </div>

          {/* Password field */}
          <div className="grid gap-2 animate-in fade-in slide-in-from-bottom-1 duration-500 [animation-delay:200ms] fill-mode-both">
            <Label htmlFor="password" className="text-sm font-medium">
              Kata sandi
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
              className="h-10 border-input/80 hover:border-brand/40 focus-visible:border-brand focus-visible:ring-brand/25 transition-colors"
            />
          </div>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm animate-in fade-in slide-in-from-top-1 duration-300"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full bg-gradient-to-r from-brand to-accent-2 text-white hover:from-brand/90 hover:to-accent-2/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-glow-gradient-brand active:translate-y-0 transition-all duration-200 disabled:hover:translate-y-0 animate-in fade-in slide-in-from-bottom-1 duration-500 [animation-delay:300ms] fill-mode-both"
            disabled={pending}
          >
            <span className="relative flex items-center justify-center gap-2">
              <span
                className={`inline-flex items-center gap-2 transition-opacity duration-200 ${pending ? "opacity-0" : "opacity-100"}`}
              >
                Masuk
              </span>
              <span
                className={`absolute inset-0 inline-flex items-center justify-center gap-2 transition-opacity duration-200 ${pending ? "opacity-100" : "opacity-0"}`}
              >
                <Loader2 className="size-4 animate-spin" />
                Memproses...
              </span>
            </span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
