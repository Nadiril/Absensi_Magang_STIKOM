import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Student, School, AttendanceRecord, ActivityLog, AttendanceSettings } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import { genId } from '../lib/id';
import { schoolService } from '../services/schoolService';
import { studentService } from '../services/studentService';
import { attendanceService } from '../services/attendanceService';

const formatShortDate = (iso: string): string =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

interface AppContextType {
  students: Student[];
  schools: School[];
  attendanceRecords: AttendanceRecord[];
  activities: ActivityLog[];
  isLoading: boolean;
  isSupabaseActive: boolean;
  isLoggedIn: boolean;
  isAuthReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  deleteAllStudents: () => Promise<void>;
  addSchool: (school: Omit<School, 'id'>) => Promise<void>;
  updateSchool: (id: string, data: Partial<School>) => Promise<void>;
  deleteSchool: (id: string) => Promise<void>;
  deleteAllSchools: () => Promise<void>;
  recordAttendance: (nisOrId: string) => Promise<{
    success: boolean;
    message: string;
    student?: Student;
    type?: 'Check-In' | 'Check-Out';
  }>;
  settings: AttendanceSettings;
  updateSettings: (data: Partial<AttendanceSettings>) => Promise<void>;
  clearAllData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [settings, setSettings] = useState<AttendanceSettings>({ checkInLimit: '08:00' });

  useEffect(() => {
    AsyncStorage.getItem('@magangku_auth')
      .then(() => {
        setIsLoggedIn(true);
      })
      .catch(() => {})
      .finally(() => setIsAuthReady(true));
  }, []);

  // Load initial data from Supabase or AsyncStorage fallback
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const configured = isSupabaseConfigured();
    setIsSupabaseActive(configured);

    if (configured) {
      try {
        const [fetchedSchools, fetchedStudents, fetchedAttendance, fetchedSettings] =
          await Promise.all([
            schoolService.getSchools(),
            studentService.getStudents(),
            attendanceService.getAttendanceRecords(),
            attendanceService.getSettings(),
          ]);
        setSchools(fetchedSchools);
        setStudents(fetchedStudents);
        setAttendanceRecords(fetchedAttendance);

        if (fetchedSettings) {
          setSettings(fetchedSettings);
        } else {
          attendanceService
            .upsertSettings({ checkInLimit: '08:00' })
            .catch((err) => console.error('Failed to seed settings to Supabase:', err));
        }
      } catch (err) {
        console.error('Error fetching data from Supabase, fallback to AsyncStorage:', err);
        await loadFromAsyncStorage();
      }
    } else {
      await loadFromAsyncStorage();
    }
    setIsLoading(false);
  }, []);

  const loadFromAsyncStorage = async () => {
    try {
      const savedStudents = await AsyncStorage.getItem('@magangku_students');
      const savedSchools = await AsyncStorage.getItem('@magangku_schools');
      const savedAttendance = await AsyncStorage.getItem('@magangku_attendance');
      const savedSettings = await AsyncStorage.getItem('@magangku_settings');

      if (savedStudents) setStudents(JSON.parse(savedStudents));
      if (savedSchools) setSchools(JSON.parse(savedSchools));
      if (savedAttendance) setAttendanceRecords(JSON.parse(savedAttendance));
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ checkInLimit: '08:00', ...parsed });
      }
    } catch (e) {
      console.error('Failed to load state from AsyncStorage', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync to AsyncStorage if Supabase is not active (debounced)
  useEffect(() => {
    if (isSupabaseActive) return;
    const t = setTimeout(() => {
      AsyncStorage.setItem('@magangku_students', JSON.stringify(students)).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [students, isSupabaseActive]);

  useEffect(() => {
    if (isSupabaseActive) return;
    const t = setTimeout(() => {
      AsyncStorage.setItem('@magangku_schools', JSON.stringify(schools)).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [schools, isSupabaseActive]);

  useEffect(() => {
    if (isSupabaseActive) return;
    const t = setTimeout(() => {
      AsyncStorage.setItem('@magangku_attendance', JSON.stringify(attendanceRecords)).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [attendanceRecords, isSupabaseActive]);

  const activities = useMemo<ActivityLog[]>(
    () => {
      const todayStr = new Date().toISOString().slice(0, 10);
      return attendanceRecords.map((r) => ({
        id: `act-${r.id}`,
        title: r.type === 'Check-In' ? 'Presensi Hadir' : 'Presensi Pulang',
        subtitle: `Siswa: ${r.studentName} - NIS: ${r.nis}`,
        time: `${r.date === todayStr ? 'Hari ini' : formatShortDate(r.date)}, ${r.timestamp}`,
        icon: 'checkmark-circle',
        colorType: r.type === 'Check-In' ? 'tertiary' : 'primary',
      }));
    },
    [attendanceRecords]
  );

  useEffect(() => {
    const t = setTimeout(() => {
      AsyncStorage.setItem('@magangku_settings', JSON.stringify(settings)).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [settings]);

  // CRUD Actions
  const addStudent = useCallback(
    async (newStudentData: Omit<Student, 'id'>) => {
      if (isSupabaseActive) {
        try {
          const created = await studentService.createStudent(newStudentData);
          setStudents((prev) => [created, ...prev]);

          // Re-fetch schools to update student counts
          const updatedSchools = await schoolService.getSchools();
          setSchools(updatedSchools);
        } catch (err: any) {
          console.error('Failed to add student to Supabase:', err);
          throw err;
        }
      } else {
        const id = genId('std');
        const newStudent: Student = { ...newStudentData, id };
        setStudents((prev) => [newStudent, ...prev]);

        setSchools((prev) =>
          prev.map((sch) =>
            sch.id === newStudent.schoolId || sch.name === newStudent.schoolName
              ? { ...sch, studentCount: sch.studentCount + 1 }
              : sch
          )
        );
      }
    },
    [isSupabaseActive]
  );

  const updateStudent = useCallback(
    async (id: string, data: Partial<Student>) => {
      if (isSupabaseActive) {
        try {
          const updated = await studentService.updateStudent(id, data);
          setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));

          const updatedSchools = await schoolService.getSchools();
          setSchools(updatedSchools);
        } catch (err: any) {
          console.error('Failed to update student in Supabase:', err);
          throw err;
        }
      } else {
        setStudents((prev) =>
          prev.map((s) => {
            if (s.id !== id) return s;

            if (data.schoolId && data.schoolId !== s.schoolId) {
              setSchools((prevSchools) =>
                prevSchools.map((sch) => {
                  if (sch.id === s.schoolId) {
                    return { ...sch, studentCount: Math.max(0, sch.studentCount - 1) };
                  }
                  if (sch.id === data.schoolId) {
                    return { ...sch, studentCount: sch.studentCount + 1 };
                  }
                  return sch;
                })
              );
            }

            return { ...s, ...data };
          })
        );
      }
    },
    [isSupabaseActive]
  );

  const deleteStudent = useCallback(
    async (id: string) => {
      if (isSupabaseActive) {
        try {
          await studentService.deleteStudent(id);
          setStudents((prev) => prev.filter((s) => s.id !== id));
          const updatedSchools = await schoolService.getSchools();
          setSchools(updatedSchools);
        } catch (err: any) {
          console.error('Failed to delete student from Supabase:', err);
          throw err;
        }
      } else {
        setStudents((prev) => prev.filter((s) => s.id !== id));
      }
    },
    [isSupabaseActive]
  );

  const deleteAllStudents = useCallback(async () => {
    if (isSupabaseActive) {
      try {
        await studentService.deleteAllStudents();
        setStudents([]);
        const updatedSchools = await schoolService.getSchools();
        setSchools(updatedSchools);
      } catch (err: any) {
        console.error('Failed to delete all students from Supabase:', err);
        throw err;
      }
    } else {
      setStudents([]);
    }
  }, [isSupabaseActive]);

  const addSchool = useCallback(
    async (newSchoolData: Omit<School, 'id'>) => {
      if (isSupabaseActive) {
        try {
          const created = await schoolService.createSchool(newSchoolData);
          setSchools((prev) => [created, ...prev]);
        } catch (err: any) {
          console.error('Failed to add school to Supabase:', err);
          throw err;
        }
      } else {
        const id = genId('sch');
        const newSchool: School = { ...newSchoolData, id };
        setSchools((prev) => [newSchool, ...prev]);
      }
    },
    [isSupabaseActive]
  );

  const updateSchool = useCallback(
    async (id: string, data: Partial<School>) => {
      if (isSupabaseActive) {
        try {
          const updated = await schoolService.updateSchool(id, data);
          setSchools((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
        } catch (err: any) {
          console.error('Failed to update school in Supabase:', err);
          throw err;
        }
      } else {
        setSchools((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
      }

      if (data.name) {
        setStudents((prev) =>
          prev.map((s) => (s.schoolId === id ? { ...s, schoolName: data.name as string } : s))
        );
      }
    },
    [isSupabaseActive]
  );

  const deleteSchool = useCallback(
    async (id: string) => {
      if (isSupabaseActive) {
        try {
          await schoolService.deleteSchool(id);
          setSchools((prev) => prev.filter((s) => s.id !== id));
          setStudents((prev) => prev.filter((s) => s.schoolId !== id));
        } catch (err: any) {
          console.error('Failed to delete school from Supabase:', err);
          throw err;
        }
      } else {
        setSchools((prev) => prev.filter((s) => s.id !== id));
      }
    },
    [isSupabaseActive]
  );

  const deleteAllSchools = useCallback(async () => {
    if (isSupabaseActive) {
      try {
        await schoolService.deleteAllSchools();
        setSchools([]);
        setStudents([]);
      } catch (err: any) {
        console.error('Failed to delete all schools from Supabase:', err);
        throw err;
      }
    } else {
      setSchools([]);
      setStudents([]);
    }
  }, [isSupabaseActive]);

  const recordAttendance = useCallback(
    async (nisOrId: string) => {
      const raw = nisOrId.trim();
      const parts = raw.split('|');
      const nisPart = (parts[parts.length - 1] || '').trim();
      const namePart = parts.length > 1 ? parts[0].trim() : '';
      const target = students.find(
        (s) =>
          s.nis.toLowerCase() === nisPart.toLowerCase() ||
          s.id === raw ||
          (namePart && s.name.toLowerCase() === namePart.toLowerCase())
      );

      if (!target) {
        return {
          success: false,
          message: `Siswa dengan NIS/ID "${nisOrId}" tidak ditemukan.`,
        };
      }

      if (target.status !== 'Aktif') {
        return {
          success: false,
          message: `${target.name} berstatus Tidak Aktif. Presensi ditolak.`,
        };
      }

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const compareTime = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      const todayRecords = attendanceRecords.filter(
        (r) => r.studentId === target.id && r.date === dateStr
      );
      const hasCheckIn = todayRecords.some((r) => r.type === 'Check-In');
      const hasCheckOut = todayRecords.some((r) => r.type === 'Check-Out');

      if (hasCheckIn && hasCheckOut) {
        return {
          success: false,
          message: `${target.name} sudah absen masuk & pulang hari ini.`,
        };
      }

      const type: 'Check-In' | 'Check-Out' = hasCheckIn ? 'Check-Out' : 'Check-In';
      const status: 'Hadir' | 'Terlambat' =
        type === 'Check-In' && compareTime > settings.checkInLimit ? 'Terlambat' : 'Hadir';

      const newRecord: AttendanceRecord = {
        id: genId('att'),
        studentId: target.id,
        studentName: target.name,
        schoolName: target.schoolName,
        nis: target.nis,
        date: dateStr,
        timestamp: timeStr,
        type,
        status,
      };

      setAttendanceRecords((prev) => [newRecord, ...prev]);

      if (isSupabaseActive) {
        try {
          await attendanceService.insertAttendanceRecord(newRecord);
        } catch (err) {
          console.error('Failed to sync attendance record to Supabase:', err);
        }
      }

      return {
        success: true,
        message:
          type === 'Check-In'
            ? `Check-in berhasil untuk ${target.name} (${target.schoolName})`
            : `Check-out berhasil untuk ${target.name}. Terima kasih!`,
        student: target,
        type,
      };
    },
    [students, attendanceRecords, settings, isSupabaseActive]
  );

  const updateSettings = useCallback(
    async (data: Partial<AttendanceSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...data };
        if (isSupabaseActive) {
          attendanceService
            .upsertSettings(next)
            .catch((err) => console.error('Failed to sync settings to Supabase:', err));
        }
        return next;
      });
    },
    [isSupabaseActive]
  );

  const clearAllData = useCallback(async () => {
    if (isSupabaseActive) {
      try {
        await studentService.deleteAllStudents();
        await schoolService.deleteAllSchools();
      } catch (err: any) {
        console.error('Failed to delete all data from Supabase:', err);
        throw err;
      }
    }
    setStudents([]);
    setSchools([]);
    setAttendanceRecords([]);
    try {
      await AsyncStorage.multiRemove(['@magangku_students', '@magangku_schools', '@magangku_attendance']);
    } catch (e) {
      console.error('Failed to clear data from storage', e);
    }
  }, [isSupabaseActive]);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await AsyncStorage.setItem('@magangku_auth', 'logged-in');
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('@magangku_auth');
    setIsLoggedIn(false);
  }, []);

  const value = useMemo(
    () => ({
      students,
      schools,
      attendanceRecords,
      activities,
      isLoading,
      isSupabaseActive,
      isLoggedIn,
      isAuthReady,
      login,
      logout,
      addStudent,
      updateStudent,
      deleteStudent,
      deleteAllStudents,
      addSchool,
      updateSchool,
      deleteSchool,
      deleteAllSchools,
      recordAttendance,
      settings,
      updateSettings,
      clearAllData,
      refreshData,
    }),
    [
      students,
      schools,
      attendanceRecords,
      activities,
      isLoading,
      isSupabaseActive,
      addStudent,
      updateStudent,
      deleteStudent,
      deleteAllStudents,
      addSchool,
      updateSchool,
      deleteSchool,
      deleteAllSchools,
      recordAttendance,
      settings,
      updateSettings,
      clearAllData,
      refreshData,
      isLoggedIn,
      isAuthReady,
      login,
      logout,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
