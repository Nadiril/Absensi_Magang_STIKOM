import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { StudentCardSkeleton } from '../../components/Skeleton';
import { Toast, ToastData } from '../../components/Toast';

export default function StudentsScreen() {
  const router = useRouter();
  const { students, schools, deleteStudent, deleteAllStudents, isLoading, refreshData } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('Semua');
  const [toast, setToast] = useState<ToastData | null>(null);

  const hideToast = useCallback(() => setToast(null), []);

  const handleDeleteStudent = useCallback(
    (student: Student) => {
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
                .then(() =>
                  setToast({ type: 'success', message: `Siswa ${student.name} berhasil dihapus` })
                )
                .catch(() => setToast({ type: 'error', message: 'Gagal menghapus siswa.' }));
            },
          },
        ]
      );
    },
    [deleteStudent]
  );

  const handleClearStudents = useCallback(() => {
    Alert.alert(
      'Hapus Semua Data Siswa',
      'Apakah Anda yakin ingin menghapus seluruh data siswa?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus Semua', style: 'destructive', onPress: () => deleteAllStudents() },
      ]
    );
  }, [deleteAllStudents]);

  // Memoized filter calculation
  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return (students || []).filter((s) => {
      if (!s) return false;
      const studentName = s.name || '';
      const studentNis = s.nis || '';
      const matchesSearch =
        !query ||
        studentName.toLowerCase().includes(query) ||
        studentNis.toLowerCase().includes(query);
      const matchesSchool =
        selectedSchool === 'Semua' || (s.schoolName || '') === selectedSchool;
      return matchesSearch && matchesSchool;
    });
  }, [students, searchQuery, selectedSchool]);

  const schoolFilterData = useMemo(
    () => ['Semua', ...Array.from(new Set((schools || []).map((sch) => sch.name).filter(Boolean)))],
    [schools]
  );

  const renderStudentItem = useCallback(
    ({ item }: { item: Student }) => (
      <View style={styles.studentCard}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push({ pathname: '/student-detail', params: { id: item.id } })}
        >
          <View style={styles.cardHeader}>
            {item.avatarUrl ? (
              <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>{(item.name || '?').charAt(0)}</Text>
              </View>
            )}

            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{item.name || 'Tanpa Nama'}</Text>
              <Text style={styles.studentNis}>NIS: {item.nis || '-'}</Text>
              <Text style={styles.studentSchool}>
                {item.schoolName || 'Sekolah'} • {item.classGrade || '-'}
              </Text>
            </View>

            <View style={styles.rateBadge}>
              <Text style={styles.rateText}>{item.attendanceRate ?? 100}%</Text>
              <Text style={styles.rateLabel}>Hadir</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{item.status || 'Aktif'}</Text>
            </View>
            <Text style={styles.emailText}>{item.email || '-'}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() =>
              router.push({ pathname: '/tambah-siswa', params: { id: item.id } })
            }
          >
            <Ionicons name="create-outline" size={16} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDelete]}
            activeOpacity={0.7}
            onPress={() => handleDeleteStudent(item)}
          >
            <Ionicons name="trash-outline" size={16} color={Colors.error} />
            <Text style={[styles.actionBtnText, styles.actionBtnTextDelete]}>Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [router, handleDeleteStudent]
  );

  const studentKeyExtractor = useCallback((item: Student, index: number) => item?.id || `std-${index}`, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Search & Filter Header */}
      <View style={styles.headerArea}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.pageTitle}>Data Siswa</Text>
            <Text style={styles.pageSubtitle}>Kelola profil, informasi, dan presensi siswa</Text>
          </View>
          {(students || []).length > 0 && (
            <TouchableOpacity onPress={handleClearStudents} style={{ padding: 6 }}>
              <Ionicons name="trash-outline" size={22} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari siswa berdasarkan nama / NIS..."
            placeholderTextColor={Colors.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.outline} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Chips */}
        <FlatList
          horizontal
          data={schoolFilterData}
          keyExtractor={(item, index) => `chip-${item}-${index}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                selectedSchool === item ? styles.chipActive : null,
              ]}
              onPress={() => setSelectedSchool(item)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedSchool === item ? styles.chipTextActive : null,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Student List */}
      {isLoading ? (
        <View style={styles.listContent}>
          <StudentCardSkeleton />
          <StudentCardSkeleton />
          <StudentCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={studentKeyExtractor}
          renderItem={renderStudentItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refreshData} colors={[Colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="person-outline" size={48} color={Colors.outline} />
              <Text style={styles.emptyTitle}>Siswa tidak ditemukan</Text>
              <Text style={styles.emptySubtitle}>
                Coba sesuaikan kata kunci pencarian atau filter sekolah.
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Add Student Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push('/tambah-siswa')}
      >
        <Ionicons name="add" size={28} color={Colors.onPrimary} />
      </TouchableOpacity>

      <Toast toast={toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerArea: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  pageSubtitle: {
    fontSize: 13,
    color: Colors.secondary,
    marginBottom: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.onSurface,
    marginLeft: 8,
  },
  filterList: {
    gap: 8,
    paddingBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerHigh,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: Colors.onPrimary,
  },
  listContent: {
    padding: 20,
    paddingBottom: 90,
  },
  studentCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  studentNis: {
    fontSize: 12,
    color: Colors.secondary,
    marginBottom: 2,
  },
  studentSchool: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  rateBadge: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rateText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  rateLabel: {
    fontSize: 10,
    color: Colors.secondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tertiaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.onTertiaryContainer,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onTertiaryContainer,
  },
  emailText: {
    fontSize: 12,
    color: Colors.secondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerLow,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLow,
  },
  actionBtnDelete: {
    backgroundColor: '#fef2f2',
    borderColor: Colors.errorContainer,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  actionBtnTextDelete: {
    color: Colors.error,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.onSurface,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.secondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
});
