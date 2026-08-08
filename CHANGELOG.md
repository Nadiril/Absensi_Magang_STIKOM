## 📝 Riwayat Perubahan (Changelog) Absensi Magang 

### v1.0.0

- Rilis awal: scan QR presensi, CRUD siswa & sekolah, riwayat presensi, dashboard, mode offline (AsyncStorage), fondasi ui dan logic

### v1.1.0 — 5 Agustus 2026

- 🎨 **Tema disederhanakan** — palet `dark` dihapus; mode tema kini `Auto` / `Terang` / `Senja` (malam otomatis hangat senja, aksen warna lebih kalem)
- 📊 **Dashboard** — section "Akses Cepat" diganti **Statistik**: persentase kehadiran (progress bar), total presensi, terlambat, siswa aktif & tidak aktif
- 🧹 **Kartu siswa** — badge kehadiran dihapus agar tampilan lebih bersih
- ⌨️ **Perbaikan scroll form** — `KeyboardAwareScrollView` + `softwareKeyboardLayoutMode: "resize"` agar field bawah form tetap terlihat & bisa di-scroll saat keyboard muncul (mencegah salah input)
- 🔤 **Perbaikan kontras** — teks badge kehadiran di halaman detail siswa kini terbaca jelas (`onPrimaryContainer`)
- ➕ **Dependensi baru** — `react-native-keyboard-aware-scroll-view ^0.9.5`

### v1.2.0 — 5 Agustus 2026

- 🔐 **Halaman login premium** — desain ulang Material Design 3: kartu gradien, input full-width dengan label & state focus/error/success, tombol ripple + animasi loading, background blob dekoratif
- 🔑 **Autentikasi demo** — validasi email & password (min. 6 karakter), "Remember Me" (email tersimpan), tombol "Lupa Password", sesi tersimpan di `AsyncStorage` (`@magangku_auth`)
- ⏳ **Transisi loading** — `auth-loading.tsx`: skeleton screen saat muat data setelah login sebelum masuk ke tab utama
- 🧭 **Route guard** — pengalihan otomatis ke halaman login jika belum masuk (`_layout.tsx`)
- 🍞 **Perbaikan Toast** — posisi & tinggi notifikasi disesuaikan dengan safe-area insets agar tidak terpotong
- ⚡ **Optimasi performa** — baris list siswa & sekolah di-memoize (`React.memo`), kamera QR otomatis dijeda saat pindah tab, penyimpanan `AsyncStorage` di-debounce, pembersihan log konsol
- ⌨️ **Perbaikan keyboard login** — `KeyboardAvoidingView` + scroll agar form tidak tertutup keyboard (fix mode edge-to-edge)


### v1.3.0 — 6 Agustus 2026

- 🔳 **QR Code asli dari NIS** — kartu QR di detail siswa kini adalah QR generatif sungguhan (`react-native-qrcode-svg`) yang berisi NIS, bukan ikon dekoratif; QR otomatis ikut berubah saat NIS diedit
- 📤 **Unduh / Cetak Kartu QR** — tombol ekspor menangkap kartu QR menjadi gambar PNG (`react-native-view-shot`) lalu membuka share sheet (`expo-sharing`) untuk diunduh, dikirim, atau dicetak
- 🧩 **Dependensi baru** — `react-native-svg`, `react-native-qrcode-svg`, `react-native-view-shot`, `expo-sharing`


### v1.4.0 — 6 Agustus 2026

- 🔁 **Check-in / Check-out otomatis** — scan pertama = sesi Masuk, scan kedua = sesi Pulang; scan ketiga ditolak (duplikat); status hari ini otomatis `Hadir`/`Terlambat` dibanding batas jam
- 📅 **Field tanggal presensi** — `AttendanceRecord` kini menyimpan tanggal (`YYYY-MM-DD`) sehingga sesi harian & statistik per hari akurat
- ⚙️ **Layar Pengaturan Presensi** — atur jam batas check-in lewat `DateTimePicker` (default 08:00), tersimpan di AsyncStorage; diakses dari Profil → Pengaturan Presensi
- 🧭 **UI scan dinamis** — modal & kartu hasil menampilkan "Presensi Masuk/Pulang Berhasil" dengan ikon beda (`log-in`/`log-out`) + hint scan ulang saat pulang
- 📊 **Dashboard diperkaya** — stat "Sudah Pulang" & "Belum Pulang" hari ini; metrik hadir/terlambat dihitung berbasis Check-In per tanggal
- 🎫 **Badge Sesi Hari Ini** — halaman detail siswa menampilkan status masuk/pulang hari ini secara live
- ➕ **Dependensi baru** — `@react-native-community/datetimepicker`

### v1.4.1 — 7 Agustus 2026

- 🌐 **Sinkronisasi presensi ke Supabase** — `attendance_records` & `app_settings` kini tersinkron: service baru `attendanceService` (insert riwayat saat check-in/out, upsert jam batas), riwayat ditarik saat aplikasi dibuka, dan `check_in_limit` auto-seed default `08:00` bila tabel masih kosong
- ✍️ **Standarisasi label absensi** — terminologi "Masuk" diganti "Hadir" secara konsisten di seluruh UI presensi (modal scan "Presensi Hadir Berhasil!", aktivitas dashboard "Presensi Hadir", badge sesi hari ini)
- 🗃️ **Skema database lengkap** — `sql/setup_lengkap.sql` (skema utuh dari awal: schools, students, attendance_records, app_settings + RLS + seed & query contoh; bebas placeholder UUID sehingga aman dieksekusi)
- 🐛 **Perbaikan duplikat key** — id aktivitas/presensi yang sebelumnya `Date.now()` di-generate dengan `genId()` unik (`lib/id.ts`) untuk mencegah key kembar saat banyak aksi dalam milidetik yang sama
- 🐛 **Perbaikan error kolom** — penghapusan `class_grade` dari frontend + daftar kolom eksplisit pada query, sehingga tidak lagi bergantung kolom/`schema cache` PostgREST ("Could not find the column")


### v1.4.2 — 7 Agustus 2026

- 📅 **Periode Magang** — form siswa kini wajib mengisi **Tanggal Mulai** & **Tanggal Selesai Magang** (`DateTimePicker`; prefill saat edit; validasi selesai ≥ mulai), disimpan di kolom baru `start_date`/`end_date` (DATE) dan ditampilkan sebagai "Periode Magang" di halaman detail siswa
- 🗃️ **SQL diperbarui** — `sql/setup_lengkap.sql` memuat kolom periode magang di `CREATE TABLE students` + blok migrasi aman (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`); contoh seed ikut diperbarui
- 🐛 **Perbaikan aktivitas beranda** — feed "Aktivitas Terbaru" kini dibangun ulang otomatis dari `attendance_records` (tidak lagi hilang setelah aplikasi di-restart); tanpa tabel baru

### v1.5.0 — 8 Agustus 2026

- 🔖 **Status siswa Aktif / Tidak Aktif** — pilihan baru di form tambah/edit siswa; siswa `Tidak Aktif` **ditolak saat scan** QR/NIS (ada pesan peringatan), badge status tampil di daftar & detail siswa, dan tidak ikut sebagai penyebut persentase kehadiran (statistik berbasis siswa aktif saja; TOTAL SISWA tetap semua)
- 🧹 **Badge "% Kehadiran" dihapus** dari halaman detail siswa (UI saja; field `attendance_rate` tetap tersimpan)
- 🔳 **Kartu QR informatif** — QR kini berisi `Nama|NIS` (bukan NIS saja) + nama siswa ditampilkan di kartu agar mudah dicetak/dikenali; scanner tetap kompatibel dengan kartu lama berisi NIS saja dan input manual
- 🕐 **Riwayat Presensi lengkap** — setiap entri menampilkan **tanggal + jam** (mis. `Sab, 08 Agu 2026 • 07:58`)
- ⚖️ **Konsistensi kartu** — nomor HP siswa pada kartu daftar dirata kiri agar seragam dengan kartu sekolah
- 🔊 **Suara keberhasilan scan** — bunyi "ding" singkat saat presensi berhasil (scan QR & input NIS manual) lewat `expo-audio`; audio mode disetel `playsInSilentMode` + `mixWithOthers` (tidak mengganggu musik/audio lain)
- ➕ **Dependensi baru** — `expo-audio ~1.1.1` (config plugin terpasang di `app.json`)### v1.5.1 - 8 Agustus 2026

- Load data lebih cepat: fetch awal (sekolah + siswa + presensi + pengaturan) berjalan paralel dalam satu `Promise.all` (sebelumnya berurutan), mempercepat tampilan data saat aplikasi dibuka
- Hemat penyimpanan saat online: penulisan AsyncStorage untuk attendance_records dilewati saat mode Supabase aktif (sebelumnya tetap menulis duplikat setiap scan)
- List lebih responsif: renderItem list siswa & sekolah di-stabilkan dengan useCallback agar React.memo pada baris benar-benar bekerja saat kumpulan data berubah
