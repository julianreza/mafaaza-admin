# Login Page Redesign Specification

## Overview
Redesign the Mafaaza Admin login page (`app/login/page.tsx` & `app/login/login-form.tsx`) to match the user's reference UI while using the soft red / dusty rose color palette (`--primary: oklch(0.52 0.1 18)`).

## Design & Layout
1. **Background**:
   - Subtle gradient container backdrop with soft red / dusty rose radial glow (`bg-background` with warm soft red accent backdrop).
   - Card container with `rounded-[28px]`, clean border (`border-border`), shadow, and soft dark mode adaptation.

2. **Split 2-Column Layout**:
   - **Left Column (Login Form)**:
     - Header: "Halo Lagi!" / "Selamat Datang" with subtitle "Silakan masuk ke akun Mafaaza Admin Anda".
     - Input fields with rounded corners (`rounded-xl`), soft background / crisp border:
       - **Email Input**: placeholder `nama@contoh.com`
       - **Password Input**: toggle show/hide password button using `Eye` and `EyeOff` icons from `lucide-react`.
       - Right-aligned link: "Lupa kata sandi?".
     - **Primary Action Button**: "Masuk" with full width, soft red brand color (`bg-brand`), rounded pill/xl corners (`rounded-xl`), smooth hover states & loading indicator.
     - **Divider**: "Atau lanjutkan dengan" ("Or continue with").
     - **Social Login Row**: Interactive icon buttons for **Google**, **Apple**, and **Facebook** in soft white rounded cards with hover elevation.

   - **Right Column (Banner Illustration)**:
     - Hidden on mobile (`hidden lg:flex`), visible on large screens.
     - Rounded container (`rounded-[24px]`) featuring the generated landscape vector illustration (`/login-banner.jpg`).
     - Gradient text overlay at bottom: *"Akhirnya, semua pekerjaan Anda dalam satu tempat."*
     - Carousel / slider navigation indicators at the bottom left (`< >`).

## Security & Functionality
- Retains existing `authClient.signIn.email({ email, password })` integration.
- Graceful error messaging display on invalid credentials.
- Loading state disables inputs and shows `Loader2` spinner on submit button.
