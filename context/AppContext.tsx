import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Student, School, AttendanceRecord, ActivityLog } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import { schoolService } from '../services/schoolService';
import { studentService } from '../services/studentService';

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
  recordAttendance: (nisOrId: string) => { success: boolean; message: string; student?: Student };
  clearAllData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem('@magangku_auth')
      .then((saved) => {
        if (saved === 'logged-in') setIsLoggedIn(true);
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
        const [fetchedSchools, fetchedStudents] = await Promise.all([
          schoolService.getSchools(),
          studentService.getStudents(),
        ]);
        setSchools(fetchedSchools);
        setStudents(fetchedStudents);
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

      if (savedStudents) setStudents(JSON.parse(savedStudents));
      if (savedSchools) setSchools(JSON.parse(savedSchools));
      if (savedAttendance) setAttendanceRecords(JSON.parse(savedAttendance));
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
    const t = setTimeout(() => {
      AsyncStorage.setItem('@magangku_attendance', JSON.stringify(attendanceRecords)).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [attendanceRecords]);

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
        const id = `std-${Date.now()}`;
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

      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          title: 'Siswa Baru Terdaftar',
          subtitle: `${newStudentData.name} - ${newStudentData.schoolName}`,
          time: 'Baru saja',
          icon: 'person-add',
          colorType: 'primary',
        },
        ...prev,
      ]);
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
        const id = `sch-${Date.now()}`;
        const newSchool: School = { ...newSchoolData, id };
        setSchools((prev) => [newSchool, ...prev]);
      }

      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          title: 'Sekolah Baru Ditambahkan',
          subtitle: newSchoolData.name,
          time: 'Baru saja',
          icon: 'school',
          colorType: 'surface',
        },
        ...prev,
      ]);
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
    (nisOrId: string) => {
      const target = students.find(
        (s) => s.nis.toLowerCase() === nisOrId.trim().toLowerCase() || s.id === nisOrId.trim()
      );

      if (!target) {
        return {
          success: false,
          message: `Siswa dengan NIS/ID "${nisOrId}" tidak ditemukan.`,
        };
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        studentId: target.id,
        studentName: target.name,
        schoolName: target.schoolName,
        nis: target.nis,
        timestamp: timeStr,
        type: 'Check-In',
        status: 'Hadir',
      };

      setAttendanceRecords((prev) => [newRecord, ...prev]);

      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          title: 'Presensi Berhasil',
          subtitle: `Siswa: ${target.name} - NIS: ${target.nis}`,
          time: `Hari ini, ${timeStr}`,
          icon: 'checkmark-circle',
          colorType: 'tertiary',
        },
        ...prev,
      ]);

      return {
        success: true,
        message: `Presensi berhasil untuk ${target.name} (${target.schoolName})`,
        student: target,
      };
    },
    [students]
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
    setActivities([]);
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
