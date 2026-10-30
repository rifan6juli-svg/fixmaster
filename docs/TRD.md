# TRD - Fixmaster

> Versi: 0.1 | Diperbarui: 2026-10-30 | Merujuk: PRD.md

## 1. Tech Stack
| Lapisan | Pilihan | Alasan (1 kalimat) |
|---|---|---|
| Frontend | Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 | Pilihan user; satu bahasa untuk UI dan server, dan `brand/Mascot.tsx` langsung dipakai. |
| Komponen UI | shadcn/ui (Radix) + sonner (toast) + ikon lucide-react | Primitif aksesibel (dialog, select, combobox) yang kodenya disalin ke repo dan diberi token DBD. |
| Backend | Next.js Server Actions + Route Handlers, logika di `src/server/` | Tidak ada konsumen API eksternal, jadi tidak perlu server terpisah. |
| Database | Postgres: lokal **PGlite** (file `.data/pglite`), production **Supabase Postgres** | Pilihan user; mesin SQL yang sama sehingga migrasi cukup mengganti `DATABASE_URL`. |
| ORM/migrasi | Drizzle ORM 0.45 + drizzle-kit (file SQL di `drizzle/`) | Mendukung driver PGlite dan postgres-js dengan skema yang sama. |
| Auth | Better Auth 1.7 (email + password), adapter Drizzle | Data auth tersimpan di Postgres kita sendiri, jadi tidak perlu ditulis ulang saat pindah ke Supabase. |
| Validasi | Zod 4 | Satu skema untuk validasi form dan Server Action. |
| Lainnya | `signature_pad` (tanda tangan), `qrcode` (QR status), `node:crypto` (AES-256-GCM) | Kecil, tanpa layanan eksternal. |
| Hosting/Deploy | Lokal dulu; production Vercel Pro `sin1` + Supabase region Singapore [ASUMSI A-12] | Latensi rendah untuk Indonesia; Vercel Hobby melarang pemakaian komersial. |
| Layanan pihak ketiga | WhatsApp via link `wa.me` (tanpa API) | Pilihan user; gratis dan tanpa risiko blokir nomor. |

Versi runtime & package manager: Node.js 22 LTS atau lebih baru, pnpm. Test: Vitest 5, Playwright 1.64.

## 2. Arsitektur
Satu aplikasi Next.js monolit. Halaman memakai Server Components untuk membaca data dan Server Actions untuk menulis. Semua akses data lewat fungsi di `src/server/services/` yang menerima `TenantContext` (`tenantId`, `userId`, `role`) dari sesi, bukan dari input klien. Pelanggan mengakses `/s/{token}` tanpa login. Driver database dipilih dari prefix `DATABASE_URL`.

```mermaid
flowchart LR
  Staf[Staf toko<br/>browser / PWA] -->|Server Actions| App[Next.js App Router<br/>Node runtime]
  Plg[Pelanggan<br/>/s/token] --> App
  App --> Auth[Better Auth<br/>/api/auth/*]
  App --> Svc[src/server/services<br/>scoped tenant_id]
  Auth --> DB[(Postgres<br/>lokal: PGlite<br/>prod: Supabase)]
  Svc --> DB
  Staf -. link wa.me .-> WA[WhatsApp]
```

Keputusan penting:
| Keputusan | Alternatif ditolak | Alasan |
|---|---|---|
| Server Actions + service layer | REST API terpisah | Tidak ada klien lain; lebih sedikit kode dan type-safe end-to-end. |
| Isolasi tenant di lapisan aplikasi + tes wajib | Row Level Security Supabase | RLS bergantung pada JWT Supabase Auth; kita memakai Better Auth dan koneksi server-side. |
| Better Auth | Supabase Auth | Supabase Auth tidak tersedia lokal tanpa Docker dan memaksa penulisan ulang saat migrasi. |
| PGlite lokal | Postgres Docker, SQLite | Pilihan user (tanpa install); SQLite berbeda dialek dari Supabase. |
| Tanda tangan disimpan sebagai teks SVG di DB | Object storage | Tidak ada upload file di MVP; data kecil (maks 50 KB). |
| Cetak via halaman HTML + CSS `@page` | Library PDF | Printer thermal & A4 cukup dengan dialog cetak browser. |
| Uang `bigint` Rupiah bulat | `numeric` / float | Rupiah tidak memakai desimal; bebas error pembulatan. |

## 3. Struktur Folder
```
brand/                    # aset brand asli (sumber kebenaran, jangan diedit tanpa izin)
docs/                     # PRD, TRD, AFD, DBD, BSD, IPD
drizzle/                  # file migrasi SQL hasil drizzle-kit (di-commit)
public/                   # favicon.svg, logo.svg, icons/*.png (disalin dari brand/)
scripts/                  # migrate.ts, seed.ts, create-super-admin.ts (dijalankan via tsx)
src/
  app/
    (auth)/               # login, register, change-password
    (app)/                # layout terproteksi: dashboard, tickets, customers, parts, reports, settings
    admin/                # panel super-admin
    s/[token]/            # halaman status publik
    print/                # receipt/[id], invoice/[id]
    api/auth/[...all]/    # handler Better Auth
    manifest.ts           # PWA manifest
  components/
    ui/                   # primitif shadcn yang sudah diberi token DBD
    brand/                # mascot.tsx, logo.tsx
    tickets/ customers/ parts/ ...   # komponen per fitur
  lib/                    # util murni: money.ts, phone.ts, wa.ts, dates.ts, logger.ts
  server/
    db/                   # client.ts, schema/*.ts
    auth/                 # auth.ts (konfigurasi Better Auth), context.ts, guards.ts
    services/             # tickets.ts, customers.ts, parts.ts, payments.ts, reports.ts, ...
    actions/              # Server Actions (tipis: validasi -> service)
    crypto/               # device-secret.ts
  styles/globals.css      # token DBD (CSS variables) + Tailwind
tests/
  unit/  integration/  e2e/
```

## 4. Konvensi Kode
- Bahasa & mode ketat: TypeScript `strict` + `noUncheckedIndexedAccess`.
- Penamaan: file `kebab-case.ts(x)`; komponen `PascalCase`; tabel & kolom DB `snake_case` jamak; properti TS `camelCase` (dipetakan Drizzle); route URL bahasa Inggris; teks UI Bahasa Indonesia.
- Akses data: hanya `src/server/**` yang boleh mengimpor `src/server/db`. Setiap fungsi service menerima `ctx: TenantContext` sebagai argumen pertama dan selalu memfilter `tenant_id = ctx.tenantId`. `tenant_id` **tidak pernah** diambil dari input klien. Setiap service baru wajib punya tes isolasi dua tenant.
- Validasi input: skema Zod di setiap Server Action sebelum memanggil service.
- Penanganan error: Server Action mengembalikan `ActionResult<T>` = `{ ok: true, data }` atau `{ ok: false, error: { code, message, fields? } }`; kode error mengikuti BSD bagian 6. Error tak terduga dicatat lewat `logger.error` dan ditampilkan sebagai "Terjadi kesalahan, coba lagi."
- Konkurensi: update tiket menyertakan `updated_at` yang dibaca klien; jika tidak cocok kembalikan `CONFLICT`.
- Uang: integer Rupiah; format dengan `formatRupiah()` di `src/lib/money.ts`. Tanggal: simpan `timestamptz` (UTC), tampilkan dengan zona waktu toko via `Intl.DateTimeFormat('id-ID')`.
- Lint/format: ESLint (`eslint-config-next`) + Prettier -> `pnpm lint`, `pnpm format`; cek tipe `pnpm typecheck`.
- Dilarang: `any`; SQL mentah dengan konkatenasi string (pakai query builder atau template `sql`); secret di kode; `console.log` di kode yang di-commit (pakai `logger`); mengimpor modul server dari Client Component; mencatat atau mengembalikan nilai kunci layar selain lewat aksi `revealLockSecret`.

## 5. Keamanan
- Autentikasi: Better Auth email + password (hash bawaan scrypt), cookie sesi `httpOnly`, `secure` (production), `sameSite=lax`; sesi 7 hari, diperpanjang otomatis jika aktif. Rate limit bawaan Better Auth dengan penyimpanan database (PRD F-01).
- Akun staf dibuat server-side: insert `users` + `accounts` (provider `credential`) dalam satu transaksi, password di-hash dengan `hashPassword` dari `better-auth/crypto`.
- Otorisasi: `requireRole(ctx, roles)` di setiap Server Action; matriks lengkap di BSD bagian 5. Halaman `(app)` memeriksa sesi di layout; `admin/` hanya untuk `super_admin`.
- Data sensitif: `tickets.lock_secret_enc` dienkripsi AES-256-GCM dengan kunci `DEVICE_SECRET_KEY` (32 byte, base64), format `v1:{iv}:{tag}:{ciphertext}`. Token status publik = 16 byte acak (`base64url`, 22 karakter).
- Header: `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`; halaman `/s/*` dan `/print/*` diberi `noindex`.
- Secrets: lewat environment variable, daftar di `.env.example`.

## 6. Environment & Deploy
| Env | Tujuan | Catatan |
|---|---|---|
| local | pengembangan | PGlite di `.data/pglite` (di-`.gitignore`); `pnpm db:reset` untuk mulai bersih. |
| test | Vitest & Playwright | Vitest: PGlite in-memory per file tes + migrasi. Playwright: `pnpm build && pnpm start` dengan direktori PGlite sementara. |
| production | pengguna nyata | Vercel Pro (`sin1`) + Supabase Postgres Singapore; dibuat di IPD Fase 4 [ASUMSI A-11, A-12]. |

Variabel lingkungan (`.env.example`):
| Nama | Contoh lokal | Keterangan |
|---|---|---|
| `DATABASE_URL` | `file:./.data/pglite` | `file:` -> driver PGlite; `postgres://` -> driver postgres-js (Supabase transaction pooler port 6543, `prepare: false`). |
| `DIRECT_URL` | (kosong) | Hanya production: koneksi langsung port 5432 untuk menjalankan migrasi. |
| `BETTER_AUTH_SECRET` | string acak 32+ karakter | Wajib. |
| `BETTER_AUTH_URL` / `APP_URL` | `http://localhost:3000` | `APP_URL` dipakai untuk link status `{APP_URL}/s/{token}`. |
| `DEVICE_SECRET_KEY` | base64 32 byte | Kunci enkripsi kunci layar; kehilangan kunci = data kunci layar tidak bisa dibaca. |

Catatan PGlite: satu direktori data hanya bisa dibuka satu proses. Hentikan `pnpm dev` sebelum `pnpm db:migrate`/`db:seed`/`db:reset`. Instance PGlite disimpan di `globalThis` agar HMR tidak membuka instance ganda, dan `@electric-sql/pglite` dimasukkan ke `serverExternalPackages` di `next.config.ts`.

CI/CD: GitHub Actions menjalankan `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` pada setiap push/PR. Deploy production via integrasi Git Vercel (IPD langkah 28).

## 7. Strategi Testing
- Unit (Vitest): fungsi murni di `src/lib/` dan aturan domain: normalisasi nomor WA, format Rupiah, matriks transisi status, total & sisa bayar, builder link WA, enkripsi kunci layar (round-trip + ciphertext berbeda tiap kali).
- Integrasi (Vitest + PGlite in-memory): service dengan database nyata, termasuk penomoran tiket/nota per toko, mutasi stok, aturan pengambilan unit, angka laporan, dan **isolasi dua tenant** untuk setiap service.
- E2E (Playwright, Chromium, viewport 390x844 dan 1280x800): registrasi -> terima unit -> estimasi disetujui via link -> nota -> lunas -> diambil; akses per peran; halaman status publik.
- Aksesibilitas: `@axe-core/playwright` di E2E (IPD langkah 24); performa: Lighthouse preset mobile.
- Perintah standar: `pnpm test`, `pnpm test:e2e`, `pnpm lint`, `pnpm typecheck`, `pnpm build`.

## 8. Non-Fungsional Teknis
- Performa: Server Components secara default; Client Component hanya untuk interaksi (form, tanda tangan, dialog). Daftar dipaginasi 25 baris. JS per rute <= 200 KB (gzip). Indeks sesuai BSD.
- Skala awal: hingga 100 toko x 300 tiket/bulan [ASUMSI A-01], cukup untuk satu instance Supabase tier awal.
- Observability: `src/lib/logger.ts` menulis log JSON (level, pesan, `tenantId`, `userId`, tanpa data pribadi/kunci layar) ke stdout -> log Vercel. Halaman `error.tsx` dan `not-found.tsx` khusus.

## 9. Risiko Teknis
- PGlite berperilaku sedikit berbeda dari Postgres server -> hanya fitur Postgres standar (tanpa extension); jalankan tes integrasi terhadap Supabase sebelum go-live (IPD langkah 27).
- Bundling WASM PGlite di Next.js -> `serverExternalPackages`; semua rute data memakai runtime Node (bukan Edge).
- Koneksi berlebih dari serverless ke Supabase -> transaction pooler (port 6543) dengan `prepare: false`.
- Pembaruan Better Auth mengubah skema -> versi dikunci di `package.json`; jalankan generator skema Better Auth lalu bandingkan sebelum upgrade.
- Kehilangan `DEVICE_SECRET_KEY` -> simpan di password manager owner proyek; nilai kunci layar memang bersifat sementara (dihapus saat diambil).
