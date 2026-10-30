# PRD - Fixmaster

> Versi: 0.1 | Diperbarui: 2026-10-30 | Status: Draft

## 1. Ringkasan
Fixmaster adalah SaaS B2B (web responsive + PWA) untuk toko reparasi laptop, handphone, tablet, dan perangkat elektronik lain di Indonesia. Fixmaster mencatat seluruh perjalanan unit servis: penerimaan unit dengan tanda tangan pelanggan, pengerjaan oleh teknisi, estimasi yang disetujui pelanggan lewat link, pemakaian sparepart dari stok, sampai nota, pembayaran, dan pengambilan. Pelanggan memantau status lewat link yang dikirim via WhatsApp. Nilai utamanya: toko tidak lagi kehilangan jejak unit, uang, dan stok, dan pelanggan tidak perlu menelepon untuk menanyakan progres.

## 2. Masalah
- Masalah: pencatatan servis tersebar di buku tulis, nota kertas, dan chat WhatsApp. Unit, sparepart, dan DP sulit dilacak; pelanggan sering menanyakan status; sengketa "estimasi tidak pernah disetujui" atau "unit diserahkan tanpa kelengkapan".
- Dialami oleh: pemilik toko reparasi, admin/kasir, dan teknisi di toko kecil-menengah (1-10 staf). [ASUMSI A-01]
- Cara mereka mengatasinya sekarang: buku servis manual, Excel, nota rangkap, dan membalas WhatsApp satu per satu.

## 3. Tujuan & Metrik Sukses
| Tujuan | Metrik | Target |
|---|---|---|
| Penerimaan unit cepat | Median waktu dari membuka S-06 sampai tiket tersimpan | <= 2 menit [ASUMSI A-09] |
| Pelanggan terinformasi | % tiket toko pilot yang punya event `wa_opened` | >= 70% [ASUMSI A-09] |
| Dipakai sungguhan | Toko pilot aktif (>= 10 tiket/minggu) | 5 toko selama 4 minggu berturut-turut [ASUMSI A-09] |
| Data toko terisolasi | Tes isolasi lintas tenant (BSD bagian 5) | 100% lolos, 0 kebocoran |

## 4. Pengguna
| Peran | Deskripsi | Kebutuhan utama |
|---|---|---|
| Owner | Pemilik toko; satu per toko, dibuat saat registrasi | Kendali penuh: staf, pengaturan, laporan, langganan |
| Admin/Kasir | Staf depan | Terima unit, kelola pelanggan, estimasi, pembayaran, nota, stok |
| Teknisi | Staf yang memperbaiki | Lihat tiket yang ditugaskan, ubah status, catat diagnosa & part |
| Pelanggan | Pemilik unit, **tanpa akun** | Lihat status, setujui/tolak estimasi lewat link |
| Super-admin | Operator platform Fixmaster | Aktivasi langganan, bantu reset password owner |

Satu user hanya milik satu toko. [ASUMSI A-04]

## 5. Fitur MVP
Prioritas: P0 = wajib rilis, P1 = sebaiknya ada, P2 = jika sempat.

| ID | Fitur | Prioritas | User story |
|---|---|---|---|
| F-01 | Registrasi toko & autentikasi | P0 | Sebagai owner, saya ingin mendaftarkan toko dan login, agar bisa mulai memakai Fixmaster tanpa menunggu |
| F-02 | Staf & peran | P0 | Sebagai owner, saya ingin menambah admin dan teknisi dengan akses berbeda, agar data sensitif terlindungi |
| F-03 | Penerimaan unit (pelanggan + tiket baru + tanda terima) | P0 | Sebagai admin, saya ingin mencatat unit masuk lengkap dengan kelengkapan dan tanda tangan, agar ada bukti serah terima |
| F-04 | Pengerjaan & status servis | P0 | Sebagai teknisi, saya ingin melihat tiket saya dan memperbarui statusnya, agar semua orang tahu progresnya |
| F-05 | Estimasi & persetujuan pelanggan | P0 | Sebagai admin, saya ingin pelanggan menyetujui estimasi lewat link, agar ada bukti persetujuan biaya |
| F-06 | Stok sparepart | P0 | Sebagai owner, saya ingin stok berkurang otomatis saat part dipakai, agar stok fisik dan sistem cocok |
| F-07 | Nota & pembayaran | P0 | Sebagai kasir, saya ingin mencatat DP/pelunasan dan mencetak nota, agar unit hanya keluar jika lunas |
| F-08 | Status pelanggan & WhatsApp | P0 | Sebagai pelanggan, saya ingin membuka link untuk melihat status servis, agar tidak perlu menelepon toko |
| F-09 | Dashboard & laporan | P0 | Sebagai owner, saya ingin melihat pendapatan, kinerja teknisi, dan stok menipis, agar bisa mengambil keputusan |
| F-10 | Pengaturan toko | P0 | Sebagai owner, saya ingin mengatur profil toko, syarat servis, dan format cetak, agar dokumen sesuai toko saya |
| F-11 | Langganan & super-admin | P0 | Sebagai operator, saya ingin memberi trial lalu mengaktifkan paket secara manual, agar bisa menagih tanpa payment gateway |

### Acceptance Criteria
**F-01 Registrasi toko & autentikasi**
- [ ] Form daftar (S-01): nama toko (3-80 karakter), nama owner, nomor WA toko, email, password (min 8 karakter). Simpan membuat 1 baris `tenants` + 1 `users` (role `owner`) dalam satu transaksi, `trial_ends_at` = sekarang + 14 hari [ASUMSI A-02], lalu langsung masuk ke S-04.
- [ ] Login email + password (S-02); sesi berlaku 7 hari; logout menghapus sesi.
- [ ] Semua rute aplikasi menolak tamu (redirect ke `/login`); user dengan `is_active = false` tidak bisa login.
- [ ] Kasus gagal: email sudah terdaftar -> "Email sudah terdaftar"; password salah -> "Email atau password salah" (tanpa membedakan mana yang salah); > 5 percobaan login gagal per IP per menit -> ditolak sementara dengan pesan "Terlalu banyak percobaan, coba lagi dalam 1 menit".

**F-02 Staf & peran**
- [ ] Owner membuat akun staf (S-15): nama, email, peran (`admin`/`technician`), password sementara (min 8). Staf wajib mengganti password saat login pertama (S-03).
- [ ] Owner bisa menonaktifkan/mengaktifkan staf dan mereset password staf. Menonaktifkan langsung mencabut semua sesi staf tersebut.
- [ ] Admin dan teknisi yang membuka S-15, S-14, S-16, atau S-17 diarahkan ke S-04 dengan pesan "Anda tidak punya akses ke halaman ini".
- [ ] Kasus gagal: email sudah dipakai -> pesan di field email; owner tidak bisa menonaktifkan dirinya sendiri.

**F-03 Penerimaan unit**
- [ ] Pelanggan: cari berdasarkan nama atau nomor WA (min 3 karakter, hasil maks 10) atau buat baru (nama + nomor WA wajib). Nomor WA disimpan ternormalisasi `62xxxxxxxxx` dan unik per toko.
- [ ] Form tiket (S-06): jenis perangkat, merek, model, IMEI/nomor seri (opsional), keluhan (wajib, maks 1000 karakter), kondisi fisik (opsional), kelengkapan (checklist + catatan), kunci layar (tipe + nilai), target selesai (opsional), teknisi (opsional), DP (opsional), centang syarat servis + tanda tangan pelanggan (wajib) [ASUMSI A-05].
- [ ] Simpan menghasilkan nomor tiket `{prefix}-{5 digit}` berurutan per toko (mis. `SRV-00042`), status `received`, dan token status publik acak. Nilai kunci layar tidak pernah tersimpan sebagai plaintext di database.
- [ ] Setelah simpan tampil tombol "Cetak tanda terima" (S-08) dan "Kirim WA: Diterima".
- [ ] Daftar & detail pelanggan (S-10, S-11) menampilkan riwayat tiket per pelanggan.
- [ ] Kasus gagal: error validasi tampil di bawah field terkait; isian form (kecuali tanda tangan) tidak hilang saat simpan gagal.

**F-04 Pengerjaan & status servis**
- [ ] Status hanya berpindah sesuai tabel transisi di BSD bagian 4; transisi lain ditolak dengan pesan "Perubahan status tidak diizinkan".
- [ ] Owner/admin menugaskan teknisi. Teknisi melihat tiket miliknya dan tiket yang belum ditugaskan, dan bisa menekan "Ambil tiket" [ASUMSI A-13].
- [ ] Setiap perubahan status, penugasan, diagnosa, dan catatan tercatat di timeline beserta waktu dan pelakunya.
- [ ] Nilai kunci layar hanya bisa dibuka oleh owner dan teknisi yang ditugaskan; setiap pembukaan tercatat (`secret_viewed`); nilainya dihapus otomatis saat status menjadi `picked_up`.
- [ ] Daftar tiket (S-05): filter status & teknisi, pencarian nomor tiket/nama/nomor WA, 25 tiket per halaman, urut terbaru.
- [ ] Kasus gagal: tiket sudah diubah orang lain sejak dibuka -> perubahan ditolak dengan pesan "Tiket sudah diubah pengguna lain. Muat ulang untuk melihat versi terbaru."

**F-05 Estimasi & persetujuan pelanggan**
- [ ] Item tiket berjenis jasa atau part (deskripsi, qty 1-99, harga satuan) + diskon tingkat tiket; total dihitung otomatis.
- [ ] "Minta persetujuan" mengubah status ke `awaiting_approval`; tombol "Kirim WA: Estimasi" membuka WhatsApp dengan rincian total dan link status.
- [ ] Pelanggan di S-18 bisa menekan Setujui atau Tolak (alasan opsional) **satu kali**. Setujui -> `in_progress`; Tolak -> `cancelled`. Total yang disetujui, waktu, dan cara (`link`/`manual`) tersimpan.
- [ ] Owner/admin bisa mencatat persetujuan/penolakan manual (mis. via telepon) dengan catatan wajib.
- [ ] Jika total item melebihi total yang disetujui, muncul peringatan dan tiket tidak bisa ditandai `ready` sebelum disetujui ulang.
- [ ] Kasus gagal: link dibuka setelah estimasi dijawab -> tombol hilang dan tampil jawaban sebelumnya beserta waktunya.

**F-06 Stok sparepart**
- [ ] Katalog part (S-12): nama, SKU (opsional, unik per toko), harga modal, harga jual, stok minimum. Part tidak dihapus, hanya dinonaktifkan.
- [ ] Stok masuk (qty, harga modal per unit, catatan) dan penyesuaian (+/-, catatan wajib) di S-13.
- [ ] Menambah item part dari stok ke tiket mengurangi stok; menghapus item atau membatalkan tiket mengembalikan stok [ASUMSI A-14]. Setiap perubahan tercatat di riwayat mutasi.
- [ ] Stok tidak boleh negatif: tolak dengan "Stok tidak cukup (sisa N)" dan tawarkan "Tambah sebagai part non-stok".
- [ ] Part dengan stok <= stok minimum diberi penanda "Stok menipis". Teknisi bisa melihat daftar part tanpa harga modal.

**F-07 Nota & pembayaran**
- [ ] Pembayaran bisa dicatat kapan saja: jenis (`payment`/`refund`), metode (tunai, transfer, QRIS, lainnya), jumlah > 0. Ringkasan total, dibayar, dan sisa selalu tampil di S-07.
- [ ] "Buat nota" tersedia pada status `ready` atau `cancelled` dan menghasilkan nomor `INV-{5 digit}` berurutan per toko. Setelah nota dibuat, item terkunci; hanya owner yang bisa "Buka kunci nota" (tercatat di timeline, nomor nota tetap).
- [ ] Cetak nota (S-09) memuat: nama & kontak toko, nomor nota & tiket, pelanggan, unit, item, diskon, total, dibayar, sisa, masa garansi s.d. tanggal [ASUMSI A-07], dan syarat servis.
- [ ] Status `picked_up` hanya bisa dipilih jika sisa = 0 dan (jika tiket punya item) nota sudah dibuat. Jika pembayaran berlebih, tampil "Kembalikan Rp X ke pelanggan" dan refund harus dicatat dulu.
- [ ] Kasus gagal: mencoba `picked_up` dengan sisa > 0 -> ditolak dengan "Masih ada sisa pembayaran Rp X".

**F-08 Status pelanggan & WhatsApp**
- [ ] S-18 (`/s/{token}`) terbuka tanpa login dan menampilkan: nama & tombol WA toko, nomor tiket, unit, status saat ini + timeline publik, estimasi (dengan tombol Setujui/Tolak saat `awaiting_approval`), ringkasan pembayaran, dan garansi setelah diambil.
- [ ] S-18 tidak menampilkan kunci layar, catatan internal, nama teknisi, atau IMEI/nomor seri penuh (hanya 4 karakter terakhir).
- [ ] Token minimal 128 bit acak; token salah -> halaman 404 generik. Link kedaluwarsa 90 hari setelah `picked_up` [ASUMSI A-06] dengan pesan "Link sudah tidak berlaku, hubungi toko".
- [ ] Di S-07 tersedia 4 tombol WA berbasis template (Diterima, Estimasi, Siap diambil, Terima kasih + garansi) yang membuka `wa.me/{62xxx}?text=...` di tab baru dan mencatat event `wa_opened`.
- [ ] Tanda terima (S-08) memuat link status dalam bentuk teks dan QR code.

**F-09 Dashboard & laporan**
- [ ] Dashboard (S-04): jumlah tiket aktif per status, tiket lewat target selesai, tiket `ready` > 7 hari belum diambil, jumlah part stok menipis, dan pendapatan hari ini (owner & admin saja). Teknisi hanya melihat angka tiket miliknya.
- [ ] Laporan (S-14, owner saja) untuk rentang tanggal (default bulan berjalan, maks 366 hari): pendapatan bersih (payment - refund) per hari dan per metode; jumlah tiket `picked_up` per teknisi; part terpakai (qty, nilai jual, nilai modal).
- [ ] Angka laporan untuk data seed tetap sama persis dengan nilai yang diharapkan di tes integrasi.

**F-10 Pengaturan toko**
- [ ] Owner mengubah (S-16): nama toko, alamat, nomor WA, zona waktu (WIB/WITA/WIT) [ASUMSI A-16], prefix tiket (2-5 huruf kapital), garansi default (0-365 hari), syarat servis (maks 2000 karakter), format cetak (`thermal_58`, `thermal_80`, `a4`) [ASUMSI A-15].
- [ ] Perubahan prefix hanya berlaku untuk tiket baru; nomor lama tidak berubah.

**F-11 Langganan & super-admin**
- [ ] Status langganan dihitung dari tanggal: `active` jika `active_until` > sekarang, `trial` jika `trial_ends_at` > sekarang, selain itu `expired`.
- [ ] Banner sisa hari tampil di semua halaman aplikasi bila sisa <= 7 hari. Saat `expired`: tidak bisa membuat tiket baru, menambah staf, atau menambah part; tiket berjalan tetap bisa diproses, dibayar, dan diambil [ASUMSI A-02].
- [ ] S-17 menampilkan status, tanggal berakhir, dan instruksi pembayaran transfer [ASUMSI A-03].
- [ ] Super-admin (dibuat lewat perintah CLI, bukan form publik) bisa: melihat daftar toko + status + jumlah tiket 30 hari terakhir (S-19), memperpanjang `active_until` dengan catatan pembayaran, dan mereset password owner (S-20). Semua aksi tercatat di `subscription_logs`.

## 6. Di Luar Scope (jangan dikerjakan)
- Multi-cabang per toko (skema memakai `tenant_id` sehingga `branch_id` bisa ditambah nanti).
- Foto kondisi unit atau upload file apa pun; logo toko custom.
- WhatsApp API otomatis (Fonnte, Wablas, Cloud API); template WA yang bisa diedit.
- Payment gateway (langganan maupun pembayaran pelanggan), QRIS dinamis.
- Aplikasi mobile native; mode offline PWA.
- Login Google/SSO, reset password via email, verifikasi email [ASUMSI A-17].
- Klaim garansi sebagai alur khusus, PPN/faktur pajak [ASUMSI A-08], multi-mata uang, multi-bahasa.
- Data supplier, purchase order, stock opname terjadwal.
- Booking/antrian online oleh pelanggan, akun pelanggan, notifikasi push/email.
- Ekspor CSV/Excel, integrasi akuntansi.

## 7. Kebutuhan Non-Fungsional
- Performa: S-18 dan S-04 memiliki LCP < 2,5 detik di HP Android kelas menengah dengan 4G; aksi simpan selesai < 1 detik untuk data A-01.
- Keamanan & privasi: isolasi data per toko wajib; kunci layar terenkripsi AES-256-GCM; password di-hash; data pelanggan (nama, WA) diperlakukan sebagai data pribadi sesuai UU PDP (UU 27/2022) dengan toko sebagai pengendali data.
- Aksesibilitas: WCAG 2.2 AA (detail di DBD bagian 5).
- Perangkat/browser: Chrome Android 10+, Safari iOS 16+, Chrome/Edge/Firefox desktop 2 versi terakhir; lebar layar minimal 360px; installable sebagai PWA.
- Bahasa & format: UI Bahasa Indonesia; Rupiah tanpa desimal (`Rp 150.000`); tanggal `30 Okt 2026, 14.05`.

## 8. Asumsi, Risiko, Dependensi
Daftar asumsi (satu-satunya daftar; dokumen lain merujuk ID ini):
- [ASUMSI A-01] Target toko 1-10 staf, <= 300 tiket/bulan per toko.
- [ASUMSI A-02] Trial 14 hari. Saat `expired`, hanya pembuatan tiket/staf/part baru yang diblokir; tiket berjalan tetap bisa diselesaikan.
- [ASUMSI A-03] Satu paket langganan; harga dan rekening tujuan belum ditentukan, ditampilkan dari konfigurasi.
- [ASUMSI A-04] Satu user = satu toko; email unik secara global.
- [ASUMSI A-05] Pelanggan selalu hadir saat penerimaan unit, sehingga tanda tangan wajib.
- [ASUMSI A-06] Link status berlaku sampai 90 hari setelah unit diambil.
- [ASUMSI A-07] Garansi default 30 hari, bisa diubah per toko dan per tiket.
- [ASUMSI A-08] Tanpa PPN; semua harga dalam Rupiah bulat.
- [ASUMSI A-09] Target metrik sukses di bagian 3 adalah usulan awal untuk fase pilot.
- [ASUMSI A-10] Font IBM Plex Sans + IBM Plex Mono; referensi visual di DBD bagian 1.
- [ASUMSI A-11] Data di database lokal (PGlite) hanya data uji; tidak dimigrasikan ke Supabase.
- [ASUMSI A-12] Production di Vercel Pro (Hobby melarang pemakaian komersial) region `sin1` + Supabase region Singapore.
- [ASUMSI A-13] Teknisi boleh melihat dan mengambil tiket yang belum ditugaskan.
- [ASUMSI A-14] Stok berkurang saat part ditambahkan ke tiket (bukan saat disetujui) dan kembali saat item dihapus atau tiket dibatalkan.
- [ASUMSI A-15] Format cetak: thermal 58 mm, thermal 80 mm, dan A4, via cetak browser.
- [ASUMSI A-16] Zona waktu default `Asia/Jakarta`, bisa diganti per toko.
- [ASUMSI A-17] Tanpa reset password via email: owner mereset password staf, super-admin mereset password owner.

Risiko -> mitigasi:
- Pelanggan tidak membuka link status -> link juga tercetak sebagai QR di tanda terima; tombol WA berisi ringkasan status.
- Toko enggan beralih dari buku tulis -> target input tiket <= 2 menit, seed data demo, pilot didampingi.
- Kebocoran data antar toko -> semua query lewat service ber-`tenant_id` + tes isolasi wajib (TRD bagian 4).
- Kunci layar pelanggan bocor -> enkripsi, akses terbatas, log setiap pembukaan, hapus otomatis saat diambil.

Dependensi: WhatsApp (link `wa.me`, tanpa API), Supabase (Postgres production), Vercel (hosting).

## 9. Pertanyaan Terbuka
- Harga paket langganan dan rekening tujuan transfer (A-03)?
- Apakah 14 hari trial dan batasan saat kedaluwarsa (A-02) sudah sesuai?
- Apakah ada kasus unit dititipkan tanpa pelanggan hadir (memengaruhi A-05)?
- Domain production (mis. `fixmaster.id`) dan alamat email support?
