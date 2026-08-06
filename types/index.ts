export interface Student {
  id: string;
  name: string;
  nis: string;
  schoolId: string;
  schoolName: string;
  email?: string;
  domisili?: string;
  studentPhone?: string;
  guardianPhone?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  attendanceRate: number; // e.g. 96
  status: 'Aktif' | 'Izin' | 'Sakit' | 'Alpha';
  avatarUrl?: string;
}

export interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  studentCount: number;
  status: 'Aktif' | 'Pending' | 'Nonaktif';
  logoUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  schoolName: string;
  nis: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  type: 'Check-In' | 'Check-Out';
  status: 'Hadir' | 'Terlambat';
}

export interface AttendanceSettings {
  checkInLimit: string; // HH:MM
}

export interface ActivityLog {
  id: string;
  title: string;
  time: string;
  subtitle: string;
  icon: string;
  colorType: 'primary' | 'tertiary' | 'surface';
}
