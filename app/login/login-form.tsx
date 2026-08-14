"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setError(signInError.message ?? "Email atau kata sandi salah.");
      setPending(false);
      return;
    }

    router.push(from);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} aria-busy={pending} className="space-y-5">
      {/* Header */}
      <div className="space-y-1.5 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Hello Again!
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          Silakan masuk ke akun Mafaaza Admin Anda
        </p>
      </div>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm animate-in fade-in slide-in-from-top-1 duration-300"
        >
          {error}
        </div>
      )}

      <div className="space-y-4 pt-2">
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            className="h-12 rounded-2xl border-border/80 bg-background/50 px-4 text-sm placeholder:text-muted-foreground/70 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-brand/40 transition-all shadow-xs"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="sr-only">
            Kata sandi
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
              className="h-12 rounded-2xl border-border/80 bg-background/50 pl-4 pr-11 text-sm placeholder:text-muted-foreground/70 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-brand/40 transition-all shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground transition-colors p-1"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <div className="flex justify-end pt-1">
            <a
              href="#recovery"
              onClick={(e) => {
                e.preventDefault();
                alert("Silakan hubungi administrator untuk mereset kata sandi Anda.");
              }}
              className="text-xs font-semibold text-muted-foreground hover:text-brand transition-colors"
            >
              Recovery Password
            </a>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-2xl bg-brand font-semibold text-white shadow-md transition-all hover:bg-brand/90 hover:shadow-lg active:scale-[0.99] disabled:opacity-80 mt-2"
          disabled={pending}
        >
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Memproses...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>

        {/* Divider */}
        <div className="relative py-3">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-xs font-medium text-muted-foreground/80">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="flex items-center justify-center gap-4 pt-1">
          {/* Google */}
          <button
            type="button"
            onClick={() => alert("Login sosial Google akan datang!")}
            className="flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-card shadow-xs transition-all hover:border-brand/40 hover:bg-accent/40 hover:shadow-sm active:scale-95"
            aria-label="Masuk dengan Google"
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-1.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
          </button>

          {/* Apple */}
          <button
            type="button"
            onClick={() => alert("Login sosial Apple akan datang!")}
            className="flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-card shadow-xs transition-all hover:border-brand/40 hover:bg-accent/40 hover:shadow-sm active:scale-95"
            aria-label="Masuk dengan Apple"
          >
            <svg className="size-5 fill-foreground" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.86-1 2.97 1.07.08 2.15-.56 2.81-1.37z" />
            </svg>
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={() => alert("Login sosial Facebook akan datang!")}
            className="flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-card shadow-xs transition-all hover:border-brand/40 hover:bg-accent/40 hover:shadow-sm active:scale-95"
            aria-label="Masuk dengan Facebook"
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                fill="#1877F2"
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}

