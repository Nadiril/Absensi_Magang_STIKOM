import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function ProfileScreen() {
  const { students, schools, clearAllData } = useApp();

  const handleMenuPress = (menuName: string) => {
    Alert.alert('Menu Profil', `Menu "${menuName}" berhasil dibuka.`);
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Hapus Semua Data',
      'Apakah Anda yakin ingin menghapus semua data (siswa, sekolah, presensi, aktivitas)? Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Berhasil', 'Semua data pada aplikasi telah dihapus.');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari akun Admin?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => Alert.alert('Informasi', 'Anda telah keluar.') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <Text style={styles.pageTitle}>Profil Administrator</Text>

        {/* Profile Card Header */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
              }}
              style={styles.avatar}
            />
            <View style={styles.activeRing} />
          </View>

          <Text style={styles.adminName}>Academic Admin</Text>
          <Text style={styles.adminRole}>Pengelola Sistem Presensi & Magang</Text>
          <Text style={styles.schoolAffiliate}>Central High School • ID: 8829</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{students.length}</Text>
              <Text style={styles.statLabel}>Siswa</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{schools.length}</Text>
              <Text style={styles.statLabel}>Sekolah</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.tertiary }]}>Aktif</Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>
        </View>

        {/* Menu Section 1: Pengaturan Akun */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Pengaturan Akun</Text>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleMenuPress('Edit Profil')}
          >
            <View style={[styles.menuIconBg, { backgroundColor: Colors.primaryContainer }]}>
              <Ionicons name="person-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuText}>Edit Informasi Profil</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.outline} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleMenuPress('Keamanan')}
          >
            <View style={[styles.menuIconBg, { backgroundColor: Colors.surfaceContainerHigh }]}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.onSurfaceVariant} />
            </View>
            <Text style={styles.menuText}>Keamanan & Kata Sandi</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.outline} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.lastMenuItem]}
            activeOpacity={0.7}
            onPress={() => handleMenuPress('Notifikasi')}
          >
            <View style={[styles.menuIconBg, { backgroundColor: Colors.surfaceContainerHigh }]}>
              <Ionicons name="notifications-outline" size={20} color={Colors.onSurfaceVariant} />
            </View>
            <Text style={styles.menuText}>Pengaturan Notifikasi</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.outline} />
          </TouchableOpacity>
        </View>

        {/* Menu Section 2: Sistem & Laporan */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Sistem & Laporan</Text>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleMenuPress('Ekspor Laporan')}
          >
            <View style={[styles.menuIconBg, { backgroundColor: Colors.tertiaryContainer }]}>
              <Ionicons name="document-text-outline" size={20} color={Colors.onTertiaryContainer} />
            </View>
            <Text style={styles.menuText}>Ekspor Laporan Presensi</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.outline} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleMenuPress('Pusat Bantuan')}
          >
            <View style={[styles.menuIconBg, { backgroundColor: Colors.surfaceContainerHigh }]}>
              <Ionicons name="help-circle-outline" size={20} color={Colors.onSurfaceVariant} />
            </View>
            <Text style={styles.menuText}>Pusat Bantuan & Panduan</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.outline} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.lastMenuItem]}
            activeOpacity={0.7}
            onPress={handleClearAllData}
          >
            <View style={[styles.menuIconBg, { backgroundColor: '#fee2e2' }]}>
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </View>
            <Text style={[styles.menuText, { color: Colors.error }]}>Hapus Semua Data Aplikasi</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Keluar Akun</Text>
        </TouchableOpacity>
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
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 16,
  },
  profileHeaderCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginBottom: 20,
    ...Shadows.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  activeRing: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  adminName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  adminRole: {
    fontSize: 13,
    color: Colors.secondary,
    marginBottom: 4,
  },
  schoolAffiliate: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.secondary,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.outlineVariant,
  },
  sectionCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    marginBottom: 16,
    ...Shadows.sm,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
    gap: 12,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.errorContainer,
    backgroundColor: '#fef2f2',
    gap: 8,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.error,
  },
});
