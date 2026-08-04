-- =================================================================
-- SKEMA DATABASE SUPABASE / POSTGRESQL UNTUK MAGANGHUB
-- Jalankan query ini di Supabase SQL Editor (Dashboard > SQL Editor)
-- =================================================================

-- 1. Buat Tabel Schools (Sekolah)
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  npsn TEXT UNIQUE NOT NULL,
  address TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Pending', 'Nonaktif')),
  logo_url TEXT
);

-- 2. Buat Tabel Students (Siswa)
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  nis TEXT UNIQUE NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  class_grade TEXT,
  email TEXT,
  domisili TEXT,
  student_phone TEXT,
  guardian_phone TEXT,
  attendance_rate NUMERIC DEFAULT 100,
  status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Izin', 'Sakit', 'Alpha')),
  avatar_url TEXT
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 4. Kebijakan RLS (Public Access untuk Fase Pengembangan & Testing)
DROP POLICY IF EXISTS "Allow public read/write access to schools" ON public.schools;
CREATE POLICY "Allow public read/write access to schools" 
  ON public.schools FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read/write access to students" ON public.students;
CREATE POLICY "Allow public read/write access to students" 
  ON public.students FOR ALL USING (true) WITH CHECK (true);

-- 5. View Detail Siswa (Optional: JOIN data Siswa & Sekolah)
CREATE OR REPLACE VIEW public.v_students_detail AS
SELECT 
  s.id,
  s.created_at,
  s.name,
  s.nis,
  s.school_id AS "schoolId",
  sch.name AS "schoolName",
  s.class_grade AS "classGrade",
  s.email,
  s.domisili,
  s.student_phone AS "studentPhone",
  s.guardian_phone AS "guardianPhone",
  s.attendance_rate AS "attendanceRate",
  s.status,
  s.avatar_url AS "avatarUrl"
FROM public.students s
LEFT JOIN public.schools sch ON s.school_id = sch.id;
