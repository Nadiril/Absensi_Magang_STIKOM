import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Shadows } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Toast, ToastData } from '../components/Toast';

export default function StudentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { students, attendanceRecords, deleteStudent } = useApp();

  const [toast, setToast] = useState<ToastData | null>(null);
  const backTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (backTimer.current) clearTimeout(backTimer.current);
    };
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  const student = useMemo(() => students.find((s) => s.id === id), [students, id]);

  const studentHistory = useMemo(() => {
    if (!student) return [];
    return attendanceRecords.filter((r) => r.studentId === student.id || r.nis === student.nis);
  }, [attendanceRecords, student]);

  const handleDelete = useCallback(() => {
    if (!student) return;
    Alert.alert(
      'Hapus Siswa',
      `Apakah Anda yakin ingin menghapus data siswa ${student.name}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            deleteStudent(student.id)
              .then(() => {
                setToast({ type: 'success', message: `Siswa ${student.name} berhasil dihapus` });
                backTimer.current = setTimeout(() => router.back(), 900);
              })
              .catch(() => setToast({ type: 'error', message: 'Gagal menghapus siswa.' }));
          },
        },
      ]
    );
  }, [student, deleteStudent, router]);

  if (!student) {
    return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={Colors.error} />
          <Text style={styles.notFoundTitle}>Siswa Tidak Ditemukan</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Profile Card */}
        <View style={styles.profileCard}>
          {student.avatarUrl ? (
            <Image source={{ uri: student.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{student.name.charAt(0)}</Text>
            </View>
          )}

          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentNis}>NIS: {student.nis}</Text>
          
          <View style={styles.badgeRow}>
            <View style={styles.rateBadge}>
              <Text style={styles.rateText}>{student.attendanceRate}% Kehadiran</Text>
            </View>
          </View>
        </View>

        {/* QR Code Virtual Card */}
        <View style={styles.qrCard}>
          <View style={styles.qrHeader}>
            <Ionicons name="qr-code-outline" size={20} color={Colors.primary} />
            <Text style={styles.qrTitle}>Kartu QR Presensi Siswa</Text>
          </View>
          <Text style={styles.qrSubtitle}>Tunjukkan QR Code ini ke kamera presensi saat masuk/pulang</Text>
          
          <View style={styles.qrBox}>
            <Ionicons name="qr-code" size={140} color={Colors.onSurface} />
            <Text style={styles.qrNisText}>NIS: {student.nis}</Text>
          </View>
        </View>

        {/* Details Information */}
        <View style={styles.infoCard}>
          <Text style={styles.infoSectionTitle}>Detail Informasi</Text>

          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={20} color={Colors.outline} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Sekolah Mitra</Text>
              <Text style={styles.infoValue}>{student.schoolName}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="home-outline" size={20} color={Colors.outline} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Domisili Siswa</Text>
              <Text style={styles.infoValue}>{student.domisili || '-'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={Colors.outline} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>No. HP Siswa</Text>
              <Text style={styles.infoValue}>{student.studentPhone || '-'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={20} color={Colors.outline} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>No. HP Wali Siswa</Text>
              <Text style={styles.infoValue}>{student.guardianPhone || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Attendance History */}
        <View style={styles.historyCard}>
          <Text style={styles.infoSectionTitle}>Riwayat Presensi ({studentHistory.length})</Text>

          {studentHistory.length === 0 ? (
            <Text style={styles.emptyHistory}>Belum ada riwayat presensi tercatat hari ini.</Text>
          ) : (
            studentHistory.map((rec) => (
              <View key={rec.id} style={styles.historyItem}>
                <Ionicons name="checkmark-circle" size={22} color={Colors.tertiary} />
                <View style={styles.historyTextGroup}>
                  <Text style={styles.historyType}>{rec.type} - {rec.status}</Text>
                  <Text style={styles.historyTime}>{rec.timestamp}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.editBtn}
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/tambah-siswa', params: { id: student.id } })}
        >
          <Ionicons name="create-outline" size={20} color={Colors.primary} />
          <Text style={styles.editBtnText}>Edit Data Siswa</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.8} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
          <Text style={styles.deleteBtnText}>Hapus Data Siswa</Text>
        </TouchableOpacity>
      </ScrollView>

      <Toast toast={toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
    marginTop: 12,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  backBtnText: {
    color: Colors.onPrimary,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginBottom: 16,
    ...Shadows.sm,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: Colors.primaryContainer,
  },
  avatarFallback: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: Colors.primaryFixed,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  studentNis: {
    fontSize: 13,
    color: Colors.secondary,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rateBadge: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  rateText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  qrCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginBottom: 16,
    ...Shadows.sm,
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.1,
  },
  qrSubtitle: {
    fontSize: 12,
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 17,
  },
  qrBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    ...Shadows.sm,
  },
  qrNisText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
    marginTop: 10,
  },
  infoCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginBottom: 16,
    ...Shadows.sm,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 16,
    letterSpacing: -0.1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  infoTextGroup: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.secondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  historyCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginBottom: 20,
    ...Shadows.sm,
  },
  emptyHistory: {
    fontSize: 13,
    color: Colors.secondary,
    fontStyle: 'italic',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  historyTextGroup: {
    flex: 1,
  },
  historyType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  historyTime: {
    fontSize: 12,
    color: Colors.secondary,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    gap: 8,
    marginBottom: 12,
    ...Shadows.sm,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.errorContainer,
    backgroundColor: Colors.errorContainer,
    gap: 8,
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onErrorContainer,
  },
});
