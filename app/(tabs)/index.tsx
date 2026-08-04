import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { StatCardSkeleton, ActivityCardSkeleton } from '../../components/Skeleton';

export default function DashboardScreen() {
  const router = useRouter();
  const { students, schools, activities, isLoading, refreshData } = useApp();
  const [activeQuickIndex, setActiveQuickIndex] = useState(0);

  const handleQuickScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const itemWidth = 182; // 170 width + 12 gap
    const index = Math.min(2, Math.max(0, Math.round(contentOffsetX / itemWidth)));
    setActiveQuickIndex(index);
  }, []);

  const formattedDate = useMemo(
    () =>
      new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} colors={[Colors.primary]} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back, Admin</Text>
          <Text style={styles.welcomeDate}>{formattedDate}</Text>
        </View>

        {/* Stat Cards Grid */}
        <View style={styles.statsGrid}>
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              {/* Total Students */}
              <TouchableOpacity
                style={styles.statCard}
                activeOpacity={0.8}
                onPress={() => router.push('/students')}
              >
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>TOTAL SISWA</Text>
                  <Text style={styles.statValue}>{students.length}</Text>
                </View>
                <View style={[styles.statIconContainer, { backgroundColor: Colors.primaryContainer }]}>
                  <Ionicons name="school" size={24} color={Colors.onPrimaryContainer} />
                </View>
              </TouchableOpacity>

              {/* Registered Schools */}
              <TouchableOpacity
                style={styles.statCard}
                activeOpacity={0.8}
                onPress={() => router.push('/schools')}
              >
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>TERDAFTAR SEKOLAH</Text>
                  <Text style={styles.statValue}>{schools.length}</Text>
                </View>
                <View style={[styles.statIconContainer, { backgroundColor: Colors.tertiaryContainer }]}>
                  <Ionicons name="business" size={24} color={Colors.onTertiaryContainer} />
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Quick Access Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Akses Cepat</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleQuickScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.quickAccessList}
        >
          <TouchableOpacity
            style={styles.quickCard}
            activeOpacity={0.7}
            onPress={() => router.push('/students')}
          >
            <View style={styles.quickIconBg}>
              <Ionicons name="people" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.quickCardTitle}>Data Siswa</Text>
            <Text style={styles.quickCardDesc}>Kelola profil & data siswa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            activeOpacity={0.7}
            onPress={() => router.push('/schools')}
          >
            <View style={styles.quickIconBg}>
              <Ionicons name="business" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.quickCardTitle}>Data Sekolah</Text>
            <Text style={styles.quickCardDesc}>Informasi sekolah mitra</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            activeOpacity={0.7}
            onPress={() => router.push('/scan')}
          >
            <View style={styles.quickIconBg}>
              <Ionicons name="qr-code" size={22} color={Colors.tertiary} />
            </View>
            <Text style={styles.quickCardTitle}>Absensi QR</Text>
            <Text style={styles.quickCardDesc}>Scan QR presensi harian</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Akses Cepat Pagination Dots */}
        <View style={styles.paginationDotsRow}>
          {[0, 1, 2].map((idx) => (
            <View
              key={idx}
              style={[
                styles.paginationDot,
                activeQuickIndex === idx ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Recent Activity Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
        </View>

        <View style={styles.activityContainer}>
          {isLoading ? (
            <>
              <ActivityCardSkeleton />
              <ActivityCardSkeleton />
              <ActivityCardSkeleton />
            </>
          ) : activities.length === 0 ? (
            <Text style={{ fontSize: 13, color: Colors.secondary, padding: 12 }}>Belum ada aktivitas terbaru.</Text>
          ) : (
            activities.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.activityItem,
                  index === activities.length - 1 ? styles.lastActivityItem : null,
                ]}
              >
                <View
                  style={[
                    styles.activityIconBg,
                    item.colorType === 'primary' && { backgroundColor: Colors.primaryContainer },
                    item.colorType === 'tertiary' && { backgroundColor: Colors.tertiaryContainer },
                    item.colorType === 'surface' && { backgroundColor: Colors.surfaceContainerHigh },
                  ]}
                >
                  <Ionicons
                    name={
                      item.icon === 'person-add'
                        ? 'person-add'
                        : item.icon === 'checkmark-circle'
                        ? 'checkmark-circle'
                        : 'school'
                    }
                    size={20}
                    color={
                      item.colorType === 'primary'
                        ? Colors.onPrimaryContainer
                        : item.colorType === 'tertiary'
                        ? Colors.onTertiaryContainer
                        : Colors.onSurfaceVariant
                    }
                  />
                </View>

                <View style={styles.activityContent}>
                  <View style={styles.activityTitleRow}>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    <Text style={styles.activityTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  welcomeDate: {
    fontSize: 14,
    color: Colors.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.primary,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  quickAccessList: {
    gap: 12,
    paddingBottom: 16,
  },
  quickCard: {
    width: 170,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    ...Shadows.sm,
  },
  quickIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  quickCardDesc: {
    fontSize: 12,
    color: Colors.secondary,
    lineHeight: 16,
  },
  paginationDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 20,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: Colors.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: Colors.outlineVariant,
  },
  activityContainer: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    overflow: 'hidden',
    marginTop: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
    gap: 12,
  },
  lastActivityItem: {
    borderBottomWidth: 0,
  },
  activityIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  activityTime: {
    fontSize: 11,
    color: Colors.secondary,
  },
  activitySubtitle: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
});
