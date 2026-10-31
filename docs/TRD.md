# TRD - Fixmaster

> Versi: 0.8 | Diperbarui: 2026-10-31 | Merujuk: PRD.md

## 1. Tech Stack
| Lapisan | Pilihan | Alasan (1 kalimat) |
|---|---|---|
| Frontend | Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 | Pilihan user; satu bahasa untuk UI dan server, dan `brand/Mascot.tsx` langsung dipakai. |
| Komponen UI | shadcn/ui (Radix) + sonner (toast) + ikon lucide-react | Primitif aksesibel (dialog, select, combobox) yang kodenya disalin ke repo dan diberi token DBD. |
| Backend | Next.js Server Actions + Route Handlers, logika di `src/server/` | Tidak ada konsumen API eksternal, jadi tidak perlu server terpisah. |
| Database | **Supabase Postgres**: lokal via Supabase CLI + Docker Desktop, production hosted [ASUMSI A-18] | Pilihan user; mesin yang sama di semua environment, jadi tidak ada tahap migrasi database di akhir. |
| ORM/migrasi | Drizzle ORM 0.45 + drizzle-kit (file SQL di `drizzle/`) + driver `postgres` (postgres-js) | Query type-safe dengan satu driver di semua environment; pola resmi Drizzle untuk Supabase. |
| Auth | Better Auth 1.7 (email + password), adapter Drizzle | Akun tersimpan di tabel kita sendiri, jadi registrasi toko satu transaksi dan sesi bisa dicabut langsung. |
| Validasi | Zod 4 | Satu skema untuk validasi form dan Server Action. |
| Lainnya | `signature_pad` (tanda tangan), `qrcode` (QR status), `node:crypto` (AES-256-GCM) | Kecil, tanpa layanan eksternal. |
| Hosting/Deploy | Lokal dulu; production Vercel Hobby `sin1` (pindah ke Pro setelah bisnis menghasilkan) + Supabase region Singapore [ASUMSI A-12] | Gratis di awal dan latensi rendah untuk Indonesia; batasan Hobby di bagian 9. |
| Layanan pihak ketiga | WhatsApp via link `wa.me` (tanpa API) | Pilihan user; gratis dan tanpa risiko blokir nomor. |

Versi runtime & package manager: Node.js 22 LTS atau lebih baru, pnpm 10 (dikunci lewat `packageManager` di `package.json`). Test: Vitest 5, Playwright 1.63 (versi dikunci tepat; di mesin baru jalankan `pnpm exec playwright install chromium` sekali). Prasyarat pengembangan: Docker Desktop dan Supabase CLI 2.114 (terpasang global, di CI dikunci lewat `supabase/setup-cli`).

## 2. Arsitektur
Satu aplikasi Next.js monolit. Halaman memakai Server Components untuk membaca data dan Server Actions untuk menulis. Semua akses data lewat fungsi di `src/server/services/` yang menerima `TenantContext` (`tenantId`, `userId`, `role`) dari sesi, bukan dari input klien. Pelanggan mengakses `/s/{token}` tanpa login. Aplikasi terhubung ke Postgres lewat connection string dari server; klien tidak pernah mengakses database langsung.

```mermaid
flowchart LR
  Staf[Staf toko<br/>browser / PWA] -->|Server Actions| App[Next.js App Router<br/>Node runtime]
  Plg[Pelanggan<br/>/s/token] --> App
  App --> Auth[Better Auth<br/>/api/auth/*]
  App --> Svc[src/server/services<br/>scoped tenant_id]
  Auth --> DB[(Supabase Postgres<br/>lokal: CLI + Docker<br/>prod: hosted)]
  Svc --> DB
  Staf -. link wa.me .-> WA[WhatsApp]
```

Keputusan penting:
| Keputusan | Alternatif ditolak | Alasan |
|---|---|---|
| Cache Components + Partial Prefetching aktif (bawaan create-next-app 16.4) | Model caching lama | Default Next 16.4. Konsekuensi: data dinamis (sesi, DB) dibaca di dalam `<Suspense>`, dan **tidak boleh** ada export `runtime` di route. |
| Server Actions + service layer | REST API terpisah | Tidak ada klien lain; lebih sedikit kode dan type-safe end-to-end. |
| Isolasi tenant di lapisan aplikasi + tes wajib | RLS per tenant | RLS per tenant bergantung pada JWT Supabase Auth; kita memakai Better Auth dan koneksi server-side. RLS tetap diaktifkan tanpa policy, hanya untuk menutup akses Data API (bagian 5). |
| Better Auth | Supabase Auth | Toko, owner, dan akun dibuat dalam satu transaksi; menonaktifkan staf langsung berlaku (F-02), sedangkan access token Supabase bisa bertahan sampai kedaluwarsa; tanpa sinkronisasi `auth.users` ke `users`. |
| Drizzle + koneksi Postgres | `supabase-js` + Data API | Semua data lewat service di server; Data API tidak dipakai dan dimatikan di production. |
| Supabase lokal untuk dev & tes | PGlite, Supabase hosted untuk dev | Postgres sama dengan production, tes konkurensi nyata, gratis, dan tidak memakai jatah 2 project aktif tier Free. |
| Migrasi dimiliki Drizzle (`drizzle/`) | `supabase/migrations/` | Skema TypeScript tetap satu sumber kebenaran; folder `supabase/` hanya berisi konfigurasi lokal. |
| Tanda tangan disimpan sebagai teks SVG di DB | Object storage | Tidak ada upload file di MVP; data kecil (maks 50 KB). |
| Cetak via halaman HTML + CSS `@page` | Library PDF | Printer thermal & A4 cukup dengan dialog cetak browser. |
| Uang `bigint` Rupiah bulat | `numeric` / float | Rupiah tidak memakai desimal; bebas error pembulatan. |

## 3. Struktur Folder
```
brand/                    # aset brand asli (sumber kebenaran, jangan diedit tanpa izin)
docs/                     # PRD, TRD, AFD, DBD, BSD, IPD
drizzle/                  # file migrasi SQL hasil drizzle-kit (di-commit)
public/                   # favicon.svg, logo.svg, icons/*.png (disalin dari brand/)
scripts/                  # migrate.ts, seed.ts + seed-data.ts, create-super-admin.ts (dijalankan via tsx)
supabase/                 # config.toml Supabase lokal (tanpa migrasi; migrasi ada di drizzle/)
src/
  app/
    (auth)/               # login, register, change-password
    (app)/                # layout terproteksi + shell navigasi: dashboard, tickets, parts
      (front-desk)/       # layout requirePageRole owner + admin: tickets/new, customers
      (owner)/            # layout requirePageRole owner: reports, settings
    admin/                # panel super-admin (layout requireSuperAdmin)
    s/[token]/            # halaman status publik
    print/                # receipt/[id], invoice/[id]
    api/auth/[...all]/    # handler Better Auth
    manifest.ts           # PWA manifest
  config/                 # billing.ts (harga paket, rekening tujuan)
  components/
    ui/                   # primitif shadcn yang sudah diberi token DBD
    brand/                # mascot.tsx, logo.tsx
    app-shell/            # sidebar + rail, bottom bar, header, menu user, nav-items.ts (menu per peran)
    auth/ staff/ tickets/ customers/ parts/ ...   # komponen per fitur
    call-action.ts        # memanggil Server Action dari klien (toast + redirect)
  lib/                    # util murni yang aman untuk klien: money.ts, phone.ts, wa.ts, dates.ts, logger.ts,
                          # safe-next.ts, user-role.ts, action-result.ts, auth-client.ts, validation/*.ts (skema Zod)
  server/
    db/                   # client.ts, url.ts (pengaman host lokal), schema/*.ts
    auth/                 # auth.ts (konfigurasi Better Auth), context.ts, guards.ts
    services/             # accounts.ts, shops.ts, staff.ts, tickets.ts, customers.ts, parts.ts, payments.ts, reports.ts, ...
    actions/              # Server Actions (tipis: validasi -> service), result.ts (toActionResult)
    crypto/               # device-secret.ts
    errors.ts             # AppError (kode error BSD bagian 6)
  proxy.ts                # guard cepat: tamu ke /login?next={path} sebelum render
  styles/globals.css      # token DBD (CSS variables) + Tailwind
tests/
  unit/  integration/  e2e/  helpers/
```

## 4. Konvensi Kode
- Bahasa & mode ketat: TypeScript `strict` + `noUncheckedIndexedAccess`.
- Penamaan: file `kebab-case.ts(x)`; komponen `PascalCase`; tabel & kolom DB `snake_case` jamak; properti TS `camelCase` (dipetakan Drizzle); route URL bahasa Inggris; teks UI Bahasa Indonesia.
- Akses data: hanya `src/server/**` yang boleh mengimpor `src/server/db`. Setiap fungsi service menerima `ctx: TenantContext` sebagai argumen pertama dan selalu memfilter `tenant_id = ctx.tenantId`. `tenant_id` **tidak pernah** diambil dari input klien. Setiap service baru wajib punya tes isolasi dua tenant.
- Validasi input: skema Zod di `src/lib/validation/` (dipakai form dan Server Action), dijalankan `parseInput()` di setiap Server Action sebelum memanggil service.
- Form: memakai `<form action={fn}>` + `useActionState`, bukan `onSubmit`, agar React menahan submit sebelum hidrasi dan browser tidak pernah mengirim form sendiri (tanpa ini password bisa masuk URL). Nilai dikembalikan lewat state ke `defaultValue` karena React mereset form setelah action. Client Component menerima Server Action sebagai prop dari halaman, bukan mengimpornya, dan memanggilnya lewat `callAction()`: Server Action yang `redirect()` membuat promise di klien gagal, jadi `catch` biasa akan salah melapor "Koneksi terputus".
- Penanganan error: Server Action mengembalikan `ActionResult<T>` = `{ ok: true, data }` atau `{ ok: false, error: { code, message, fields? } }` lewat `toActionResult()`; service melempar `AppError`, kode error mengikuti BSD bagian 6. Error tak terduga dicatat lewat `logger.error` (nama + kode saja, pesan Drizzle memuat parameter query) dan ditampilkan sebagai "Terjadi kesalahan, coba lagi."
- Konkurensi: update tiket menyertakan `updated_at` yang dibaca klien; jika tidak cocok kembalikan `CONFLICT`.
- Transaksi: di dalam `db.transaction()` semua query wajib memakai `tx`, bukan `db` (dengan `max: 1` query lewat `db` akan menggantung). Jangan memakai fitur sesi Postgres (`SET`, advisory lock sesi, `LISTEN`) karena tidak didukung pooler mode transaction.
- Uang: integer Rupiah; format dengan `formatRupiah()` di `src/lib/money.ts`. Tanggal: simpan `timestamptz` (UTC), tampilkan dengan zona waktu toko via `Intl.DateTimeFormat('id-ID')`.
- Komponen UI: primitif ada di `src/components/ui/`, berbasis shadcn `new-york-v4` (Radix). Menambah komponen baru: `pnpm dlx shadcn add <nama>`, atau salin dari `apps/v4/registry/new-york-v4/ui/` di repo GitHub `shadcn-ui/ui` jika `ui.shadcn.com` tidak bisa diakses. Setelah itu kelas diganti ke token DBD: `bg-background`/`bg-card` -> `bg-background`/`bg-surface`; `bg-popover` -> `bg-surface-raised`; `bg-accent`/`bg-muted`/`bg-secondary` -> `bg-surface-sunken` (**`accent` di DBD = teal info, bukan warna hover**); `text-foreground` -> `text-text`; `text-muted-foreground` -> `text-text-muted`; `text-primary-foreground` -> `text-on-primary`; `border-input` -> `border-border-strong`; `destructive` -> `danger`. Hapus `outline-none`/`ring-*` fokus (fokus global di `globals.css`), dan jangan biarkan CLI mengubah token di `globals.css`.
- Lint/format: ESLint (`eslint-config-next`) + Prettier -> `pnpm lint`, `pnpm format`; cek tipe `pnpm typecheck`.
- Dilarang: `any`; SQL mentah dengan konkatenasi string (pakai query builder atau template `sql`); secret di kode; `console.log` di kode yang di-commit (pakai `logger`); mengimpor modul server dari Client Component; mencatat atau mengembalikan nilai kunci layar selain lewat aksi `revealLockSecret`.

## 5. Keamanan
- Autentikasi: Better Auth email + password (hash bawaan scrypt), cookie sesi `httpOnly`, `secure` (dari `BETTER_AUTH_URL` https), `sameSite=lax`; sesi 7 hari, diperpanjang otomatis jika aktif. Render halaman tidak bisa menulis cookie, jadi `SessionRefresher` di layout `(app)` memanggil `/api/auth/get-session` saat halaman dimuat. Rate limit bawaan Better Auth dengan penyimpanan database (PRD F-01); login lewat klien ke `/api/auth/sign-in/email` karena `auth.api` di server tidak terkena rate limit.
- Rute Better Auth yang dibuka hanya sign-in, sign-out, dan sesi: `disableSignUp` aktif, `/update-user` dan `/change-password` ada di `disabledPaths`, dan semua `additionalFields` memakai `input: false`.
- Akun dibuat server-side lewat `insertUserWithLogin()`: insert `users` + `accounts` (provider `credential`, `account_id` = id user) dalam satu transaksi, password di-hash dengan `hashPassword` dari `better-auth/crypto` sebelum transaksi dibuka.
- `must_change_password`: `getTenantContext()` dan `requireSuperAdmin()` menahan user di `/change-password`, jadi halaman dan Server Action sama-sama tertutup sampai password diganti. `changePassword` memakai `getSessionUser()` yang tidak menahan. Setelah berhasil, form memuat ulang halaman penuh (`window.location.assign`): router klien menyimpan redirect `/dashboard` -> S-03 dan memutarnya ulang tanpa bertanya ke server, dan `refresh()` maupun `redirect()` dari Server Action tidak membersihkannya. Perubahan lain yang mengubah hasil guard untuk halaman yang sudah pernah dibuka harus mengikuti pola ini. Menonaktifkan staf dan mereset password mencabut semua sesinya dalam transaksi yang sama.
- Layout yang dipakai bersama tidak dirender ulang saat navigasi di klien, jadi guard di layout saja tidak cukup: setiap halaman yang membaca data dan setiap Server Action wajib memanggil `getTenantContext()` sendiri.
- Otorisasi: `requireRole(ctx, roles)` di setiap Server Action; matriks lengkap di BSD bagian 5. `getTenantContext()` (sesi di database, cek `is_active`) adalah pemeriksaan sebenarnya, dipanggil layout `(app)` di dalam `<Suspense>` dan setiap Server Action. `src/proxy.ts` hanya melihat keberadaan cookie agar tamu mendapat redirect 307 dengan `?next=` sebelum render; layout tidak bisa membaca path. Hasil sesi tidak di-cache (`use cache: private` dilarang di sini) agar penonaktifan staf langsung berlaku. Akses halaman per peran memakai `requirePageRole(roles)` di layout route group `(owner)`/`(front-desk)`, jadi halaman baru di dalamnya otomatis terlindungi; peran lain diarahkan ke `/dashboard?denied=1` dan `AccessDeniedToast` menampilkan pesan AFD bagian 5. `admin/` hanya untuk `super_admin` (`requireSuperAdmin()`), dan `getTenantContext()` mengarahkan `super_admin` ke `/admin`.
- Data sensitif: `tickets.lock_secret_enc` dienkripsi AES-256-GCM dengan kunci `DEVICE_SECRET_KEY` (32 byte, base64), format `v1:{iv}:{tag}:{ciphertext}`. Token status publik = 16 byte acak (`base64url`, 22 karakter).
- Header: `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`; halaman `/s/*` dan `/print/*` diberi `noindex`.
- Secrets: lewat environment variable, daftar di `.env.example`.
- Supabase: aplikasi terhubung sebagai role `postgres` (pemilik tabel, tidak terkena RLS). Semua tabel `public` memakai RLS tanpa policy (`.enableRLS()` di skema Drizzle), sehingga `anon` dan `authenticated` tidak mendapat baris apa pun. Data API dimatikan di project production. API key Supabase (anon/publishable, service role) tidak dipakai dan tidak disimpan.
- Pengaman data: `createTestDb()`, `pnpm db:seed`, dan `pnpm db:reset` hanya berjalan terhadap Postgres lokal (`127.0.0.1`/`localhost`); host lain ditolak.

## 6. Environment & Deploy
| Env | Tujuan | Catatan |
|---|---|---|
| local | pengembangan | Supabase lokal (`pnpm db:start`, Docker Desktop harus menyala); `pnpm db:reset` untuk mulai bersih. Studio di `http://localhost:54323`. |
| test | Vitest & Playwright | Vitest: satu database per file tes, disalin dari database template yang sudah dimigrasikan, di Supabase lokal. Playwright: `pnpm build && pnpm start` terhadap database `fixmaster_e2e` di Supabase lokal (dibuat ulang, migrasi, seed di global setup), 1 worker karena Chromium paralel menghabiskan CPU mesin 4 thread sampai server macet (IPD langkah 4). |
| production | pengguna nyata | Vercel Hobby (`sin1`), lalu Pro setelah bisnis menghasilkan, + Supabase hosted Singapore; dibuat di IPD langkah 27 [ASUMSI A-11, A-12]. |

Variabel lingkungan (`.env.example`):
| Nama | Contoh lokal | Keterangan |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | Lokal: Supabase lokal. Production: shared pooler mode transaction (`aws-[INDEX]-[REGION].pooler.supabase.com:6543`, user `postgres.[PROJECT-REF]`, SSL wajib). Klien selalu `prepare: false`; `max: 1` di production. |
| `DIRECT_URL` | (kosong) | Hanya production, untuk migrasi: koneksi langsung `db.[PROJECT-REF].supabase.co:5432` (IPv6), atau shared pooler mode session port 5432 jika jaringan hanya IPv4. Kosong -> migrasi memakai `DATABASE_URL`. |
| `BETTER_AUTH_SECRET` | string acak 32+ karakter | Wajib untuk `pnpm dev` dan `pnpm start` (production menolak jalan tanpa ini). Tes Vitest memakai nilai bawaan Better Auth, jadi CI tidak butuh secret ini. |
| `BETTER_AUTH_URL` / `APP_URL` | `http://localhost:3000` | `APP_URL` dipakai untuk link status `{APP_URL}/s/{token}`. |
| `DEVICE_SECRET_KEY` | base64 32 byte | Kunci enkripsi kunci layar; kehilangan kunci = data kunci layar tidak bisa dibaca. |

Catatan Supabase lokal: nyalakan Docker Desktop lalu `pnpm db:start` sebelum `pnpm dev`, `pnpm test`, atau skrip database. `supabase/config.toml` mematikan layanan yang tidak dipakai (auth, storage, realtime, edge functions, analytics, email) dan menyamakan versi Postgres dengan production. Klien database disimpan di `globalThis` agar HMR tidak membuka koneksi ganda.

CI/CD: GitHub Actions menjalankan `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` pada setiap push/PR; sebelum `pnpm test`, `supabase/setup-cli` memasang CLI dan `supabase db start` menyalakan Postgres lokal, sehingga CI tidak butuh secret database. Deploy production via integrasi Git Vercel (IPD langkah 28).

## 7. Strategi Testing
- Unit (Vitest): fungsi murni di `src/lib/` dan aturan domain: normalisasi nomor WA, format Rupiah, matriks transisi status, total & sisa bayar, builder link WA, enkripsi kunci layar (round-trip + ciphertext berbeda tiap kali).
- Integrasi (Vitest + Supabase lokal, helper `createTestDb()`, yang juga memasang database itu sebagai hasil `getDb()` sehingga service dan Better Auth dites tanpa parameter database): service dengan database nyata, termasuk penomoran tiket/nota per toko, mutasi stok, transaksi bersamaan, aturan pengambilan unit, angka laporan, dan **isolasi dua tenant** untuk setiap service. Rute `/api/auth/*` dites lewat `getAuth().handler()`, jadi rate limiter ikut berjalan.
- E2E (Playwright, Chromium, viewport 390x844 dan 1280x800): registrasi -> terima unit -> estimasi disetujui via link -> nota -> lunas -> diambil; akses per peran; halaman status publik.
- Aksesibilitas: `@axe-core/playwright` di E2E (IPD langkah 24); performa: Lighthouse preset mobile.
- Perintah standar: `pnpm test`, `pnpm test:e2e`, `pnpm lint`, `pnpm typecheck`, `pnpm build`.

## 8. Non-Fungsional Teknis
- Performa: Server Components secara default; Client Component hanya untuk interaksi (form, tanda tangan, dialog). Daftar dipaginasi 25 baris. JS per rute <= 200 KB (gzip). Indeks sesuai BSD.
- Skala awal: hingga 100 toko x 300 tiket/bulan [ASUMSI A-01], cukup untuk satu instance Supabase tier awal.
- Observability: `src/lib/logger.ts` menulis log JSON (level, pesan, `tenantId`, `userId`, tanpa data pribadi/kunci layar) ke stdout -> log Vercel. Halaman `error.tsx` dan `not-found.tsx` khusus.

## 9. Risiko Teknis
- Supabase lokal butuh Docker Desktop -> jika menyala terlambat, `pnpm test` dan `pnpm dev` gagal terhubung; nyalakan dulu lalu `pnpm db:start`.
- Supabase lokal berbeda dari hosted -> versi Postgres disamakan di `config.toml`; cek asap terhadap project hosted di IPD langkah 27.
- Tabel `public` terjangkau Data API jika punya grant dan RLS mati -> sejak 30 Okt 2026 Supabase tidak lagi memberi grant otomatis ke tabel baru, tetapi kita tetap mengaktifkan RLS di migrasi dan mematikan Data API (bagian 5), dan tes memastikan tidak ada tabel tanpa RLS.
- Koneksi berlebih dari serverless ke Supabase -> shared pooler mode transaction (port 6543) dengan `prepare: false` dan `max: 1`.
- Koneksi langsung Supabase hanya IPv6 pada tier Free dan Pro -> Vercel memakai pooler; migrasi dari jaringan IPv4 memakai pooler mode session (bagian 6).
- Pembaruan Better Auth mengubah skema -> versi dikunci di `package.json`; jalankan generator skema Better Auth lalu bandingkan sebelum upgrade.
- Rate limit login membaca IP dari `x-forwarded-for`; header berisi lebih dari satu IP tanpa `advanced.ipAddress.trustedProxies` jatuh ke satu kuota bersama semua pengguna -> Vercel mengirim satu IP, dan ini dicek saat deploy (IPD langkah 28).
- Vercel Hobby hanya untuk penggunaan non-komersial dan kuotanya lebih kecil [ASUMSI A-12] -> pindah ke Vercel Pro paling lambat saat toko pertama membayar langganan; pantau pemakaian di dashboard Vercel.
- Supabase tier Free dibatasi 2 project aktif dan 500 MB, menjeda project setelah 7 hari tanpa aktivitas, dan tidak menyertakan backup otomatis -> naik ke tier Pro bersamaan dengan Vercel Pro, atau sementara jalankan `pg_dump` terjadwal.
- Kehilangan `DEVICE_SECRET_KEY` -> simpan di password manager owner proyek; nilai kunci layar memang bersifat sementara (dihapus saat diambil).
