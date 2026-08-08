import React, { useState, useMemo, useCallback, memo } from 'react';
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
import { Shadows, ThemeColors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { Student } from '../../types';
import { StudentCardSkeleton } from '../../components/Skeleton';

const StudentRow = memo(function StudentRow({
  item,
  onPress,
}: {
  item: Student;
  onPress: (id: string) => void;
}) {
  const { Colors } = useTheme();
  const styles = useMemo(() => createStudentRowStyles(Colors), [Colors]);

  return (
    <View style={styles.studentCard}>
      <TouchableOpacity activeOpacity={0.85} onPress={() => onPress(item.id)}>
        <View style={styles.cardHeader}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{(item.name || '?').charAt(0)}</Text>
            </View>
          )}

          <View style={styles.studentInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.studentName} numberOfLines={1}>
                {item.name || 'Tanpa Nama'}
              </Text>
              {item.status !== 'Aktif' ? (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>Tidak Aktif</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.studentNis}>NIS: {item.nis || '-'}</Text>
            <Text style={styles.studentSchool}>{item.schoolName || 'Sekolah'}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Ionicons name="call-outline" size={13} color={Colors.secondary} />
          <Text style={styles.phoneText}>{item.studentPhone || '-'}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
});

export default function StudentsScreen() {
  const router = useRouter();
  const { students, schools, deleteAllStudents, isLoading, refreshData } = useApp();
  const { Colors } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('Semua');

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

  const studentKeyExtractor = useCallback((item: Student, index: number) => item?.id || `std-${index}`, []);

  const openStudent = useCallback(
    (id: string) => {
      router.push({ pathname: '/student-detail', params: { id } });
    },
    [router]
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
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
          <Ionicons name="search-outline" size={20} color={Colors.onSurfaceVariant} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari siswa berdasarkan nama / NIS..."
            placeholderTextColor={Colors.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
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
              accessibilityRole="button"
              accessibilityState={{ selected: selectedSchool === item }}
            >
              {selectedSchool === item ? (
                <Ionicons name="checkmark" size={16} color={Colors.onPrimaryContainer} />
              ) : null}
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
          renderItem={({ item }) => <StudentRow item={item} onPress={openStudent} />}
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
              <View style={styles.emptyIconBg}>
                <Ionicons name="person-outline" size={32} color={Colors.primary} />
              </View>
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
        accessibilityRole="button"
        accessibilityLabel="Tambah siswa"
      >
        <Ionicons name="add" size={28} color={Colors.onPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (Colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerArea: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 13,
    color: Colors.secondary,
    marginBottom: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 28,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.outline,
    ...Shadows.sm,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.outline,
    marginRight: 6,
    ...Shadows.sm,
  },
  chipActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primaryContainer,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  chipTextActive: {
    color: Colors.onPrimaryContainer,
  },
  listContent: {
    padding: 20,
    paddingBottom: 90,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
});

const createStudentRowStyles = (Colors: ThemeColors) =>
  StyleSheet.create({
    studentCard: {
      backgroundColor: Colors.surfaceContainerLowest,
      borderRadius: 18,
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
      width: 52,
      height: 52,
      borderRadius: 26,
      borderWidth: 2,
      borderColor: Colors.surfaceContainerHigh,
    },
    avatarFallback: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: Colors.primaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: Colors.surfaceContainerHigh,
    },
    avatarInitial: {
      fontSize: 20,
      fontWeight: '700',
      color: Colors.onPrimaryContainer,
    },
    studentInfo: {
      flex: 1,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statusBadge: {
      backgroundColor: Colors.errorContainer,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    statusBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: Colors.onErrorContainer,
    },
    studentName: {
      flexShrink: 1,
      fontSize: 16,
      fontWeight: '700',
      color: Colors.onSurface,
      marginBottom: 2,
      letterSpacing: -0.1,
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
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: Colors.surfaceContainerHigh,
    },
    phoneText: {
      fontSize: 12,
      color: Colors.secondary,
    },
  });
