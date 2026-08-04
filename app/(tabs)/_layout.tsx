import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { Platform, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: Colors.surfaceContainerLowest,
          borderTopColor: Colors.outlineVariant,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          elevation: 8,
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: Colors.surface,
          elevation: 2,
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          borderBottomWidth: 1,
          borderBottomColor: Colors.outlineVariant,
        },
        headerTitle: () => (
          <View style={styles.headerTitleContainer}>
            <View style={styles.logoBg}>
              <Ionicons name="school" size={18} color={Colors.onPrimary} />
            </View>
            <Text style={styles.headerTitleText}>Magangku</Text>
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity style={styles.profileHeaderBtn} activeOpacity={0.8}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
                }}
                style={styles.headerAvatar}
              />
              <View style={styles.onlineBadge} />
            </View>
            <Text style={styles.adminRoleText}>Admin</Text>
          </TouchableOpacity>
        ),
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

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.2,
  },
  profileHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 8,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  avatarWrapper: {
    position: 'relative',
  },
  headerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
  adminRoleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
    marginRight: 4,
  },

  /* Prominent Center Tab Button */
  prominentCenterBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? -18 : -22,
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 3.5,
    borderColor: Colors.surfaceContainerLowest,
  },
  prominentCenterBtnActive: {
    backgroundColor: Colors.primary,
    transform: [{ scale: 1.08 }],
  },
});
