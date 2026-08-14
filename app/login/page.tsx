import { Suspense } from "react";
import { ReceiptText } from "lucide-react";
import { LoginForm } from "./login-form";
import { BannerCarousel } from "./banner-carousel";

export const metadata = { title: "Masuk — Mafaaza Admin" };

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-soft/60 via-background to-background p-3 sm:p-4 md:p-6">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -top-40 -right-40 size-[550px] rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 size-[550px] rounded-full bg-brand-accent/10 blur-3xl" />

      {/* Main Card Container with flush right banner */}
      <div className="relative flex w-full max-w-[1560px] min-h-[calc(100vh-2.5rem)] flex-col justify-center overflow-hidden rounded-[28px] border border-border/80 bg-card p-0 shadow-2xl shadow-brand/10 transition-all sm:rounded-[36px] lg:min-h-[780px]">
        <div className="grid w-full grid-cols-1 items-stretch lg:grid-cols-12 min-h-[calc(100vh-2.5rem)] lg:min-h-[780px]">
          
          {/* Left Column: Login Form with generous internal padding */}
          <div className="flex flex-col justify-between p-6 sm:p-10 lg:col-span-5 xl:col-span-5 lg:p-12 xl:p-16">
            {/* Brand Logo */}
            <div className="mb-6 flex items-center gap-3.5">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-brand text-white shadow-md shadow-brand/25">
                <ReceiptText aria-hidden="true" className="size-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">
                Mafaaza
              </span>
            </div>

            {/* Login Form Container */}
            <div className="my-auto py-4">
              <Suspense>
                <LoginForm />
              </Suspense>
            </div>

            {/* Footer copyright */}
            <div className="mt-6 text-center text-xs text-muted-foreground/60 lg:text-left">
              &copy; {new Date().getFullYear()} Mafaaza Admin. Hak cipta dilindungi.
            </div>
          </div>

          {/* Right Column: Interactive Thematic Fried Chicken Carousel (Flush Full Top to Bottom) */}
          <BannerCarousel />

        </div>
      </div>
    </div>
  );
}







