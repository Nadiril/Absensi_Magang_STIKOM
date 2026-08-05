# 📱 AbsensiMagang (Magangku)

Aplikasi **presensi siswa magang berbasis QR Code** yang dibangun dengan Expo (React Native). Siswa menampilkan kartu QR, admin memindai QR tersebut untuk mencatat kehadiran, serta mengelola data siswa dan sekolah mitra secara lengkap (CRUD).

> ⚠️ **Status: Pengembangan Awal (v1.2.0)** — Fitur masih terus dikembangkan dan disempurnakan.

---

## ✨ Fitur

| Modul | Keterangan |
| --- | --- |
| 📷 **Absensi QR Code** | Scan QR siswa langsung dari kamera (berbasis `expo-camera`), dengan flash & lock antar-scan |
| ⌨️ **Input NIS Manual** | Cadangan presensi manual jika QR rusak / tidak terbaca |
| 🎉 **Modal Sukses Presensi** | Konfirmasi visual setelah scan berhasil (nama, NIS, sekolah, jam) |
| 👨‍🎓 **Data Siswa (CRUD)** | Tambah, lihat detail + kartu QR, **edit**, hapus, pencarian & filter sekolah |
| 🏫 **Data Sekolah (CRUD)** | Tambah, **edit**, hapus, pencarian, status sekolah mitra |
| 📊 **Beranda / Dashboard** | Statistik persentase kehadiran, grid ringkasan (total presensi, terlambat, siswa aktif), aktivitas terbaru |
| 🕐 **Riwayat Presensi** | Riwayat kehadiran per siswa |
| 🔔 **Notifikasi Toast** | Feedback sukses / gagal pada semua aksi simpan & hapus |
| 📴 **Mode Offline** | Fallback ke `AsyncStorage` saat Supabase tidak dikonfigurasi / offline |

---

## 🛠️ Tech Stack

| Teknologi | Versi | Badge |
| --- | --- | --- |
| Expo SDK | `~54.0.35` | ![Expo](https://img.shields.io/badge/Expo-54.0.35-000000?logo=expo&logoColor=white) |
| React Native | `0.81.5` | ![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?logo=react&logoColor=white) |
| React | `19.1.0` | ![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react&logoColor=white) |
| TypeScript | `~5.9.2` | ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript&logoColor=white) |
| Supabase (JS Client) | `^2.112.0` | ![Supabase](https://img.shields.io/badge/Supabase-2.112.0-3ECF8E?logo=supabase&logoColor=white) |
| expo-router | `~6.0.24` | ![expo-router](https://img.shields.io/badge/expo--router-6.0.24-FFFFFF) |
| expo-camera | `~17.0.10` | ![expo-camera](https://img.shields.io/badge/expo--camera-17.0.10-FFFFFF) |
| React Native Safe Area Context | `~5.6.0` | ![safe-area](https://img.shields.io/badge/safe--area--context-5.6.0-FFFFFF) |
| AsyncStorage | `2.2.0` | ![async-storage](https://img.shields.io/badge/AsyncStorage-2.2.0-FFFFFF) |
| React Native Reanimated | `~4.1.1` | ![reanimated](https://img.shields.io/badge/Reanimated-4.1.1-FFFFFF) |
| react-native-keyboard-aware-scroll-view | `^0.9.5` | ![keyboard-aware](https://img.shields.io/badge/keyboard--aware--scroll--view-0.9.5-FFFFFF) |

**Backend (Database):** Supabase / PostgreSQL — lihat [Skema Database](#-skema-database)

---

## 📁 Struktur Proyek

```
AbsensiMagang/
├── app/                    # File-based routing (expo-router)
│   ├── (tabs)/             # Tab navigasi utama
│   │   ├── index.tsx       #   Beranda / Dashboard (statistik)
│   │   ├── students.tsx    #   Data Siswa (CRUD)
│   │   ├── scan.tsx        #   Scanner QR Absensi
│   │   ├── schools.tsx     #   Data Sekolah (CRUD)
│   │   └── profile.tsx     #   Profil
│   ├── _layout.tsx         # Root layout (Stack navigator)
│   ├── login.tsx           # Halaman login (menampilkan versi aplikasi)
│   ├── auth-loading.tsx    # Loading transisi autentikasi
│   ├── tambah-siswa.tsx    # Form tambah / edit siswa
│   ├── tambah-sekolah.tsx  # Form tambah / edit sekolah
│   └── student-detail.tsx  # Detail siswa + kartu QR + riwayat
├── components/             # Komponen reusable (Toast, Skeleton, dll)
├── constants/              # Tema & palet warna (light / sunset)
├── context/                # AppContext & ThemeContext (state global + tema)
├── services/               # Integrasi Supabase (student & school service)
├── lib/                    # Konfigurasi client Supabase
├── types/                  # Definisi tipe TypeScript
├── sql/                    # Skema & query database Supabase
└── app.json                # Konfigurasi aplikasi Expo
```

---

## 🚀 Cara Menjalankan

### Prasyarat

- [Node.js](https://nodejs.org/) (LTS)
- [Expo Go](https://expo.dev/go) di perangkat / Android Studio / Xcode
- Akun [Supabase](https://supabase.com/) (opsional, untuk mode online)

### 1. Instal Dependensi

```bash
npm install
```

### 2. Konfigurasi Environment (Opsional)

Buat file `.env` di root proyek (contoh ada di `.env` yang sudah ada):

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> Tanpa `.env`, aplikasi tetap berjalan dalam **mode offline** (penyimpanan lokal `AsyncStorage`).

### 3. Jalankan Aplikasi

```bash
npx expo start
```

Lalu pilih salah satu opsi di terminal:

- `a` — Android emulator
- `i` — iOS simulator
- `w` — Web browser
- Scan QR dengan **Expo Go** di perangkat fisik

### Skrip NPM

| Perintah | Fungsi |
| --- | --- |
| `npm start` | Menjalankan server Expo |
| `npm run android` | Menjalankan di Android (`expo run:android`) |
| `npm run ios` | Menjalankan di iOS (`expo run:ios`) |
| `npm run web` | Menjalankan versi web |
| `npm run lint` | Menjalankan ESLint |
| `npm run type-check` | Memeriksa tipe TypeScript |

---

## 🗄️ Skema Database

Jalankan `sql/crud_siswa_sekolah.sql` di **Supabase Dashboard → SQL Editor**.

Tabel utama:

- **`schools`** — data sekolah mitra (nama, NPSN, alamat, email, telepon, status)
- **`students`** — data siswa (NIS, nama, relasi ke sekolah, domisili, kontak, status)
- RLS aktif dengan kebijakan *public read/write* (khusus fase pengembangan)

---

## 📌 Roadmap

- [x] Scan QR presensi (kamera + manual NIS)
- [x] CRUD data siswa & sekolah
- [x] Riwayat presensi & statistik
- [ ] Check-in / Check-out (dua sesi presensi)
- [ ] Autentikasi & manajemen peran (admin / siswa)
- [ ] Generate kartu QR per siswa (unduh / cetak)
- [ ] Laporan presensi bulanan (export)

---

## 📝 Riwayat Perubahan (Changelog)

### v1.2.0 — 5 Agustus 2026

- 🔐 **Halaman login premium** — desain ulang Material Design 3: kartu gradien, input full-width dengan label & state focus/error/success, tombol ripple + animasi loading, background blob dekoratif
- 🔑 **Autentikasi demo** — validasi email & password (min. 6 karakter), "Remember Me" (email tersimpan), tombol "Lupa Password", sesi tersimpan di `AsyncStorage` (`@magangku_auth`)
- ⏳ **Transisi loading** — `auth-loading.tsx`: skeleton screen saat muat data setelah login sebelum masuk ke tab utama
- 🧭 **Route guard** — pengalihan otomatis ke halaman login jika belum masuk (`_layout.tsx`)
- 🍞 **Perbaikan Toast** — posisi & tinggi notifikasi disesuaikan dengan safe-area insets agar tidak terpotong
- ⚡ **Optimasi performa** — baris list siswa & sekolah di-memoize (`React.memo`), kamera QR otomatis dijeda saat pindah tab, penyimpanan `AsyncStorage` di-debounce, pembersihan log konsol
- ⌨️ **Perbaikan keyboard login** — `KeyboardAvoidingView` + scroll agar form tidak tertutup keyboard (fix mode edge-to-edge)

### v1.1.0 — 5 Agustus 2026

- 🎨 **Tema disederhanakan** — palet `dark` dihapus; mode tema kini `Auto` / `Terang` / `Senja` (malam otomatis hangat senja, aksen warna lebih kalem)
- 📊 **Dashboard** — section "Akses Cepat" diganti **Statistik**: persentase kehadiran (progress bar), total presensi, terlambat, siswa aktif & tidak aktif
- 🧹 **Kartu siswa** — badge kehadiran dihapus agar tampilan lebih bersih
- ⌨️ **Perbaikan scroll form** — `KeyboardAwareScrollView` + `softwareKeyboardLayoutMode: "resize"` agar field bawah form tetap terlihat & bisa di-scroll saat keyboard muncul (mencegah salah input)
- 🔤 **Perbaikan kontras** — teks badge kehadiran di halaman detail siswa kini terbaca jelas (`onPrimaryContainer`)
- ➕ **Dependensi baru** — `react-native-keyboard-aware-scroll-view ^0.9.5`

### v1.0.0

- Rilis awal: scan QR presensi, CRUD siswa & sekolah, riwayat presensi, dashboard, mode offline (AsyncStorage)

---

## 📄 Lisensi

Hak cipta © 2026 **AbsensiMagang**. Proyek ini untuk keperluan internal pengembangan aplikasi presensi magang.
# Absensi_Magang_STIKOM
