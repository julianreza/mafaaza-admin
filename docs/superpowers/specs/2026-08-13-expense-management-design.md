# Expense Management Module Design Specification

## Overview
Module **Manajemen Pengeluaran (Expense Management)** pada aplikasi web frontend `mafaaza-admin` yang terintegrasi dengan backend API Encore (`expenses` service).

## Technical Requirements & Stack
- **Framework**: Next.js App Router (v16.3+)
- **Styling**: Tailwind CSS & Shadcn UI / Lucide React Icons
- **API Client**: Generated Encore Client (`lib/api/client.ts`) & Server Helpers (`lib/api/index.ts`)
- **Formatting**: IDR Currency Format via `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })`

## Component & Architecture Breakdown

### 1. Navigation Sidebar (`components/app-sidebar.tsx`)
- Penambahan menu item "Pengeluaran" (`/expenses`) menggunakan icon `Wallet` atau `CreditCard`.

### 2. Page & Route Handler (`app/(dashboard)/expenses/page.tsx`)
- Server Component yang dilindungi oleh autentikasi (`getApiClientFromCookies`).
- Membaca URL Query Parameters:
  - `page`: Nomor halaman (default `1`).
  - `search`: String pencarian untuk nomor referensi / deskripsi.
  - `category`: Filter kategori (`operational`, `salary`, `purchase`, `utility`, `other`).
  - `startDate`: ISO String tanggal mulai.
  - `endDate`: ISO String tanggal selesai.
- Mengambil data list dari `api.expenses.listExpenses`.
- Mengambil akumulasi rangkuman pengeluaran bulan berjalan untuk menghitung nominal Stat Cards.
- Merender `ExpensesView`.

### 3. Server Actions (`app/(dashboard)/expenses/actions.ts`)
- **`createExpenseAction(formData)`**:
  - Validasi: `description` wajib diisi, `amount` > 0.
  - Memanggil `auth.api.expenses.createExpense`.
  - Revalidate path `/expenses`.
- **`updateExpenseAction(id, formData)`**:
  - Validasi: `description` tidak boleh kosong jika diisi, `amount` > 0 jika diisi.
  - Memanggil `auth.api.expenses.updateExpense`.
  - Revalidate path `/expenses`.
- **`deleteExpenseAction(id)`**:
  - Memanggil `auth.api.expenses.deleteExpense`.
  - Revalidate path `/expenses`.

### 4. Client View (`app/(dashboard)/expenses/expenses-view.tsx`)
- **A. Stat Cards (Bulan Ini)**:
  1. Total Pengeluaran Bulan Ini
  2. Pengeluaran Operasional (`operational`)
  3. Pengeluaran Gaji (`salary`)
  4. Pengeluaran Lainnya (`purchase` + `utility` + `other`)
- **B. Filter & Pencarian Bar**:
  - Date Range Picker (`startDate` & `endDate`).
  - Select Category Filter.
  - Input Search untuk No Referensi / Deskripsi.
  - Button Reset Filter.
- **C. Data Table**:
  - No. Referensi (monospace / bold badge).
  - Tanggal Kejadian (`occurredAt`) format Indonesia (`13 Agt 2026`).
  - Kategori badge warna (Operasional: Biru, Salary: Hijau, Purchase: Ungu, Utility: Kuning, Other: Abu-abu).
  - Deskripsi text.
  - Jumlah (Bold, right-aligned IDR format).
  - Dicatat Oleh (`recordedBy`).
  - Action menu (Edit & Delete buttons).
- **D. Skeleton & Empty States**:
  - Rendering Skeleton UI saat loading data.
  - Empty state UI jika data pengeluaran tidak ditemukan / belum ada.
- **E. Paginasi**:
  - Indikator `Halaman X dari Y`.
  - Navigation button Prev / Next.

### 5. Dialog Components
- **`app/(dashboard)/expenses/expense-form-dialog.tsx`**:
  - Modal form dialog untuk Create & Edit expense.
  - Validation error state & Toast notification (Sonner) saat success/error.
- **`app/(dashboard)/expenses/delete-expense-dialog.tsx`**:
  - AlertDialog konfirmasi hapus record.
  - Pesan peringatan: *"Apakah Anda yakin ingin menghapus pengeluaran ini? Tindakan ini tidak dapat dibatalkan."*

## Data Model Reference (`expenses.Expense`)
```ts
export interface Expense {
  id: string;
  referenceNumber: string | null;
  category: ExpenseCategory; // "operational" | "salary" | "purchase" | "utility" | "other"
  description: string;
  amount: number;
  recordedBy: string;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}
```
