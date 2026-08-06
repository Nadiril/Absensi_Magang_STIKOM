-- ============================================================
-- SETUP DATABASE LENGKAP AbsensiMagang (dari awal)
-- Jalankan sekali di Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- 1. HAPUS TABEL LAMA (urutan terbalik dari dependensi)
-- ============================================================

DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- ============================================================
-- 2. CREATE TABLES
-- ============================================================

-- Tabel Sekolah Mitra
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  npsn TEXT,
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Aktif',
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel Siswa
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nis TEXT NOT NULL,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_grade TEXT,
  email TEXT,
  domisili TEXT,
  student_phone TEXT,
  guardian_phone TEXT,
  start_date DATE,
  end_date DATE,
  attendance_rate NUMERIC NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'Aktif',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel Rekam Presensi (Check-in / Check-out)
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  school_name TEXT NOT NULL DEFAULT '',
  nis TEXT NOT NULL,
  date DATE NOT NULL,            -- YYYY-MM-DD
  timestamp TEXT NOT NULL,       -- HH:MM
  type TEXT NOT NULL CHECK (type IN ('Check-In', 'Check-Out')),
  status TEXT NOT NULL CHECK (status IN ('Hadir', 'Terlambat')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel Pengaturan Aplikasi (key-value)
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. MIGRASI PERIODE MAGANG (untuk DB yang sudah ada).
-- Aman dijalankan berulang; abaikan jika setup dari awal.
-- ============================================================

ALTER TABLE students ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS end_date DATE;

-- ============================================================
-- 4. INDEX
-- ============================================================

CREATE INDEX idx_attendance_student_date ON attendance_records (student_id, date);
CREATE INDEX idx_attendance_date ON attendance_records (date);
CREATE INDEX idx_students_school ON students (school_id);

-- ============================================================
-- 5. ROW LEVEL SECURITY (publik baca/tulis — fase pengembangan)
-- ============================================================

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public crud schools" ON schools FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public crud students" ON students FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public crud attendance_records" ON attendance_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public crud app_settings" ON app_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 6. DATA AWAL (opsional — hapus jika tidak dibutuhkan)
-- ============================================================

-- Pengaturan jam batas check-in (default 08:00)
-- INSERT INTO app_settings (key, value) VALUES ('check_in_limit', '08:00')
-- ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- -- Contoh sekolah & siswa
-- INSERT INTO schools (name, npsn, address, phone, status) VALUES
-- ('SMK Negeri 1 Contoh', '12345678', 'Jl. Merdeka No. 1', '021123456', 'Aktif');

-- INSERT INTO students (name, nis, school_id, start_date, end_date, status)
-- SELECT 'Budi Santoso', '2024001', id, '2026-08-03', '2026-11-27', 'Aktif' FROM schools WHERE name = 'SMK Negeri 1 Contoh';

-- INSERT INTO students (name, nis, school_id, start_date, end_date, status)
-- SELECT 'Siti Aminah', '2024002', id, '2026-08-03', '2026-11-27', 'Aktif' FROM schools WHERE name = 'SMK Negeri 1 Contoh';

-- ============================================================
-- 7. QUERY CONTOH
-- ============================================================

-- CRUD SISWA: semua siswa + nama sekolah
-- SELECT s.*, sc.name AS school_name
-- FROM students s
-- LEFT JOIN schools sc ON sc.id = s.school_id
-- ORDER BY s.created_at DESC;

-- CRUD SEKOLAH: semua sekolah + jumlah siswa
-- SELECT sc.*, COUNT(st.id) AS student_count
-- FROM schools sc
-- LEFT JOIN students st ON st.school_id = sc.id
-- GROUP BY sc.id
-- ORDER BY sc.created_at DESC;

-- INSERT presensi (aman: ambil siswa terbaru)
-- INSERT INTO attendance_records (student_id, student_name, school_name, nis, date, timestamp, type, status)
-- SELECT id, name, 'SMK Negeri 1 Contoh', nis, CURRENT_DATE, '07:58', 'Check-In', 'Hadir'
-- FROM students ORDER BY created_at DESC LIMIT 1;

-- Sesi masuk & pulang per siswa per hari
-- SELECT student_id, date,
--   MAX(CASE WHEN type = 'Check-In'  THEN timestamp END) AS check_in,
--   MAX(CASE WHEN type = 'Check-Out' THEN timestamp END) AS check_out,
--   MAX(CASE WHEN type = 'Check-In' AND status = 'Terlambat' THEN 'Terlambat' ELSE 'Hadir' END) AS status_hari
-- FROM attendance_records
-- WHERE date = CURRENT_DATE
-- GROUP BY student_id, date
-- ORDER BY date DESC;

-- Statistik hari ini
-- SELECT
--   COUNT(DISTINCT student_id) FILTER (WHERE type = 'Check-In')  AS total_masuk,
--   COUNT(DISTINCT student_id) FILTER (WHERE type = 'Check-Out') AS total_pulang,
--   COUNT(*) FILTER (WHERE type = 'Check-In' AND status = 'Terlambat') AS terlambat
-- FROM attendance_records
-- WHERE date = CURRENT_DATE;

-- Baca jam batas check-in
-- SELECT value FROM app_settings WHERE key = 'check_in_limit';
