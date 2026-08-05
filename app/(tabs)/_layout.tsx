import React, { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { Platform, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function TabLayout() {
  const { Colors } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const headerTitle = () => (
    <View style={styles.headerTitleContainer}>
      <Image source={require('../../assets/images/image.png')} style={styles.logoImage} />
      <Text style={styles.headerTitleText}>Magangku</Text>
    </View>
  );

  const headerRight = () => (
    <TouchableOpacity style={styles.profileHeaderBtn} activeOpacity={0.8}>
      <View style={styles.avatarWrapper}>
        <View style={styles.headerAvatarFallback}>
          <Ionicons name="person" size={16} color={Colors.onPrimaryContainer} />
        </View>
        <View style={styles.onlineBadge} />
      </View>
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: Colors.surfaceContainerLowest,
          borderTopWidth: 1,
          borderTopColor: Colors.outlineVariant,
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          elevation: 0,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: Colors.surface,
          elevation: 0,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0,
          shadowRadius: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.outlineVariant,
        },
        headerTitle,
        headerRight,
      }}
    >
      {/* 1. Beranda */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, focused }: { color: any; focused: boolean }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />

      {/* 2. Siswa */}
      <Tabs.Screen
        name="students"
        options={{
          title: 'Siswa',
          tabBarIcon: ({ color, focused }: { color: any; focused: boolean }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
          ),
        }}
      />

      {/* 3. Absensi (Posisikan di Tengah & Menonjol) */}
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Absensi',
          tabBarIcon: ({ focused }: { color: any; focused: boolean }) => (
            <View style={[styles.prominentCenterBtn, focused && styles.prominentCenterBtnActive]}>
              <Ionicons name="qr-code" size={26} color="#ffffff" />
            </View>
          ),
        }}
      />

      {/* 4. Sekolah */}
      <Tabs.Screen
        name="schools"
        options={{
          title: 'Sekolah',
          tabBarIcon: ({ color, focused }: { color: any; focused: boolean }) => (
            <Ionicons name={focused ? 'business' : 'business-outline'} size={22} color={color} />
          ),
        }}
      />

      {/* 5. Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }: { color: any; focused: boolean }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const createStyles = (Colors: ThemeColors) =>
  StyleSheet.create({
    headerTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    logoImage: {
      width: 28,
      height: 28,
      resizeMode: 'contain',
    },
    headerTitleText: {
      fontSize: 20,
      fontWeight: '700',
      color: Colors.primary,
      letterSpacing: -0.3,
    },
    profileHeaderBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
      backgroundColor: Colors.surfaceContainerLow,
      padding: 5,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: Colors.outlineVariant,
    },
    avatarWrapper: {
      position: 'relative',
    },
    headerAvatarFallback: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: Colors.primaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    onlineBadge: {
      position: 'absolute',
      right: -1,
      bottom: -1,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#10b981',
      borderWidth: 1.5,
      borderColor: '#ffffff',
    },

    /* Prominent Center Tab Button */
    prominentCenterBtn: {
      width: 54,
      height: 54,
      borderRadius: 18,
      backgroundColor: Colors.primaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Platform.OS === 'ios' ? -18 : -24,
      elevation: 6,
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.28,
      shadowRadius: 8,
      borderWidth: 3.5,
      borderColor: Colors.surfaceContainerLowest,
    },
    prominentCenterBtnActive: {
      backgroundColor: Colors.primary,
      transform: [{ scale: 1.08 }],
    },
  });
