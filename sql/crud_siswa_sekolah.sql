-- ============================================================
-- CREATE TABLE
-- ============================================================

-- Tabel Sekolah
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
  attendance_rate NUMERIC NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'Aktif',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (biarkan anon/authenticated bisa CRUD)
-- ============================================================

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public crud schools" ON schools FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public crud students" ON students FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- CRUD SISWA
-- ============================================================

-- CREATE (Tambah siswa)
INSERT INTO students (name, nis, school_id, class_grade, email, domisili, student_phone, guardian_phone, attendance_rate, status, avatar_url)
VALUES ('Nama Siswa', '12345', 'UUID-SEKOLAH', 'XI RPL 1', 'email@example.com', 'Alamat', '081234567890', '081298765432', 100, 'Aktif', NULL);

-- READ (Lihat semua siswa + nama sekolah)
SELECT s.*, sc.name AS school_name
FROM students s
LEFT JOIN schools sc ON sc.id = s.school_id
ORDER BY s.created_at DESC;

-- READ (Lihat siswa berdasarkan id)
SELECT s.*, sc.name AS school_name
FROM students s
LEFT JOIN schools sc ON sc.id = s.school_id
WHERE s.id = 'UUID-SISWA';

-- UPDATE (Ubah data siswa)
UPDATE students
SET name = 'Nama Baru',
    nis = '12346',
    school_id = 'UUID-SEKOLAH-BARU',
    class_grade = 'XII RPL 1',
    email = 'baru@example.com',
    domisili = 'Alamat Baru',
    student_phone = '081234567891',
    guardian_phone = '081298765431',
    attendance_rate = 98,
    status = 'Izin',
    avatar_url = 'https://url-avatar.com/a.png',
    updated_at = NOW()
WHERE id = 'UUID-SISWA';

-- DELETE (Hapus satu siswa)
DELETE FROM students WHERE id = 'UUID-SISWA';

-- DELETE (Hapus semua siswa)
DELETE FROM students;

-- ============================================================
-- CRUD SEKOLAH
-- ============================================================

-- CREATE (Tambah sekolah)
INSERT INTO schools (name, address, phone, status, logo_url)
VALUES ('SMK Contoh', 'Jl. Merdeka No. 1', '021123456', 'Aktif', NULL);

-- READ (Lihat semua sekolah + jumlah siswa)
SELECT sc.*, COUNT(st.id) AS student_count
FROM schools sc
LEFT JOIN students st ON st.school_id = sc.id
GROUP BY sc.id
ORDER BY sc.created_at DESC;

-- READ (Lihat sekolah berdasarkan id)
SELECT sc.*, COUNT(st.id) AS student_count
FROM schools sc
LEFT JOIN students st ON st.school_id = sc.id
WHERE sc.id = 'UUID-SEKOLAH'
GROUP BY sc.id;

-- UPDATE (Ubah data sekolah)
UPDATE schools
SET name = 'SMK Contoh Baru',
    address = 'Jl. Baru No. 2',
    phone = '021654321',
    status = 'Pending',
    logo_url = 'https://url-logo.com/l.png',
    updated_at = NOW()
WHERE id = 'UUID-SEKOLAH';

-- DELETE (Hapus satu sekolah)
DELETE FROM schools WHERE id = 'UUID-SEKOLAH';

-- DELETE (Hapus semua sekolah)
DELETE FROM schools;
