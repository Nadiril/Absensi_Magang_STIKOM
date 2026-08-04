export interface Student {
  id: string;
  name: string;
  nis: string;
  schoolId: string;
  schoolName: string;
  classGrade?: string;
  email?: string;
  domisili?: string;
  studentPhone?: string;
  guardianPhone?: string;
  attendanceRate: number; // e.g. 96
  status: 'Aktif' | 'Izin' | 'Sakit' | 'Alpha';
  avatarUrl?: string;
}

export interface School {
  id: string;
  name: string;
  npsn: string;
  address: string;
  email: string;
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
  timestamp: string;
  type: 'Check-In' | 'Check-Out';
  status: 'Hadir' | 'Terlambat';
}

export interface ActivityLog {
  id: string;
  title: string;
  time: string;
  subtitle: string;
  icon: string;
  colorType: 'primary' | 'tertiary' | 'surface';
}
