import React, { useEffect, useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemeColors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import {
  ActivityCardSkeleton,
  SkeletonBox,
  StatCardSkeleton,
} from '../components/Skeleton';

export default function AuthLoadingScreen() {
  const router = useRouter();
  const { Colors } = useTheme();
  const { isLoading, refreshData } = useApp();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => router.replace('/(tabs)'), 350);
      return () => clearTimeout(timer);
    }
  }, [isLoading, router]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <Image source={require('../assets/images/image.png')} style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Magangku</Text>
            <Text style={styles.headerSub}>Menyiapkan data Anda...</Text>
          </View>
          <View style={styles.loadingPill}>
            <View style={styles.loadingDot} />
          </View>
        </View>

        {/* Stats Skeletons */}
        <View style={styles.statsRow}>
          <StatCardSkeleton />
          <StatCardSkeleton />
        </View>

        {/* Activity Skeletons */}
        <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
        <ActivityCardSkeleton />
        <ActivityCardSkeleton />
        <ActivityCardSkeleton />

        {/* Footer Skeleton */}
        <View style={styles.footer}>
          <SkeletonBox width={140} height={14} borderRadius={4} />
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      backgroundColor: Colors.surfaceContainerLowest,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: Colors.outlineVariant,
    },
    logo: {
      width: 40,
      height: 40,
      resizeMode: 'contain',
    },
    headerText: {
      flex: 1,
      marginLeft: 12,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: Colors.onSurface,
    },
    headerSub: {
      fontSize: 12,
      color: Colors.secondary,
      marginTop: 2,
    },
    loadingDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: Colors.success,
    },
    loadingPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: Colors.successContainer,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: Colors.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginTop: 8,
      marginBottom: 10,
    },
    footer: {
      alignItems: 'center',
      marginTop: 24,
    },
  });