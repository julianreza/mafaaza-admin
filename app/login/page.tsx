import { Suspense } from "react";
import { ReceiptText } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata = { title: "Masuk — Mafaaza Admin" };

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 w-full max-w-sm animate-in fade-in zoom-in duration-500">
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md transition-transform hover:scale-110">
            <ReceiptText className="size-4" />
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
