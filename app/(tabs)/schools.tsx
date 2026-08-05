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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { School } from '../../types';
import { SchoolCardSkeleton } from '../../components/Skeleton';

export default function SchoolsScreen() {
  const router = useRouter();
  const { schools, isLoading, refreshData } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

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
      </View>
    ),
    [router]
  );

  const schoolKeyExtractor = useCallback((item: School, index: number) => item?.id || `sch-${index}`, []);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {/* Search Bar Header */}
      <View style={styles.headerArea}>
        <Text style={styles.pageTitle}>Data Sekolah</Text>
        <Text style={styles.pageSubtitle}>Daftar sekolah mitra dan direktori institusi</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.onSurfaceVariant} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama sekolah / alamat / No. HP..."
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
              <View style={styles.emptyIconBg}>
                <Ionicons name="business-outline" size={32} color={Colors.primary} />
              </View>
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
        accessibilityRole="button"
        accessibilityLabel="Tambah sekolah"
      >
        <Ionicons name="add" size={28} color={Colors.onPrimary} />
      </TouchableOpacity>
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
    paddingTop: 8,
    paddingBottom: 12,
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
  listContent: {
    padding: 20,
    paddingBottom: 90,
  },
  schoolCard: {
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
    marginBottom: 10,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
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
