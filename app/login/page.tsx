import { Suspense } from "react";
import { ReceiptText } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata = { title: "Masuk — Mafaaza Admin" };

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 p-4 sm:p-6 md:p-10 relative overflow-hidden">
      {/* Gradient base layer */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-brand-soft via-background to-accent-2-soft/40 animate-gradient-shift pointer-events-none"
      />

      {/* Animated brand blobs */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-gradient-to-br from-brand/20 to-accent-2/10 rounded-full blur-3xl animate-float-slow"
        />
        <div
          className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-gradient-to-bl from-brand-accent/25 to-accent-2/15 rounded-full blur-3xl animate-float-slow"
          style={{ animationDelay: "7s" }}
        />
        <div
          className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-gradient-to-tr from-brand/15 to-accent-2/10 rounded-full blur-3xl animate-float-slow"
          style={{ animationDelay: "14s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-700">
        <div className="flex items-center justify-center gap-2 mb-8 font-medium text-lg">
          <div className="bg-gradient-to-br from-brand to-accent-2 text-white flex size-8 items-center justify-center rounded-lg shadow-glow-gradient-brand transition-transform hover:scale-110">
            <ReceiptText aria-hidden="true" className="size-5" />
          </div>
          Mafaaza
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
