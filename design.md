# Mafaaza Admin — Design & Arsitektur

Dokumen ini menggambarkan desain teknis `mafaaza-admin`: frontend admin untuk aplikasi Mafaaza (pencatatan penjualan / POS retail), berbahasa Indonesia.

## 1. Ringkasan

Mafaaza Admin adalah **pure frontend** (tanpa DB, ORM, atau state-management lib). Seluruh data datang dari backend **Encore** (`mafaaza-api-svs2`, Go) yang berjalan di `localhost:4000` saat dev. Repo ini adalah *greenfield scaffolding* Next.js + dua alur CRUD yang sudah berfungsi (produk & pesanan).

- **Nama**: `mafaaza-admin`
- **Package manager**: Bun 1.3.11
- **Bahasa UI**: Indonesia (`<html lang="id">`), tanpa i18n
- **Backend**: Encore app `mafaaza-api-svs2` (env var `API_URL=http://localhost:4000`)

## 2. Stack

| Lapisan | Pilihan |
|---|---|
| Framework | Next.js 16.3 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`, CSS-config, tanpa `tailwind.config`) |
| UI | shadcn/ui style `base-nova` + `@base-ui/react` (headless primitives, bukan Radix), lucide-react, tw-animate-css |
| Auth | better-auth 1.6.26 + plugin `adminClient()` |
| API client | Client TS **generated** dari Encore v1.57.13 (`lib/api/client.ts`, DO NOT EDIT) |
| Toast | sonner |
| Tema | next-themes (`attribute="class"`, default `system`) |
| Test | vitest 3, node env (tanpa jsdom) |

## 3. Arsitektur

```
Browser ──► Next.js (mafaaza-admin) ──► proxy.ts rewrite /auth/* ──► Encore backend :4000
                │                              │                        ├─ auth.authRoutes (better-auth)
                │                              └── server-to-server ────┤─ mafaaza_api (ping, profile)
                └── server actions / RSC ──────── typed client ───────► └─ masters (products)
                       (getApiClientFromCookies, Bearer/session cookie)   └─ transactions (orders)
```

Dua jalur komunikasi:

1. **`/auth/*` di-proxy same-origin** (via rewrite di `next.config.ts`) → cookie session tetap first-party, menghindari masalah `SameSite=None; Secure` + CORS. Browser hanya pernah bicara ke `/auth/*` di origin sendiri.
2. **Endpoint tersisa dipanggil server-to-server** dengan typed client Encore. Enkripsi/otorisasi tidak bocor ke client.

### Proxy file
`proxy.ts` di root adalah **middleware Next 16** (konvensi baru, pengganti `middleware.ts`): guard optimis — cek keberadaan cookie `better-auth.session_token` / `__Secure-...`, redirect ke `/login?from=...`, matcher mengecualikan `/auth/*`. Ini bukan otorisasi sungguhan; validasi asli ada di layer server (lihat §6).

## 4. Struktur Direktori

```
app/
  layout.tsx                    Root layout: ThemeProvider, TooltipProvider, sonner Toaster
  globals.css                   Tailwind v4 @theme tokens (palet --brand hijau oklch, dark mode)
  (dashboard)/
    layout.tsx                  Auth boundary: cookie → GET /profile → redirect /login; shell Sidebar+header
    page.tsx                    Dashboard: KPI + SalesChart/LowStock/RecentOrders/TopProducts/Gauge/Shift
    products/                   page.tsx + products-view.tsx + actions.ts + 2 dialog + 2 test
    orders/                     page.tsx + orders-view.tsx + actions.ts + 3 dialog + actions.test.ts
  login/
    page.tsx + login-form.tsx   Login email/password via authClient.signIn.email; baca ?from=
components/
  app-sidebar.tsx, nav-user.tsx, theme-provider.tsx   ("use client", chrome)
  ui/                           18 primitives shadcn (avatar…tooltip, sidebar, sonner)
  dashboard/                    8 kartu statis (server components, SVG inline, tanpa lib chart)
hooks/
  use-mobile.ts                 useIsMobile() via useSyncExternalStore + matchMedia
lib/
  api/client.ts                 Generated Encore client (DO NOT EDIT) — types + services
  api/index.ts                  Factory: createApiClient, createAuthenticatedClient(token), getApiClientFromCookies(cookie)
  auth-client.ts                better-auth React client (basePath /auth, adminClient)
  utils.ts                      cn() (clsx + tailwind-merge)
  format.ts                     formatPrice (id-ID IDR), formatDate (id-ID)
design/                         Mockup arah desain (HTML statis, Tailwind CDN) — a-buku-kas, b-struk, c-shift
.github/workflows/ci.yml        CI: tsc → eslint → vitest → next build
```

## 5. Rute & Fitur

| Rute | Status | Fitur |
|---|---|---|
| `/` (dashboard) | ✅ | Grid KPI + kartu statis |
| `/orders` (Penjualan) | ✅ | Daftar pesanan, filter status, create/update-status/delete (server actions) |
| `/products` (Produk) | ✅ | Daftar produk, search + pagination (limit 20), create/update/delete |
| `/customers` (Pelanggan) | ❌ | Nav entry, belum ada route |
| `/reports` (Laporan) | ❌ | Nav entry, belum ada route |
| `/login` | ✅ | Login email/password |

`OrderStatus = draft | confirmed | paid | cancelled`. Kartu dashboard (`components/dashboard/*`) masih statis — nilai hardcoded ("Rp 12,5jt", "38"), belum dihubungkan ke data.

## 6. Autentikasi

Lapisan berlapis (defense in depth):

1. **Guard optimis** — `proxy.ts`: cek cookie session, redirect `/login` kalau tidak ada.
2. **Validasi asli** — `(dashboard)/layout.tsx` + setiap server action memanggil `GET /profile` dengan cookie session (`getApiClientFromCookies`), redirect/403 kalau gagal.
3. **Role gate** — mutasi dibatasi `admin` (`ALLOWED_MUTATE_ROLES`) di actions produk & pesanan. Backend default akun = `user`.

Alasan berlapis: Server Actions **bypass** guard layout, jadi tiap action harus self-validating.

Login: `authClient.signIn.email`, tidak ada OAuth / UI sign-up. Logout: `authClient.signOut()`.

## 7. Alur Data

**Server Components fetch, Client Components mutate.**

- Halaman (`page.tsx`) adalah async RSC yang memanggil API lewat `getApiClientFromCookies`, lalu meneruskan data sebagai props ke view.
- View & dialog (`*-view.tsx`, `*-dialog.tsx`) adalah `"use client"` yang dispatch Server Actions; `revalidatePath()` setelah mutasi agar data segar.
- Keranjang dikirim sebagai **JSON serialized dalam FormData** → di-parse + divalidasi di dalam action.
- **Fallback gagal fetch**: halaman menurun ke daftar kosong + `console.error`, bukan rute kosong.
- **Error client-generic**: pesan backend/Encore hanya di-log server-side; konstanta seperti `GENERIC_ERROR`, `SESSION_ERROR`, `AUTHZ_ERROR` (bahasa Indonesia) untuk user.

## 8. Theming & Desain

- CSS variables shadcn + `next-themes` (`attribute="class"`); palet `--brand` hijau kustom (OKLCH) di `globals.css`, dark mode via `.dark`.
- Ada alias `--peach*` usang (ditandai stale).
- `design/` berisi 3 mockup arah desain (HTML statis, Tailwind CDN):
  - `a-buku-kas.html` — palet kertas akuntansi, token garis ledger (`--money-in/--money-out/--rule`)
  - `b-struk.html` — arah struk/nota, primary indigo "stempel"
  - `c-shift.html` — dark POS, amber primary
  - Komentar token-nya memetakan ke nama variable shadcn di `globals.css`; belum diwiring ke app.

## 9. Testing & CI

- **vitest, node env** (tanpa jsdom/RTL) — logika server-side diuji dengan mem-mock API client + primitives Next, meng-assert call/return. Include pattern: `app/**/*.test.{ts,tsx}`, `lib/**/*.test.ts`, `components/**/*.test.ts`.
- 4 test file, kolokasi dengan sumber:
  - `components/dashboard/target-gauge.test.ts` — pure fn `arcOffset`
  - `app/(dashboard)/orders/actions.test.ts` — mocks `@/lib/api`, `next/headers`, `next/cache` via `vi.hoisted`; assert auth/authz/validasi/error-map/revalidatePath
  - `app/(dashboard)/products/actions.test.ts` — pola sama
  - `app/(dashboard)/products/page.test.tsx` — render test server component
- **CI** (`.github/workflows/ci.yml`, PR ke `main`): `bunx tsc --noEmit` → `bun run lint` → `bun run test` → `bun run build`.

## 10. State Saat Ini & Peta Jalan

**Sudah jalan**: scaffold penuh, auth, dashboard shell, CRUD produk & pesanan, testing & CI.

**Belum**: 5/7 rute nav (Customers, Reports, Pengaturan, Bantuan) tanpa halaman; kartu dashboard statis; 3 mockup desain belum dipilih/diimplementasikan.

Catatan konvensi: file yang dianggap kode-kontrol dibubuhi komentar `ponytail:` menandai potongan sengaja (mis. CTA sidebar "Unduh" dipaksa tampil, alias `--peach` usang, hint search ⌘F).
