import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Shadows, ThemeColors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { StatCardSkeleton, ActivityCardSkeleton } from '../../components/Skeleton';

export default function DashboardScreen() {
  const router = useRouter();
  const { students, schools, attendanceRecords, activities, isLoading, refreshData } = useApp();
  const { Colors } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'Selamat pagi, Front Office';
    if (hour >= 11 && hour < 15) return 'Selamat siang, Front Office';
    if (hour >= 15 && hour < 18) return 'Selamat sore, Front Office';
    return 'Selamat malam, Front Office';
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

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const attendedCount = useMemo(
    () =>
      new Set(
        attendanceRecords
          .filter((r) => r.type === 'Check-In' && r.date === todayStr)
          .map((r) => r.studentId)
      ).size,
    [attendanceRecords, todayStr]
  );
  const notPresentCount = Math.max(0, students.length - attendedCount);

  const attendancePercent = useMemo(() => {
    if (students.length === 0) return 0;
    return Math.round((attendedCount / students.length) * 100);
  }, [attendedCount, students.length]);

  const totalCheckIns = useMemo(
    () => attendanceRecords.filter((r) => r.type === 'Check-In').length,
    [attendanceRecords]
  );
  const lateCount = useMemo(
    () => attendanceRecords.filter((r) => r.status === 'Terlambat').length,
    [attendanceRecords]
  );
  const checkedInTodayCount = useMemo(
    () =>
      new Set(
        attendanceRecords
          .filter((r) => r.type === 'Check-In' && r.date === todayStr)
          .map((r) => r.studentId)
      ).size,
    [attendanceRecords, todayStr]
  );
  const checkedOutTodayCount = useMemo(
    () =>
      new Set(
        attendanceRecords
          .filter((r) => r.type === 'Check-Out' && r.date === todayStr)
          .map((r) => r.studentId)
      ).size,
    [attendanceRecords, todayStr]
  );
  const notOutCount = Math.max(0, checkedInTodayCount - checkedOutTodayCount);
  const activeStudents = useMemo(
    () => students.filter((s) => s.status === 'Aktif').length,
    [students]
  );
  const inactiveStudents = useMemo(
    () => students.filter((s) => s.status !== 'Aktif').length,
    [students]
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} colors={[Colors.primary]} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>{greeting}</Text>
          <Text style={styles.welcomeDate}>{formattedDate}</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: Colors.successContainer }]}>
                <Ionicons name="checkmark" size={14} color={Colors.onSuccessContainer} />
              </View>
              <View style={styles.summaryTextGroup}>
                <Text style={styles.summaryValue}>{attendedCount} hadir</Text>
                <Text style={[styles.summaryLabel, { color: Colors.tertiary }]}>Hadir</Text>
              </View>
            </View>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: Colors.errorContainer }]}>
                <Ionicons name="close" size={14} color={Colors.onErrorContainer} />
              </View>
              <View style={styles.summaryTextGroup}>
                <Text style={[styles.summaryValue, { color: Colors.error }]}>{notPresentCount} tidak hadir</Text>
                <Text style={[styles.summaryLabel, { color: Colors.error }]}>Tidak Hadir</Text>
              </View>
            </View>
          </View>
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
                <LinearGradient
                  colors={[Colors.surfaceContainerHigh, Colors.surfaceContainerLowest]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCardGradient}
                >
                  <View style={styles.statInfo}>
                    <Text style={styles.statLabel}>TOTAL SISWA</Text>
                    <Text style={styles.statValue}>{students.length}</Text>
                  </View>
                  <View style={[styles.statIconContainer, { backgroundColor: Colors.primaryContainer }]}>
                    <Ionicons name="people" size={24} color={Colors.onPrimaryContainer} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Registered Schools */}
              <TouchableOpacity
                style={styles.statCard}
                activeOpacity={0.8}
                onPress={() => router.push('/schools')}
              >
                <LinearGradient
                  colors={[Colors.surfaceContainerHigh, Colors.surfaceContainerLowest]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCardGradient}
                >
                  <View style={styles.statInfo}>
                    <Text style={styles.statLabel}>TERDAFTAR SEKOLAH</Text>
                    <Text style={styles.statValue}>{schools.length}</Text>
                  </View>
                  <View style={[styles.statIconContainer, { backgroundColor: Colors.tertiaryContainer }]}>
                    <Ionicons name="business" size={24} color={Colors.onTertiaryContainer} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Statistik Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Statistik</Text>
        </View>

        <View style={styles.attendanceCard}>
          <View style={styles.attendanceCardHeader}>
            <View style={styles.attendanceInfo}>
              <Text style={styles.statLabel}>PERSENTASE KEHADIRAN</Text>
              <Text style={styles.attendancePercent}>{attendancePercent}%</Text>
            </View>
            <View style={[styles.attendanceIcon, { backgroundColor: Colors.primaryContainer }]}>
              <Ionicons name="pulse" size={22} color={Colors.onPrimaryContainer} />
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${attendancePercent}%`, backgroundColor: Colors.primary },
              ]}
            />
          </View>
          <Text style={styles.attendanceHint}>
            {attendedCount} dari {students.length} siswa hadir hari ini
          </Text>
        </View>

        <View style={styles.statsMiniGrid}>
          <View style={styles.statsMiniCard}>
            <View style={[styles.statsMiniIcon, { backgroundColor: Colors.primaryContainer }]}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.onPrimaryContainer} />
            </View>
            <View style={styles.statsMiniTextGroup}>
              <Text style={styles.statsMiniValue}>{totalCheckIns}</Text>
              <Text style={styles.statsMiniLabel}>Total Presensi</Text>
            </View>
          </View>

          <View style={styles.statsMiniCard}>
            <View style={[styles.statsMiniIcon, { backgroundColor: Colors.errorContainer }]}>
              <Ionicons name="time-outline" size={20} color={Colors.onErrorContainer} />
            </View>
            <View style={styles.statsMiniTextGroup}>
              <Text style={styles.statsMiniValue}>{lateCount}</Text>
              <Text style={styles.statsMiniLabel}>Terlambat</Text>
            </View>
          </View>

          <View style={styles.statsMiniCard}>
            <View style={[styles.statsMiniIcon, { backgroundColor: Colors.tertiaryContainer }]}>
              <Ionicons name="people" size={20} color={Colors.onTertiaryContainer} />
            </View>
            <View style={styles.statsMiniTextGroup}>
              <Text style={styles.statsMiniValue}>{activeStudents}</Text>
              <Text style={styles.statsMiniLabel}>Siswa Aktif</Text>
            </View>
          </View>

          <View style={styles.statsMiniCard}>
            <View style={[styles.statsMiniIcon, { backgroundColor: Colors.surfaceContainerHigh }]}>
              <Ionicons name="alert-circle-outline" size={20} color={Colors.onSurfaceVariant} />
            </View>
            <View style={styles.statsMiniTextGroup}>
              <Text style={styles.statsMiniValue}>{inactiveStudents}</Text>
              <Text style={styles.statsMiniLabel}>Tidak Aktif</Text>
            </View>
          </View>

          <View style={styles.statsMiniCard}>
            <View style={[styles.statsMiniIcon, { backgroundColor: Colors.successContainer }]}>
              <Ionicons name="log-out-outline" size={20} color={Colors.onSuccessContainer} />
            </View>
            <View style={styles.statsMiniTextGroup}>
              <Text style={styles.statsMiniValue}>{checkedOutTodayCount}</Text>
              <Text style={styles.statsMiniLabel}>Sudah Pulang</Text>
            </View>
          </View>

          <View style={styles.statsMiniCard}>
            <View style={[styles.statsMiniIcon, { backgroundColor: Colors.tertiaryContainer }]}>
              <Ionicons name="time-outline" size={20} color={Colors.onTertiaryContainer} />
            </View>
            <View style={styles.statsMiniTextGroup}>
              <Text style={styles.statsMiniValue}>{notOutCount}</Text>
              <Text style={styles.statsMiniLabel}>Belum Pulang</Text>
            </View>
          </View>
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
            <View style={styles.emptyActivity}>
              <View style={styles.emptyActivityIcon}>
                <Ionicons name="time-outline" size={26} color={Colors.onSurfaceVariant} />
              </View>
              <Text style={styles.emptyActivityText}>Belum ada aktivitas terbaru.</Text>
            </View>
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

const createStyles = (Colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  welcomeDate: {
    fontSize: 14,
    color: Colors.secondary,
    letterSpacing: 0.1,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...Shadows.sm,
  },
  summaryIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextGroup: {
    flexShrink: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.1,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.secondary,
    marginTop: 1,
    letterSpacing: 0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  statCardGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  attendanceCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    padding: 18,
    marginBottom: 14,
    ...Shadows.sm,
  },
  attendanceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  attendanceInfo: {
    flex: 1,
  },
  attendancePercent: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
    letterSpacing: -0.6,
  },
  attendanceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  attendanceHint: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 10,
  },
  statsMiniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  statsMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    padding: 12,
    width: '48.5%',
    ...Shadows.sm,
  },
  statsMiniIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsMiniTextGroup: {
    flexShrink: 1,
  },
  statsMiniValue: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  statsMiniLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.secondary,
    marginTop: 1,
    letterSpacing: 0.3,
  },
  activityContainer: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    overflow: 'hidden',
    marginTop: 4,
    ...Shadows.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
    gap: 14,
  },
  lastActivityItem: {
    borderBottomWidth: 0,
  },
  activityIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    letterSpacing: -0.1,
  },
  activityTime: {
    fontSize: 11,
    color: Colors.secondary,
  },
  activitySubtitle: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  emptyActivity: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  emptyActivityIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyActivityText: {
    fontSize: 13,
    color: Colors.secondary,
  },
});
