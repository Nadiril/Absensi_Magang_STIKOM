import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { School } from '../../types';
import { SchoolCardSkeleton } from '../../components/Skeleton';
import { Toast, ToastData } from '../../components/Toast';

export default function SchoolsScreen() {
  const router = useRouter();
  const { schools, deleteSchool, isLoading, refreshData } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<ToastData | null>(null);

  const hideToast = useCallback(() => setToast(null), []);

  const handleDeleteSchool = useCallback(
    (school: School) => {
      Alert.alert(
        'Hapus Sekolah',
        `Apakah Anda yakin ingin menghapus data sekolah ${school.name}?`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: () => {
              deleteSchool(school.id)
                .then(() =>
                  setToast({ type: 'success', message: `Sekolah ${school.name} berhasil dihapus` })
                )
                .catch(() => setToast({ type: 'error', message: 'Gagal menghapus sekolah.' }));
            },
          },
        ]
      );
    },
    [deleteSchool]
  );

  const filteredSchools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return (schools || []).filter(
      (s) =>
        s &&
        (!query ||
          (s.name || '').toLowerCase().includes(query) ||
          (s.address || '').toLowerCase().includes(query) ||
          (s.phone || '').includes(query))
    );
  }, [schools, searchQuery]);

  const renderSchoolItem = useCallback(
    ({ item }: { item: School }) => (
      <View style={styles.schoolCard}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push({ pathname: '/students' })}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconBg}>
              <Ionicons name="business" size={22} color={Colors.primary} />
            </View>

            <View style={styles.schoolMainInfo}>
              <Text style={styles.schoolName}>{item.name || 'Tanpa Nama'}</Text>
              <Text style={styles.npsnText}>NPSN: {item.npsn || '-'}</Text>
            </View>

            <View style={styles.statusChip}>
              <View style={styles.statusDot} />
              <Text style={styles.statusChipText}>{item.status || 'Aktif'}</Text>
            </View>
          </View>

          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={16} color={Colors.secondary} />
            <Text style={styles.addressText} numberOfLines={2}>
              {item.address || 'Alamat belum diisi'}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.contactInfo}>
              <Ionicons name="call-outline" size={14} color={Colors.secondary} />
              <Text style={styles.contactText}>{item.phone || '-'}</Text>
            </View>
            <View style={styles.contactInfo}>
              <Ionicons name="mail-outline" size={14} color={Colors.secondary} />
              <Text style={styles.contactText} numberOfLines={1}>
                {item.email || '-'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() =>
              router.push({ pathname: '/tambah-sekolah', params: { id: item.id } })
            }
          >
            <Ionicons name="create-outline" size={16} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDelete]}
            activeOpacity={0.7}
            onPress={() => handleDeleteSchool(item)}
          >
            <Ionicons name="trash-outline" size={16} color={Colors.error} />
            <Text style={[styles.actionBtnText, styles.actionBtnTextDelete]}>Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [router, handleDeleteSchool]
  );

  const schoolKeyExtractor = useCallback((item: School, index: number) => item?.id || `sch-${index}`, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar Header */}
      <View style={styles.headerArea}>
        <Text style={styles.pageTitle}>Data Sekolah</Text>
        <Text style={styles.pageSubtitle}>Daftar sekolah mitra dan direktori institusi</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama sekolah / alamat / No. HP..."
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
      </View>

      {/* School List */}
      {isLoading ? (
        <View style={styles.listContent}>
          <SchoolCardSkeleton />
          <SchoolCardSkeleton />
          <SchoolCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={filteredSchools}
          keyExtractor={schoolKeyExtractor}
          renderItem={renderSchoolItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refreshData} colors={[Colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={48} color={Colors.outline} />
              <Text style={styles.emptyTitle}>Sekolah tidak ditemukan</Text>
              <Text style={styles.emptySubtitle}>
                Coba gunakan kata kunci nama atau NPSN sekolah yang berbeda.
              </Text>
            </View>
          }
        />
      )}

      {/* FAB Add School */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push('/tambah-sekolah')}
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
    paddingVertical: 16,
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
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.onSurface,
    marginLeft: 8,
  },
  listContent: {
    padding: 20,
    paddingBottom: 90,
  },
  schoolCard: {
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
    marginBottom: 10,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  schoolMainInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  npsnText: {
    fontSize: 12,
    color: Colors.secondary,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tertiaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.onTertiaryContainer,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onTertiaryContainer,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
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
