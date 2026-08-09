import { Suspense } from "react";
import { ReceiptText } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata = { title: "Masuk — Mafaaza Admin" };

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 p-4 sm:p-6 md:p-10 relative overflow-hidden">
      {/* Animated gradient base layer */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-brand/20 via-background/10 to-accent-2/20 animate-gradient-orbit pointer-events-none"
      />

      {/* Chaotic vibrant blobs */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-gradient-to-br from-brand/25 to-accent-2/15 rounded-full blur-3xl animate-float-deep"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute top-[20%] right-[5%] w-[45%] h-[45%] bg-gradient-to-bl from-brand-accent/30 to-accent-2/20 rounded-full blur-3xl animate-float-deep"
          style={{ animationDelay: "4s" }}
        />
        <div
          className="absolute -bottom-[15%] left-[15%] w-[50%] h-[50%] bg-gradient-to-tr from-brand/20 to-accent-2/10 rounded-full blur-3xl animate-float-deep"
          style={{ animationDelay: "8s" }}
        />
        <div
          className="absolute top-[60%] left-[40%] w-[35%] h-[35%] bg-gradient-to-br from-brand-accent/25 to-accent-2/15 rounded-full blur-3xl animate-float-deep"
          style={{ animationDelay: "12s" }}
        />
        <div
          className="absolute top-[30%] left-[30%] w-[25%] h-[25%] bg-gradient-to-tr from-brand/15 to-accent-2/10 rounded-full blur-2xl animate-float-deep"
          style={{ animationDelay: "16s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-center gap-3 mb-8 font-medium text-lg relative">
          <div className="bg-gradient-to-br from-brand to-accent-2 text-white flex size-10 items-center justify-center rounded-xl shadow-glow-gradient-brand-xl animate-micro-bounce transition-transform hover:scale-110 hover:rotate-3">
            <ReceiptText aria-hidden="true" className="size-6" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-brand via-brand-accent to-accent-2 bg-clip-text text-transparent">Mafaaza</h1>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
