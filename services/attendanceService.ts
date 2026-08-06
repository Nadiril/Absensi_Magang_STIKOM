import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AttendanceRecord, AttendanceSettings } from '../types';

export const attendanceService = {
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('attendance_records')
      .select('id, student_id, student_name, school_name, nis, date, timestamp, type, status')
      .order('date', { ascending: false })
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching attendance records from Supabase:', error.message);
      throw new Error(error.message);
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      studentId: r.student_id,
      studentName: r.student_name,
      schoolName: r.school_name || '',
      nis: r.nis,
      date: r.date,
      timestamp: r.timestamp,
      type: r.type,
      status: r.status,
    }));
  },

  async insertAttendanceRecord(record: AttendanceRecord): Promise<void> {
    if (!isSupabaseConfigured()) {
      return;
    }

    const { error } = await supabase.from('attendance_records').insert({
      student_id: record.studentId,
      student_name: record.studentName,
      school_name: record.schoolName,
      nis: record.nis,
      date: record.date,
      timestamp: record.timestamp,
      type: record.type,
      status: record.status,
    });

    if (error) {
      console.error('Error inserting attendance record to Supabase:', error.message);
      throw new Error(error.message);
    }
  },

  async getSettings(): Promise<AttendanceSettings | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data, error } = await supabase
      .from('app_settings')
      .select('key, value')
      .eq('key', 'check_in_limit')
      .maybeSingle();

    if (error) {
      console.error('Error fetching settings from Supabase:', error.message);
      throw new Error(error.message);
    }

    if (!data) return null;
    return { checkInLimit: data.value };
  },

  async upsertSettings(settings: AttendanceSettings): Promise<void> {
    if (!isSupabaseConfigured()) {
      return;
    }

    const { error } = await supabase
      .from('app_settings')
      .upsert(
        { key: 'check_in_limit', value: settings.checkInLimit, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

    if (error) {
      console.error('Error upserting settings to Supabase:', error.message);
      throw new Error(error.message);
    }
  },
};
