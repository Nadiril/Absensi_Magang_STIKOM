## 📝 Riwayat Perubahan (Changelog)

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
