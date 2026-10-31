# DBD - Fixmaster

> Versi: 0.6 | Diperbarui: 2026-10-31 | Merujuk: PRD.md, AFD.md
> Sumber visual: file di `brand/` (logo, ikon, maskot VOLT Probe). Semua warna di bawah diturunkan dari file tersebut.

## 1. Karakter Brand
- Nama: **Fixmaster** (satu kata, hanya F kapital) di semua teks, metadata, dan manifest. Maskot: **VOLT Probe**, alat uji kontinuitas dengan label kode `V-01`.
- Dunia visual: "Precision Electronics Bench": casing instrumen grafit, aksen amber (grip, dial), sinyal cyan (layar LCD), dan sudut terpotong (chamfer) seperti casing alat ukur.
- Kata kunci: presisi, andal, transparan.
- Nada teks: Bahasa Indonesia sopan dan ringkas, menyapa "Anda", kalimat aktif, angka spesifik. Contoh: "Tiket SRV-00042 tersimpan." / "Stok tidak cukup (sisa 2)." / ke pelanggan: "Unit Anda sedang dikerjakan teknisi."
- Referensi [ASUMSI A-10]: panel multimeter/osiloskop (readout LCD, dial, label kode) untuk detail brand; dashboard operasional padat seperti Linear dan Stripe Dashboard untuk kepadatan tabel dan ketegasan aksi.
- Hindari: kesan chatbot/asisten AI pada maskot, gaya kartun, gradien ungu/neon, ilustrasi stok generik, amber sebagai warna teks di latar terang.

## 2. Design Tokens
**Palet primitif (dari `brand/`)**
| Token | Hex | Asal |
|---|---|---|
| amber-500 | #f5a623 | grip, dial, ujung probe |
| amber-700 | #c0750a | dial & konektor |
| cyan-500 | #3dd9c4 | gelombang LCD |
| graphite-1000 | #070a0d | layar LCD |
| graphite-950 | #111419 | latar ikon aplikasi |
| graphite-900 | #15191f | casing |
| graphite-850 | #1b2027 | casing ikon besar |
| graphite-800 | #2c333c | cincin ikon |
| graphite-750 | #303741 | badan probe |
| graphite-600 | #606a76 | tepi casing |
| graphite-400 | #aab2bd | logam/sekrup |

**Token semantik** (CSS variable `--color-*`; mode gelap mengikuti `prefers-color-scheme`, tanpa toggle manual)
| Token | Terang | Gelap | Pemakaian |
|---|---|---|---|
| background | #f5f6f8 | #111419 | Latar halaman |
| surface | #ffffff | #15191f | Kartu, tabel, form |
| surface-raised | #ffffff + bayangan | #1b2027 | Dialog, popover, menu |
| surface-sunken | #eceef1 | #070a0d | Header tabel, area input tanda tangan |
| border | #dcdfe4 | #2c333c | Pemisah dekoratif |
| border-strong | #7c8591 | #6f7a87 | Border input & kontrol (>= 3:1) |
| text | #15191f | #eceef1 | Teks utama |
| text-muted | #4f5965 | #aab2bd | Teks sekunder, label |
| primary | #f5a623 | #f5a623 | Tombol utama, indikator aktif |
| primary-hover | #e0920f | #f7b84a | Hover tombol utama |
| on-primary | #15191f | #111419 | Teks di atas primary (**jangan putih**) |
| brand-text | #8f5507 | #f5a623 | Link, item navigasi aktif |
| accent | #0d6c62 | #3dd9c4 | Info, status "Pengecekan" |
| focus-ring | #0d6c62 | #3dd9c4 | Outline fokus 2px, offset 2px |
| readout-bg / readout-text | #070a0d / #3dd9c4 | #070a0d / #3dd9c4 | Chip "LCD" untuk nomor tiket & total (kedua mode) |
| success | #137036 | #4ade80 | Siap diambil, lunas |
| warning | #9a4508 | #fbbf5a | Menunggu persetujuan, sisa bayar, banner trial |
| danger | #b42318 | #f87171 | Dibatalkan, error, hapus |
| danger-hover | #9a1d14 | #fa8a8a | Hover tombol danger (arah sama dengan primary-hover) |
| on-danger | #ffffff | #111419 | Teks tombol danger |

Badge punya dua sumbu: warna (`tone`) dan bentuk (`fill`). `tint` = latar token 12%, teks warna token; `solid` = khusus kerja aktif (`primary` + `on-primary`); `outline`/`dashed` = border 1px warna token tanpa latar. Semua kombinasi >= 4.5:1 di atas `background` maupun `surface` (dijaga `tests/unit/design-tokens.test.ts`).

**Token maskot** (wajib ada di `:root`, nilai sama di kedua mode karena maskot adalah benda fisik):
`--brand-500: #f5a623; --brand-700: #c0750a; --accent-500: #3dd9c4; --volt-shell: #15191f; --volt-shell-high: #303741; --volt-edge: #606a76; --volt-display: #070a0d; --volt-metal: #aab2bd; --font-mono: <IBM Plex Mono>`

**Status tiket** (warna selalu disertai ikon + label + bentuk). Bentuk membedakan "sedang dikerjakan" (solid, satu-satunya) dari "menunggu pihak lain" (putus-putus) tanpa bergantung pada warna.
| Status | Label UI | Token | Bentuk | Ikon lucide |
|---|---|---|---|---|
| received | Diterima | text-muted | tint | `inbox` |
| diagnosing | Pengecekan | accent | tint | `scan-search` |
| awaiting_approval | Menunggu persetujuan | warning | dashed | `hourglass` |
| in_progress | Dikerjakan | brand-text | solid (`primary`) | `wrench` |
| waiting_parts | Menunggu part | warning | dashed | `package` |
| ready | Siap diambil | success | tint | `circle-check` |
| picked_up | Sudah diambil | text-muted | outline | `check-check` |
| cancelled | Dibatalkan | danger | tint | `circle-x` |

**Tipografi** [ASUMSI A-10]
- Font: IBM Plex Sans (400, 500, 600) untuk UI; IBM Plex Mono (500; 700 hanya untuk label "V-01" maskot) untuk nomor tiket/nota, IMEI, SKU, readout. Dimuat via `next/font/google` (self-host saat build).
- Skala (ukuran/line-height, px): display 32/40 600 (judul S-18, state kosong); h1 24/32 600; h2 20/28 600; h3 16/24 600; body 16/24; body-sm 14/20 (tabel desktop); caption 12/16 500.
- Input selalu >= 16px (mencegah zoom iOS). Angka uang di tabel memakai `tabular-nums` dan rata kanan.

**Spacing & bentuk**
- Skala spacing: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64.
- Radius: sm 4px (badge, checkbox), md 6px (button, input), lg 10px (card, dialog).
- Chamfer brand: sudut terpotong (`chamfer`, ukuran lewat `--chamfer-size`: 8px untuk chip, 12px untuk panel) **hanya** untuk readout chip, kartu header status di S-18, dan panel state kosong. Selalu dengan bingkai 1px berupa chamfer bertumpuk (readout: `--volt-edge`; panel: `border-strong`), karena `clip-path` memotong border biasa dan tanpa bingkai bentuknya hilang di mode gelap. Kartu dan tabel biasa tetap memakai radius.
- Teks: heading `text-wrap: balance`, paragraf `text-wrap: pretty`. Seleksi teks: `primary` 35%.
- Bayangan: terang `0 1px 2px rgb(17 20 25 / .06), 0 2px 6px rgb(17 20 25 / .08)` untuk surface-raised; gelap tanpa bayangan (pakai surface-raised + border).
- Grid & lebar maks: konten 1280px; form (S-06, S-16) maks 720px; S-18 maks 560px di tengah; sidebar desktop 240px.
- Gerak: 150-200ms ease-out untuk hover/dialog; animasi dekoratif hanya maskot dan titik "live" di S-18; semua mematuhi `prefers-reduced-motion`.

## 3. Komponen
| Komponen | Varian | State wajib | Dipakai di |
|---|---|---|---|
| Button | primary, secondary, ghost, danger; ukuran md (44px, memenuhi target sentuh) & lg (48px) | default, hover, focus, disabled, loading | semua layar |
| Input | text, password (`PasswordInput`, dengan tombol tampilkan/sembunyikan karena tidak ada reset lewat email), tel (nomor WA), money (`MoneyInput`: prefix "Rp", pemisah ribuan, rata kanan, mengirim integer Rupiah), textarea, select, date; tinggi 44px; dibungkus `Field` (label + hint + error, `aria-describedby` otomatis); contoh format ditulis sebagai hint, bukan placeholder; nilai yang hanya dibaca memakai `readOnly` | default, focus, error, disabled | S-01-S-03, S-06, S-07, S-11, S-13, S-15-S-17, S-20 |
| Combobox | cari pelanggan, cari part (menampilkan sisa stok) | loading, kosong, hasil, error | S-06, S-07 |
| Checkbox group | kelengkapan unit, setuju syarat servis | checked, focus, disabled | S-06 |
| Switch | pengaturan on/off (wajib tanda tangan, teknisi ambil tiket) | on, off, focus, disabled | S-16 |
| Badge | status tiket (8), stok menipis, status langganan | - | S-04, S-05, S-07, S-11, S-12, S-18, S-19 |
| Readout | nomor tiket, total/sisa bayar, dan satu angka ringkas per layar yang dibaca sekilas: sisa trial (S-04, owner), jumlah data (S-10, S-15), password sementara saat diserahkan (S-15). Font mono, readout-bg, chamfer + bingkai `--volt-edge`, huruf kapital untuk label angka | - | S-04, S-07, S-10, S-15, S-18 |
| Card | kartu angka (`interactive` + `asChild` ke link, hover: border-strong + bayangan), kartu tiket mobile, section detail; `CardTitle` berupa heading (`h3`) | default, hover, focus | S-04, S-05, S-07, S-13, S-17, S-20 |
| Table | menjadi daftar kartu di < 640px | loading (skeleton), kosong | S-05, S-10-S-15, S-19, S-20 |
| Tabs | owner/admin: "Semua" / "Belum ditugaskan"; teknisi: "Tiket saya" / "Belum ditugaskan" (jika klaim aktif) | aktif, focus | S-05 |
| Pagination | 25 baris per halaman, tombol Sebelumnya/Berikutnya + info "1-25 dari N" | disabled di ujung | S-05, S-10, S-12, S-19 |
| Dropdown menu | menu "Kirim WA" (item nonaktif sesuai status), menu user | open, item disabled, focus | S-07, header |
| Date range picker | preset (Hari ini, 7 hari, Bulan ini, Bulan lalu) + 2 input date | error rentang | S-14 |
| Dialog | konfirmasi, form singkat (staf, stok masuk, pembayaran, persetujuan); isi dibungkus `<form>` agar Enter menyimpan; footer: Batal lalu aksi utama, urutan DOM = urutan visual di semua lebar | open, submitting, error | S-07, S-13, S-15, S-18, S-20 |
| Toast / Banner | toast sukses (tint `success`), error (tint `danger`, tetap tampil sampai ditutup, boleh punya tombol aksi pemulihan), info; tombol tutup dengan area klik 44px dan label Indonesia; pesan error diumumkan lewat region `role="alert"` (assertive); di mobile toast berada di atas bottom bar (`--fm-bottom-bar-height`); banner langganan & peringatan estimasi | auto-hilang 4 detik (sukses) | semua layar `(app)`, S-07 |
| SignaturePad | area min 300x150px di surface-sunken + tombol "Ulangi" | kosong, terisi, error | S-06 |
| Timeline | semua event (S-07), event publik (S-18) | - | S-07, S-18, S-20 (log) |
| Navigasi | sidebar (>= 1024px), rail 88px ikon + label caption (640-1023px, tablet tidak punya hover untuk `title`), bottom bar + sheet "Lainnya" (< 640px; sheet tidak dipakai bila hanya berisi satu item). "Terima unit" di sidebar/rail memakai tile ikon amber seperti bottom bar, sehingga tombol primary tetap milik area aksi halaman | aktif, hover, focus | semua layar `(app)` dan `admin/` |
| EmptyState | panel chamfer 12px di atas `surface` dengan bingkai `border-strong`; dengan maskot `full` 120px atau tanpa maskot; varian `hero` (judul display 32/40, maskot 160px, lebar maks 672px) saat panel adalah seluruh pesan layar: S-04 pertama kali | - | S-04, S-05, S-10, S-12, S-14, S-15, S-18 (kedaluwarsa), 404/error |
| Skeleton | baris tabel, kartu, form; kontainer diberi `aria-busy="true"` + teks `sr-only` "Memuat data…" | - | semua layar dengan data |
| Halaman cetak | `thermal_58` (lebar cetak 48mm), `thermal_80` (72mm), `a4` | selalu mode terang, teks hitam, tanpa latar berwarna | S-08, S-09 |

## 4. Responsivitas
| Breakpoint | Lebar | Perilaku layout |
|---|---|---|
| mobile | < 640px | 1 kolom; tabel jadi kartu; bottom bar; aksi utama S-07 menempel di bawah layar; form 1 kolom |
| tablet | 640-1023px | rail 88px; form 2 kolom; tabel hanya kolom prioritas (nomor, pelanggan, status, aksi) |
| desktop | >= 1024px | sidebar 240px; S-07 dua kolom (kiri: unit & item; kanan: status, pembayaran, timeline) |

Pendekatan: mobile-first. S-06 dioptimalkan untuk tablet di meja kasir (pad tanda tangan lebar penuh).

## 5. Aksesibilitas
- Kontras teks minimal 4.5:1 dan komponen non-teks 3:1. Terverifikasi: teks utama 17.6:1 / 15.9:1; text-muted 6.6:1 / 8.6:1; on-primary 8.7:1 / 9.1:1; brand-text 5.6:1 / 9.1:1; badge terendah 4.75:1 (brand-text terang di atas `background`); readout 11.3:1; border-strong 3.7:1 / 4.0:1 (terang / gelap).
- Status tidak pernah dibedakan hanya dengan warna (ikon + label).
- Target sentuh minimal 44x44px; fokus keyboard terlihat (`focus-ring`); semua aksi bisa dicapai tanpa mouse; urutan tab mengikuti urutan visual.
- Form: setiap input punya `<label>`; pesan error dihubungkan via `aria-describedby`; toast sukses/info diumumkan `polite`, toast error lewat region `role="alert"` (assertive).
- Gambar bermakna punya teks alternatif; maskot dekoratif (`aria-hidden`, sudah di komponen); `<html lang="id">`.

## 6. Aset
| File sumber | Pemakaian | Tujuan di aplikasi |
|---|---|---|
| `brand/logo.svg` | Logo mark 48x48; header aplikasi (32px) + teks "Fixmaster" (Plex Sans 600); nota A4 | `public/logo.svg` |
| `brand/favicon.svg` | Favicon (varian outline amber) | `public/favicon.svg` |
| `brand/icon-maskable.svg` | Sumber ikon maskable (latar penuh #111419) | referensi desain |
| `brand/png/apple-touch-icon.png` (180) | Ikon home screen iOS | `public/apple-touch-icon.png` |
| `brand/png/icon-192.png`, `icon-512.png` | Manifest `purpose: any` (latar transparan) | `public/icons/` |
| `brand/png/icon-maskable-192.png`, `-512.png` | Manifest `purpose: maskable` | `public/icons/` |
| `brand/Mascot.tsx` | Maskot VOLT Probe (`face`/`full`, animasi SMIL, hormati reduced motion) | `src/components/brand/mascot.tsx` |
| `brand/icons.svg` | Sprite ikon sosial (Bluesky, Discord, GitHub, X, dll.) dari template Vite. **Bukan identitas brand**: warnanya (#aa3bff, #08060d) tidak termasuk palet; jika dipakai ganti fill/stroke ke `currentColor`. Tidak dipakai di MVP. | - |

- Manifest PWA: `name` & `short_name` "Fixmaster", `theme_color` dan `background_color` #111419, `display: standalone`, `start_url: /dashboard`.
- Ikon UI: lucide-react, ukuran 16/20px, stroke 1.75.
- Maskot: `full` 120-160px di state kosong (S-04 pertama kali, S-05 kosong, 404/error, S-18 link kedaluwarsa); `face` 40-64px hanya di banner onboarding. Tidak dipakai di tabel, tombol, halaman cetak, atau lebih dari satu per layar.
- Cetak thermal hanya memakai teks nama toko (printer thermal tidak mencetak warna); A4 memakai `logo.svg`.

## 7. Do & Don't
| Do | Don't |
|---|---|
| Amber sebagai latar tombol utama dengan teks grafit gelap | Teks putih di atas amber, atau teks amber di latar terang |
| Satu tombol primary per area aksi | Beberapa tombol amber bersaing dalam satu layar |
| Readout LCD (mono, cyan di atas hitam) untuk nomor tiket, total, dan satu angka ringkas per layar | Readout untuk kalimat, dekorasi, atau lebih dari satu angka ringkas di satu layar |
| Chamfer pada readout, header S-18, panel kosong | Chamfer di semua kartu dan tombol |
| Maskot sebagai teman bengkel di state kosong/error | Maskot sebagai avatar chatbot atau di layar padat data |
| Label status + ikon + warna | Membedakan status hanya dengan warna |
| Nominal rata kanan dengan `tabular-nums` | Nominal rata kiri dengan font proporsional |
