# Fixmaster

SaaS B2B (web + PWA) untuk toko reparasi laptop, HP, dan elektronik: penerimaan unit, status servis, estimasi yang disetujui pelanggan lewat link, stok sparepart, nota & pembayaran.

## Dokumen Proyek (sumber kebenaran)
Baca sebelum bekerja. Jangan menebak jika dokumen tidak menjelaskan; tanyakan.

| Dokumen | Isi | Baca saat |
|---|---|---|
| `docs/PRD.md` | Fitur (F-xx), scope, kriteria penerimaan, daftar `[ASUMSI A-xx]` | Selalu |
| `docs/TRD.md` | Stack, struktur folder, konvensi kode | Menulis kode apa pun |
| `docs/AFD.md` | Layar (S-xx), alur pengguna, template WA | Mengerjakan UI/alur |
| `docs/DBD.md` | Warna, font, komponen, aksesibilitas, aset brand | Mengerjakan UI |
| `docs/BSD.md` | Skema database, transisi status, Server Action, aturan akses | Menyentuh data/API |
| `docs/IPD.md` | Daftar langkah kerja + status | Menentukan tugas berikutnya |

## Cara Bekerja
1. Kerjakan **satu langkah** dari `docs/IPD.md` per permintaan, berurutan dari yang belum dicentang (`/vibe-docs build`).
2. Jangan menambah fitur, library, atau refactor di luar langkah aktif atau di luar `Di Luar Scope` PRD. Catat ide di "Catatan & Utang Teknis" IPD.
3. Gunakan nama tabel, kolom, ID, dan rute persis seperti di dokumen.
4. Jika perlu mengubah spesifikasi, ubah dokumennya juga dan sebutkan perubahannya ke user (`/vibe-docs update`).
5. Sebelum menyatakan selesai: jalankan `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, dan cek "Selesai jika". Laporkan hasil apa adanya.
6. Centang langkah di IPD hanya setelah terbukti lolos.
7. Untuk pekerjaan UI, skill `impeccable` boleh dipakai, tetapi `docs/DBD.md` adalah sumber kebenaran token, komponen, dan aturan brand.
8. Next.js 16.4 berbeda dari versi lama: baca panduan terkait di `node_modules/next/dist/docs/` sebelum menulis kode Next (lihat `AGENTS.md`). Cache Components aktif, jadi data dinamis dibaca di dalam `<Suspense>` dan jangan menambah export `runtime`.

## Perintah
- Dev: `pnpm dev`
- Test: `pnpm test` (unit + integrasi), `pnpm test:e2e` (Playwright)
- Lint: `pnpm lint` | Cek tipe: `pnpm typecheck` | Format: `pnpm format`
- Build: `pnpm build`
- Database: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm db:reset` (hentikan `pnpm dev` dulu: PGlite hanya bisa dibuka satu proses)
- Super-admin: `pnpm admin:create`

(Perintah di atas dibuat di IPD langkah 1, 3, 4, dan 22.)

## Aturan Keras
- Jangan commit secret; gunakan environment variable (`.env.example` sebagai daftar).
- Jangan hapus atau timpa data/migrasi yang sudah ada tanpa konfirmasi; file di `drizzle/` tidak diubah setelah di-commit.
- Setiap akses data lewat `src/server/services/` dengan `TenantContext`; `tenant_id` tidak pernah dari input klien; setiap service baru punya tes isolasi dua tenant.
- Nilai kunci layar perangkat hanya dienkripsi/didekripsi di `src/server/crypto/` dan tidak pernah dicatat di log atau dikirim ke klien selain lewat `revealLockSecret`.
- Uang = integer Rupiah (`bigint`); waktu = `timestamptz` UTC, ditampilkan dengan zona waktu toko.
- Dilarang: `any`, SQL dengan konkatenasi string, `console.log` di kode yang di-commit, impor `src/server/**` dari Client Component.
- Aset di `brand/` adalah sumber resmi identitas brand; salin ke `public/`/`src/components/brand/`, jangan ubah desainnya. Nama produk ditulis **Fixmaster**.
- Teks UI dalam Bahasa Indonesia; identifier kode dalam bahasa Inggris.
