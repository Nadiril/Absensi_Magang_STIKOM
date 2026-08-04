import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Student } from '../types';

export const studentService = {
  async getStudents(): Promise<Student[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('students')
      .select('*, schools(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching students from Supabase:', error.message);
      throw new Error(error.message);
    }

    return (data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      nis: s.nis,
      schoolId: s.school_id,
      schoolName: s.schools?.name || s.school_name || 'Sekolah Tidak Ditemukan',
      classGrade: s.class_grade || '',
      email: s.email || '',
      domisili: s.domisili || '',
      studentPhone: s.student_phone || '',
      guardianPhone: s.guardian_phone || '',
      attendanceRate: Number(s.attendance_rate ?? 100),
      status: s.status || 'Aktif',
      avatarUrl: s.avatar_url || undefined,
    }));
  },

  async createStudent(student: Omit<Student, 'id'>): Promise<Student> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase belum dikonfigurasi di file .env');
    }

    const payload = {
      name: student.name,
      nis: student.nis,
      school_id: student.schoolId,
      class_grade: student.classGrade || null,
      email: student.email || null,
      domisili: student.domisili || null,
      student_phone: student.studentPhone || null,
      guardian_phone: student.guardianPhone || null,
      attendance_rate: student.attendanceRate ?? 100,
      status: student.status || 'Aktif',
      avatar_url: student.avatarUrl || null,
    };

    const { data, error } = await supabase
      .from('students')
      .insert([payload])
      .select('*, schools(name)')
      .single();

    if (error) {
      console.error('Error creating student in Supabase:', error.message);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      nis: data.nis,
      schoolId: data.school_id,
      schoolName: data.schools?.name || student.schoolName || 'Sekolah',
      classGrade: data.class_grade || '',
      email: data.email || '',
      domisili: data.domisili || '',
      studentPhone: data.student_phone || '',
      guardianPhone: data.guardian_phone || '',
      attendanceRate: Number(data.attendance_rate ?? 100),
      status: data.status || 'Aktif',
      avatarUrl: data.avatar_url || undefined,
    };
  },

  async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase belum dikonfigurasi di file .env');
    }

    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.nis !== undefined) payload.nis = data.nis;
    if (data.schoolId !== undefined) payload.school_id = data.schoolId;
    if (data.classGrade !== undefined) payload.class_grade = data.classGrade;
    if (data.email !== undefined) payload.email = data.email;
    if (data.domisili !== undefined) payload.domisili = data.domisili;
    if (data.studentPhone !== undefined) payload.student_phone = data.studentPhone;
    if (data.guardianPhone !== undefined) payload.guardian_phone = data.guardianPhone;
    if (data.attendanceRate !== undefined) payload.attendance_rate = data.attendanceRate;
    if (data.status !== undefined) payload.status = data.status;
    if (data.avatarUrl !== undefined) payload.avatar_url = data.avatarUrl;

    const { data: res, error } = await supabase
      .from('students')
      .update(payload)
      .eq('id', id)
      .select('*, schools(name)')
      .single();

    if (error) {
      console.error('Error updating student in Supabase:', error.message);
      throw new Error(error.message);
    }

    return {
      id: res.id,
      name: res.name,
      nis: res.nis,
      schoolId: res.school_id,
      schoolName: res.schools?.name || res.school_name || 'Sekolah',
      classGrade: res.class_grade || '',
      email: res.email || '',
      domisili: res.domisili || '',
      studentPhone: res.student_phone || '',
      guardianPhone: res.guardian_phone || '',
      attendanceRate: Number(res.attendance_rate ?? 100),
      status: res.status || 'Aktif',
      avatarUrl: res.avatar_url || undefined,
    };
  },

  async deleteStudent(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase belum dikonfigurasi di file .env');
    }

    const { error } = await supabase.from('students').delete().eq('id', id);

    if (error) {
      console.error('Error deleting student in Supabase:', error.message);
      throw new Error(error.message);
    }
  },

  async deleteAllStudents(): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase belum dikonfigurasi di file .env');
    }

    // Delete all rows in students table
    const { error } = await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Error deleting all students in Supabase:', error.message);
      throw new Error(error.message);
    }
  },
};
