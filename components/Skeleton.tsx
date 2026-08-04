import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, ViewStyle } from 'react-native';
import { Colors, Shadows } from '../constants/theme';

interface SkeletonProps {
  width?: number | `${number}%` | 'auto';
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonBox: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.75,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeletonBox,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const StatCardSkeleton: React.FC = () => {
  return (
    <View style={styles.statCard}>
      <SkeletonBox width={40} height={40} borderRadius={12} style={{ marginBottom: 12 }} />
      <SkeletonBox width="60%" height={24} borderRadius={6} style={{ marginBottom: 6 }} />
      <SkeletonBox width="80%" height={14} borderRadius={4} />
    </View>
  );
};

export const StudentCardSkeleton: React.FC = () => {
  return (
    <View style={styles.studentCard}>
      <View style={styles.cardHeader}>
        <SkeletonBox width={48} height={48} borderRadius={24} />
        <View style={styles.studentInfo}>
          <SkeletonBox width="70%" height={16} borderRadius={4} style={{ marginBottom: 6 }} />
          <SkeletonBox width="45%" height={12} borderRadius={4} style={{ marginBottom: 6 }} />
          <SkeletonBox width="85%" height={12} borderRadius={4} />
        </View>
        <SkeletonBox width={40} height={28} borderRadius={8} />
      </View>
      <View style={styles.cardFooter}>
        <SkeletonBox width={70} height={20} borderRadius={10} />
        <SkeletonBox width={120} height={14} borderRadius={4} />
      </View>
    </View>
  );
};

export const SchoolCardSkeleton: React.FC = () => {
  return (
    <View style={styles.schoolCard}>
      <View style={styles.cardTopRow}>
        <SkeletonBox width={40} height={40} borderRadius={10} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <SkeletonBox width="75%" height={16} borderRadius={4} style={{ marginBottom: 6 }} />
          <SkeletonBox width="40%" height={12} borderRadius={4} />
        </View>
        <SkeletonBox width={50} height={20} borderRadius={10} />
      </View>
      <SkeletonBox width="90%" height={13} borderRadius={4} style={{ marginTop: 12, marginBottom: 6 }} />
      <SkeletonBox width="60%" height={13} borderRadius={4} style={{ marginBottom: 14 }} />
      <View style={styles.cardFooterRow}>
        <SkeletonBox width={80} height={14} borderRadius={4} />
        <SkeletonBox width={100} height={14} borderRadius={4} />
      </View>
    </View>
  );
};

export const ActivityCardSkeleton: React.FC = () => {
  return (
    <View style={styles.activityItem}>
      <SkeletonBox width={36} height={36} borderRadius={10} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <SkeletonBox width="60%" height={14} borderRadius={4} style={{ marginBottom: 4 }} />
        <SkeletonBox width="80%" height={12} borderRadius={4} />
      </View>
      <SkeletonBox width={50} height={12} borderRadius={4} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBox: {
    backgroundColor: Colors.surfaceContainerHighest,
  },
  statCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    width: '48%',
    marginBottom: 12,
    ...Shadows.sm,
  },
  studentCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerLow,
  },
  schoolCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    ...Shadows.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerLow,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
});
