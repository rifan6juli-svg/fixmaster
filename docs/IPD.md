# IPD - Fixmaster

> Versi: 0.2 | Diperbarui: 2026-10-30 | Merujuk: PRD, TRD, AFD, DBD, BSD

## Cara memakai
Kerjakan **satu langkah per sesi**, berurutan (`/vibe-docs build`). Centang `[x]` hanya jika kriteria "Selesai jika" terbukti lolos. Jangan mengerjakan fitur di luar langkah yang aktif. Setiap langkah yang menambah service wajib menyertakan tes isolasi dua tenant (TRD bagian 4).

## Ringkasan Fase
Tanpa deadline; estimasi dalam jam kerja (solo + AI).
| Fase | Tujuan | Langkah | Estimasi |
|---|---|---|---|
| 1 | Fondasi | 1-6 | ~14 jam |
| 2 | Alur inti | 7-16 | ~26 jam |
| 3 | Fitur pendukung | 17-22 | ~16 jam |
| 4 | Polesan & rilis | 23-28 | ~14 jam |

## Fase 1 - Fondasi

- [x] **1. Setup proyek**
  - Rujukan: TRD bagian 1, 3, 4, 6, 7
  - Kerjakan: inisialisasi Next.js 16 (TypeScript, App Router, Tailwind 4, ESLint, `src/`) dengan pnpm; TS `strict` + `noUncheckedIndexedAccess`; Prettier; Vitest + 1 tes contoh; Playwright + 1 smoke test; script `dev`, `build`, `start`, `lint`, `format`, `typecheck`, `test`, `test:e2e`; struktur folder TRD bagian 3; `.env.example`; `.gitignore` (termasuk `.data/`); workflow GitHub Actions (lint, typecheck, test, build); commit pertama.
  - Selesai jika: `pnpm dev` menampilkan halaman awal di `localhost:3000`; `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e` lolos.

- [x] **2. Token desain, font, aset brand & PWA**
  - Rujukan: DBD bagian 2, 3, 6; TRD bagian 1, 3
  - Kerjakan: token semantik terang/gelap + token maskot di `src/styles/globals.css` dan dipetakan ke Tailwind; IBM Plex Sans/Mono via `next/font`; inisialisasi shadcn/ui dan beri token: Button, Input, Label, Badge (8 status), Card, Dialog, Toast, Skeleton, Readout; salin aset `brand/` ke `public/` sesuai DBD bagian 6; `src/components/brand/mascot.tsx` (dari `brand/Mascot.tsx`, logika tidak diubah) dan `logo.tsx`; `src/app/manifest.ts` + ikon di metadata; halaman `/dev/ui` (hanya development) yang menampilkan semua komponen dan maskot.
  - Selesai jika: Playwright screenshot `/dev/ui` dalam `prefers-color-scheme` light dan dark tersimpan dan diperiksa; `/manifest.webmanifest` berisi nama "Fixmaster" dan 4 ikon (2 `any`, 2 `maskable`); `/dev/ui` mengembalikan 404 di build production; lint & build lolos.

- [ ] **3. Database & skema**
  - Rujukan: BSD bagian 1-4, 7; TRD bagian 2, 4, 6, 9
  - Kerjakan: pasang Drizzle ORM, drizzle-kit, `@electric-sql/pglite`, `postgres`; `src/server/db/client.ts` (driver dipilih dari prefix `DATABASE_URL`, singleton di `globalThis`); skema semua tabel + enum (termasuk tabel Better Auth sesuai BSD); `pnpm db:generate`, `scripts/migrate.ts` (`pnpm db:migrate`), `pnpm db:reset`; helper tes `createTestDb()` (PGlite in-memory + migrasi); `serverExternalPackages` di `next.config.ts`.
  - Selesai jika: `pnpm db:reset` membuat database dari nol tanpa error; tes integrasi lolos: semua tabel ada, CHECK `lock_secret_enc`, CHECK `super_admin`/`tenant_id`, dan unique owner per toko menolak data yang melanggar.

- [ ] **4. Autentikasi & registrasi toko**
  - Rujukan: F-01, S-01, S-02, TRD bagian 5, BSD tabel `users`/`sessions`/`accounts` dan aksi `registerShop`
  - Kerjakan: konfigurasi Better Auth (adapter Drizzle, `generateId: "uuid"`, `usePlural`, `additionalFields`, sesi 7 hari, rate limit penyimpanan database); `/api/auth/[...all]`; S-01 + `registerShop` (transaksi tenant + owner + account); S-02 login + logout; `getTenantContext()` dan `requireRole()` di `src/server/auth/`; guard layout `(app)`; `scripts/seed.ts` (`pnpm db:seed`) berisi data BSD bagian 7 (tiket seed tanpa kunci layar dulu).
  - Selesai jika: E2E: daftar toko baru -> tiba di `/dashboard`; tamu membuka `/dashboard` -> `/login`; password salah -> pesan F-01. Integrasi: `registerShop` membuat 1 tenant + 1 owner dengan `trial_ends_at` = +14 hari; `EMAIL_TAKEN`; user nonaktif ditolak login; login `owner@demo.test` dari seed berhasil.

- [ ] **5. App shell & navigasi per peran**
  - Rujukan: AFD bagian 2 dan 5; DBD bagian 3 (Navigasi, EmptyState), 4; F-02 (akses halaman)
  - Kerjakan: layout `(app)` dengan sidebar (>= 1024px), rail (640-1023px), bottom bar + sheet (< 640px) sesuai peran; header logo + menu user; redirect `super_admin` ke `/admin`; guard halaman owner-only dengan toast; `not-found.tsx` dan `error.tsx` dengan maskot; kerangka S-04 dengan state "pertama kali".
  - Selesai jika: E2E per peran (user seed): item menu sesuai AFD bagian 2; teknisi membuka `/reports` -> kembali ke `/dashboard` + pesan; tidak ada scroll horizontal di 390px dan 1280px; halaman 404 menampilkan maskot.

- [ ] **6. Staf & ganti password**
  - Rujukan: F-02, S-15, S-03, BSD aksi `createStaff`, `setStaffActive`, `resetStaffPassword`, `changePassword`
  - Kerjakan: S-15 (daftar + dialog tambah/reset/nonaktifkan); pembuatan akun staf server-side (TRD bagian 5); S-03 wajib saat `must_change_password`; cabut sesi saat staf dinonaktifkan.
  - Selesai jika: E2E: owner membuat teknisi -> teknisi login -> diarahkan ke S-03 -> ganti password -> S-04; teknisi dinonaktifkan -> request berikutnya diarahkan ke `/login`. Integrasi: `EMAIL_TAKEN`, `CANNOT_DEACTIVATE_SELF`, owner toko lain -> `NOT_FOUND`.

## Fase 2 - Alur Inti

- [ ] **7. Pelanggan**
  - Rujukan: F-03, S-10, S-11, BSD tabel `customers`, aksi `searchCustomers`, `saveCustomer`
  - Kerjakan: `src/lib/phone.ts` (normalisasi ke `62...`); service pelanggan; S-10 (daftar, cari, paginasi 25); S-11 (detail, ubah, riwayat tiket).
  - Selesai jika: unit: `0812-3456-7890`, `+62 812 3456 7890`, `812345678` dinormalisasi benar dan input tidak valid ditolak; integrasi: `PHONE_TAKEN`, isolasi tenant; E2E: ubah data pelanggan seed di S-11.

- [ ] **8. Form terima unit**
  - Rujukan: F-03, S-06, AFD F-03, BSD tabel `tickets`/`payments`/`ticket_events`, aksi `createTicket`, TRD bagian 5 (enkripsi), DBD (SignaturePad, Combobox, Checkbox group)
  - Kerjakan: `src/server/crypto/device-secret.ts`; service `createTicket` dalam satu transaksi (pelanggan baru, nomor urut, token, tiket, DP, event `created`); form S-06; redirect ke kerangka S-07 dengan panel sukses; tambah 2 tiket berkunci layar ke seed.
  - Selesai jika: unit: enkripsi round-trip, ciphertext berbeda untuk input sama, kunci salah gagal; integrasi: nomor tiket berurutan dan independen di 2 toko, `lock_secret_enc` tidak berisi plaintext, DP tercatat di `payments`, tanda tangan kosong ditolak saat `require_signature = true` dan diterima saat `false`; E2E: isi form lengkap + tanda tangan -> S-07 menampilkan nomor `SRV-xxxxx`; submit kosong menampilkan error per field.

- [ ] **9. Cetak tanda terima + QR**
  - Rujukan: S-08, F-03, F-08 (QR), DBD halaman cetak, TRD bagian 1 (`qrcode`)
  - Kerjakan: `/print/receipt/[id]` untuk `thermal_58`, `thermal_80`, `a4` (isi: toko, nomor, tanggal, pelanggan, unit, keluhan, kelengkapan, kondisi, DP, syarat, tanda tangan atau keterangan "Tanpa tanda tangan pelanggan", QR + link status); dialog cetak otomatis; tombol di S-07.
  - Selesai jika: E2E: ketiga format ter-render dengan link `{APP_URL}/s/{token}` yang benar dan elemen QR ada; screenshot cetak (emulasi media print) 58 mm dan A4 tersimpan dan diperiksa.

- [ ] **10. Daftar tiket & penugasan**
  - Rujukan: F-04, S-05, S-07, AFD F-04, BSD bagian 5, aksi `assignTicket`, `claimTicket`, [ASUMSI A-13]
  - Kerjakan: S-05 (tab per peran, filter status/teknisi, cari nomor/nama/WA, paginasi; tabel desktop, kartu mobile); tata letak lengkap S-07 (readout nomor, badge, unit, pelanggan, penugasan); assign (owner/admin) dan claim (teknisi, hanya jika `technicians_can_claim`) dengan cek `updatedAt`.
  - Selesai jika: integrasi: klaim nonaktif -> teknisi hanya melihat tiket miliknya dan `claimTicket` -> `CLAIM_DISABLED`; klaim aktif -> teknisi juga melihat tiket belum ditugaskan dan bisa klaim, klaim kedua -> `ALREADY_ASSIGNED`; `CONFLICT`; isolasi tenant; E2E: admin menugaskan teknisi -> tiket muncul di "Tiket saya" teknisi.

- [ ] **11. Status, diagnosa, catatan, timeline & kunci layar**
  - Rujukan: F-04, BSD bagian 4 (transisi), aksi `changeStatus`, `updateDiagnosis`, `addNote`, `revealLockSecret`
  - Kerjakan: `src/server/services/ticket-status.ts` (matriks transisi + syarat); tombol aksi status sesuai peran; dialog batal dengan alasan; diagnosa & catatan; timeline; "Lihat kunci layar" (tampil 30 detik, event `secret_viewed`).
  - Selesai jika: unit: setiap pasangan status x peran di BSD bagian 4 diuji (diizinkan lolos, lainnya `INVALID_TRANSITION`/`FORBIDDEN`); integrasi: admin dan teknisi lain mendapat `FORBIDDEN` saat membuka kunci layar, `secret_viewed` tercatat; E2E: teknisi `received` -> `diagnosing` + isi diagnosa -> timeline menampilkan event tersebut.

- [ ] **12. Halaman status publik & tombol WhatsApp**
  - Rujukan: F-08, S-18, AFD F-08 dan bagian 5 (template), BSD bagian 5 (Publik), aksi `buildWaLink`
  - Kerjakan: S-18 (header chamfer, readout, timeline publik, IMEI disamarkan, tombol WA toko, `noindex`, kedaluwarsa 60 hari setelah garansi berakhir, 404 generik); `src/lib/wa.ts` + 4 template; menu "Kirim WA" di S-07 dengan aturan aktif per status; event `wa_opened`.
  - Selesai jika: unit: `link_expires_at` benar untuk garansi 30 hari, garansi 0, dan tiket dibatalkan; teks keempat template sama persis dengan AFD bagian 5 (termasuk varian tanpa garansi) dan ter-URL-encode; integrasi: data publik tidak memuat kunci layar, catatan internal, nama teknisi, atau IMEI penuh; token salah -> tidak ditemukan; E2E: `/s/{token}` seed terbuka tanpa login.

- [ ] **13. Item biaya & diskon**
  - Rujukan: F-05, BSD tabel `ticket_items`, aksi `addItem`/`updateItem`/`removeItem`/`setDiscount`
  - Kerjakan: bagian "Biaya" di S-07: item jasa, item part non-stok, ubah/hapus, diskon, subtotal/total; aturan `ITEMS_LOCKED`; akses teknisi pada tiket miliknya.
  - Selesai jika: unit: perhitungan subtotal, diskon, total; integrasi: `DISCOUNT_TOO_LARGE`, `ITEMS_LOCKED`, teknisi lain `FORBIDDEN`, isolasi tenant; E2E: tambah 2 item + diskon -> total tampil benar dalam format Rupiah.

- [ ] **14. Persetujuan estimasi**
  - Rujukan: F-05, AFD F-05, BSD bagian 4, aksi `changeStatus`, `recordManualApproval`, `respondEstimate`
  - Kerjakan: tombol "Minta persetujuan"; bagian estimasi + Setujui/Tolak (dialog konfirmasi) di S-18; dialog persetujuan manual; banner `ESTIMATE_EXCEEDED` + "Minta persetujuan ulang" di S-07.
  - Selesai jika: integrasi: `respondEstimate` hanya berhasil sekali (kedua kali `NOT_AWAITING`), nilai persetujuan tersimpan, tolak -> `cancelled` dengan alasan default, `ready` ditolak jika total > disetujui; E2E (2 context browser): admin minta persetujuan -> pelanggan menyetujui di S-18 -> S-07 berstatus "Dikerjakan" dengan event "disetujui via link".

- [ ] **15. Pembayaran**
  - Rujukan: F-07, BSD tabel `payments`, aksi `recordPayment`
  - Kerjakan: dialog "Catat pembayaran" (payment/refund, metode, jumlah); daftar pembayaran; readout total/dibayar/sisa di S-07; ringkasan bayar di S-18.
  - Selesai jika: unit: perhitungan sisa termasuk refund; integrasi: jumlah <= 0 -> `VALIDATION`, isolasi tenant; E2E: DP + pelunasan -> sisa `Rp 0`.

- [ ] **16. Nota, cetak nota & pengambilan unit**
  - Rujukan: F-07, S-09, BSD bagian 4 (`ready`/`cancelled` -> `picked_up`), aksi `createInvoice`, `reopenInvoice`, `changeStatus`
  - Kerjakan: buat nota (nomor urut, item terkunci); buka kunci nota (owner); `/print/invoice/[id]` 3 format; "Tandai sudah diambil" dengan `BALANCE_DUE`/`INVOICE_REQUIRED`; hapus kunci layar saat `picked_up`; garansi di S-18.
  - Selesai jika: integrasi: nomor `INV` berurutan per toko dan tetap setelah dibuka ulang; `picked_up` ditolak saat sisa > 0; `lock_secret_enc` NULL setelah `picked_up`; E2E: `ready` -> nota -> lunas -> diambil -> S-18 menampilkan "Garansi sampai {tanggal}".

## Fase 3 - Fitur Pendukung

- [ ] **17. Katalog sparepart & mutasi stok**
  - Rujukan: F-06, S-12, S-13, BSD tabel `parts`/`stock_movements`, aksi `savePart`, `stockIn`, `adjustStock`
  - Kerjakan: S-12 (daftar, cari, filter stok menipis); S-13 (detail, ubah, stok masuk, penyesuaian, riwayat); tampilan teknisi tanpa harga modal.
  - Selesai jika: integrasi: `parts.stock` = Σ `qty_change` setelah rangkaian operasi; `SKU_TAKEN`; penyesuaian di bawah 0 -> `INSUFFICIENT_STOCK`; hasil query teknisi tidak memuat `cost_price`; isolasi tenant; E2E: tambah part + stok masuk 5 -> stok 5.

- [ ] **18. Pemakaian part dari stok pada tiket**
  - Rujukan: F-06, [ASUMSI A-14], BSD bagian 4 (efek `cancelled`), aksi `addItem`/`updateItem`/`removeItem`
  - Kerjakan: "Tambah part dari stok" (combobox dengan sisa stok) di S-07; pengurangan/pengembalian stok + `stock_movements` dalam transaksi yang sama; opsi part non-stok saat stok kurang; efek batal mengembalikan semua part.
  - Selesai jika: integrasi: tambah qty 2 -> stok -2 (`ticket_use`); ubah 2 -> 3 -> stok -1 lagi; hapus -> stok kembali; batal tiket -> semua part kembali; `INSUFFICIENT_STOCK`; dua transaksi bersamaan tidak membuat stok negatif; E2E: part dari stok muncul di item dan stok di S-12 berkurang.

- [ ] **19. Dashboard**
  - Rujukan: F-09, S-04, AFD F-09
  - Kerjakan: service agregasi; kartu angka yang bisa diklik ke S-05/S-12 terfilter; tampilan per peran.
  - Selesai jika: integrasi dengan fixture tetap: angka per status, lewat target, `ready` > 7 hari, stok menipis, pendapatan hari ini (zona waktu toko) sesuai harapan; teknisi hanya melihat tiket miliknya; E2E: klik kartu -> S-05 terfilter.

- [ ] **20. Laporan**
  - Rujukan: F-09, S-14
  - Kerjakan: pemilih rentang (preset), tabel pendapatan per hari & metode, tiket selesai per teknisi, part terpakai; pengelompokan tanggal sesuai zona waktu toko.
  - Selesai jika: integrasi dengan fixture tetap: angka ketiga tabel sesuai harapan, termasuk refund dan pembayaran di batas tengah malam WIB/WIT; rentang > 366 hari ditolak; admin/teknisi diarahkan ke S-04.

- [ ] **21. Pengaturan toko**
  - Rujukan: F-10, S-16, aksi `updateSettings`
  - Kerjakan: form pengaturan + pratinjau nomor tiket dan syarat servis; switch "Wajib tanda tangan pelanggan" dan "Teknisi boleh mengambil tiket sendiri".
  - Selesai jika: integrasi: prefix tidak valid -> `VALIDATION`; tiket baru memakai prefix baru, nomor lama tetap; `print_format` dipakai S-08/S-09; mematikan wajib tanda tangan membuat S-06 menerima tiket tanpa tanda tangan; menyalakan klaim menampilkan tab "Belum ditugaskan" bagi teknisi; E2E: simpan pengaturan -> toast tersimpan.

- [ ] **22. Langganan & panel super-admin**
  - Rujukan: F-11, [ASUMSI A-02, A-03], S-17, S-19, S-20, BSD tabel `tenants`/`subscription_logs`, aksi `extendSubscription`, `resetOwnerPassword`
  - Kerjakan: `getSubscriptionStatus()`; guard `SUBSCRIPTION_EXPIRED` di `createTicket`, `createStaff`, `savePart` (baru); banner; S-17 (harga, nominal + kode unik toko, rekening) dengan konfigurasi `src/config/billing.ts`; `scripts/create-super-admin.ts` (`pnpm admin:create`); S-19 (dengan kolom kode unik), S-20.
  - Selesai jika: unit: status di batas waktu tepat, nominal transfer = harga + `billing_code` (mis. 99.000 + 123 = Rp 99.123); integrasi: toko `expired` tidak bisa membuat tiket tetapi masih bisa `changeStatus` dan `recordPayment`; perpanjangan tercatat di `subscription_logs`; non-super-admin ke `/admin` ditolak; E2E: super-admin memperpanjang toko `expired` -> owner bisa membuat tiket lagi.

## Fase 4 - Polesan & Rilis

- [ ] **23. State kosong/loading/error semua layar** (AFD bagian 4)
  - Selesai jika: setiap baris AFD bagian 4 diverifikasi (E2E toko baru untuk state kosong, `loading.tsx` untuk loading, simulasi gagal untuk error) dan dicentang di catatan langkah.

- [ ] **24. Aksesibilitas, responsivitas & PWA** (DBD bagian 4-5)
  - Kerjakan: audit `@axe-core/playwright` semua layar utama di kedua mode warna; uji alur terima unit hanya dengan keyboard; cek lebar 360px; Lighthouse untuk S-04 dan S-18.
  - Selesai jika: 0 pelanggaran axe level serious/critical; tanpa scroll horizontal di 360px; Lighthouse mobile: installable dan LCP < 2,5 detik untuk S-04 dan S-18.

- [ ] **25. Audit isolasi tenant & keamanan**
  - Kerjakan: tes yang memanggil setiap Server Action dengan konteks toko B terhadap ID milik toko A; cek log tidak memuat PII/kunci layar; cek header keamanan; tes rate limit login; `pnpm audit`.
  - Selesai jika: 100% Server Action mengembalikan `NOT_FOUND`/`FORBIDDEN` lintas tenant; tidak ada temuan high/critical di `pnpm audit`; header TRD bagian 5 ada di respons.

- [ ] **26. Tes menyeluruh dan perbaikan bug**
  - Selesai jika: E2E alur lengkap (daftar -> terima unit -> estimasi via link -> part dari stok -> nota -> lunas -> diambil) lolos 3x berturut-turut di viewport mobile dan desktop; `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` lolos.

- [ ] **27. Migrasi ke Supabase**
  - Rujukan: TRD bagian 1, 6, 9; [ASUMSI A-11, A-12]
  - Kerjakan: buat project Supabase production dan project terpisah untuk tes (region Singapore); isi `DATABASE_URL` (pooler 6543, `prepare: false`) dan `DIRECT_URL`; `pnpm db:migrate`; jalankan tes integrasi terhadap project tes; jalankan app lokal yang terhubung ke Supabase; buat super-admin production.
  - Selesai jika: migrasi berjalan dari nol di Supabase; `pnpm test` lolos terhadap Postgres Supabase (project tes); app lokal + Supabase: daftar toko -> terima unit -> halaman status publik berjalan.

- [ ] **28. Deploy** (TRD bagian 6) dan cek asap di production
  - Kerjakan: project Vercel Hobby (region `sin1`) terhubung ke GitHub [ASUMSI A-12]; environment variable production; domain + `APP_URL`; deploy.
  - Selesai jika: di URL production: daftar toko, login, terima unit, cetak tanda terima, buka link status dari HP, dan install PWA di Android berhasil; log Vercel tanpa error.

## Definition of Done (berlaku untuk tiap langkah)
- [ ] Sesuai spesifikasi di dokumen yang dirujuk
- [ ] Tes relevan ditulis dan lolos (termasuk tes isolasi tenant untuk service baru); lint, typecheck & build lolos
- [ ] Tidak ada secret di kode; tidak ada `console.log`/debug tertinggal
- [ ] Dokumen diperbarui bila ada keputusan yang mengubah spesifikasi

## Risiko
| Risiko | Dampak | Mitigasi |
|---|---|---|
| PGlite terkunci saat dev server dan skrip DB berjalan bersamaan | Migrasi/seed gagal | Hentikan `pnpm dev` dulu (TRD bagian 6) |
| Perbedaan PGlite vs Postgres Supabase | Bug baru muncul saat migrasi | Hanya fitur Postgres standar; tes integrasi terhadap Supabase di langkah 27 |
| Kebocoran data lintas toko | Fatal untuk SaaS B2B | Pola `TenantContext`, tes isolasi per service, audit langkah 25 |
| Scope melebar (11 fitur P0) | Rilis molor | Patuhi "Di Luar Scope" PRD; ide baru dicatat di bawah, bukan dikerjakan |
| Printer thermal toko bervariasi | Cetakan terpotong | 3 format cetak + uji cetak ke PDF; pilot dengan printer nyata |
| Vercel Hobby untuk penggunaan non-komersial | Akun/proyek bisa dibatasi Vercel | Pindah ke Vercel Pro paling lambat saat toko pertama membayar (TRD bagian 9) |

## Catatan & Utang Teknis
<!-- Tambahkan: tanggal - langkah - catatan/keputusan -->
- 2026-10-30 - init - Dokumen dibuat. Aset brand disimpan di `brand/` (sumber); penulisan nama diselaraskan ke "Fixmaster" di `logo.svg`, `icon-maskable.svg`, dan komentar `Mascot.tsx`. `brand/icons.svg` adalah sprite ikon sosial template Vite, bukan identitas brand.
- 2026-10-30 - langkah 1 - Scaffold create-next-app 16.4.3 (Cache Components + Partial Prefetching aktif, Tailwind lewat loader Turbopack). `@playwright/test` dikunci 1.63.0 agar cocok dengan browser terpasang. `globals.css` dipindah ke `src/styles/`. `brand/` dan `.claude/` dikecualikan dari ESLint, tsc, dan Prettier. `AGENTS.md` dikelola `next dev` dan ikut di-commit.
- 2026-10-30 - langkah 2 - `ui.shadcn.com` diblokir jaringan environment cloud: komponen disalin dari GitHub `shadcn-ui/ui` (`new-york-v4`) dan kelasnya dipetakan ke token DBD (aturan di TRD bagian 4). Button md & Input dibuat 44px (DBD diperbarui agar sesuai target sentuh 44px). Nilai `ticket_status` + label UI ada di `src/lib/ticket-status.ts`; skema DB langkah 3 memakai array yang sama.
- 2026-10-30 - langkah 2 - UTANG: `Mascot.tsx` (logika asli brand) memicu hydration error jika pengguna mengaktifkan "kurangi animasi" (state awal dibaca dari `window` saat render). Perlu izin owner untuk mengubah logika maskot; jika tidak, tangani di langkah 24.
- 2026-10-30 - langkah 2 - UTANG: sonner 2.0.8 memakai `aria-live="polite"` untuk semua toast; DBD meminta toast error `assertive`. Tangani di langkah 24.
- 2026-10-30 - update - Asumsi dikonfirmasi user (PRD bagian 8). Perubahan: A-03 harga Rp 99.000/bulan atau Rp 990.000/tahun + kode unik transfer (`tenants.billing_code`); A-05 tanda tangan jadi pengaturan `require_signature` (default aktif); A-06 link berlaku 60 hari setelah garansi berakhir; A-12 Vercel Hobby dulu; A-13 klaim teknisi jadi pengaturan `technicians_can_claim` (default nonaktif).
