import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Shadows, ThemeColors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Toast, ToastData } from '../components/Toast';

const parseLimit = (value: string): Date => {
  const [h, m] = value.split(':').map((n) => parseInt(n, 10));
  const d = new Date();
  d.setHours(Number.isFinite(h) ? h : 8, Number.isFinite(m) ? m : 0, 0, 0);
  return d;
};

const formatHHMM = (d: Date): string =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useApp();
  const { Colors } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const [time, setTime] = useState<Date>(() => parseLimit(settings.checkInLimit));
  const [showPicker, setShowPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const backTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => setToast(null), []);

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await updateSettings({ checkInLimit: formatHHMM(time) });
      setToast({ type: 'success', message: 'Pengaturan presensi berhasil disimpan' });
      backTimer.current = setTimeout(() => router.back(), 900);
    } catch {
      setToast({ type: 'error', message: 'Gagal menyimpan pengaturan.' });
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, time, updateSettings, router]);

  const onPickerChange = useCallback(
    (event: any, selected?: Date) => {
      if (Platform.OS === 'android') setShowPicker(false);
      if (event.type === 'set' && selected) setTime(selected);
    },
    []
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: Colors.primaryContainer }]}>
              <Ionicons name="time-outline" size={22} color={Colors.onPrimaryContainer} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Jam Batas Check-In</Text>
              <Text style={styles.cardSubtitle}>
                Siswa yang check-in setelah jam ini otomatis berstatus Terlambat
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.timeField}
            activeOpacity={0.7}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.timeValue}>{formatHHMM(time)}</Text>
            <View style={[styles.timeIcon, { backgroundColor: Colors.surfaceContainerHigh }]}>
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
            </View>
          </TouchableOpacity>

          <Text style={styles.timeHint}>Ketuk untuk mengubah jam batas terlambat</Text>

          {showPicker ? (
            <DateTimePicker
              value={time}
              mode="time"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onPickerChange}
            />
          ) : null}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.tertiary} />
          <Text style={styles.infoText}>
            Default: 08:00. Berlaku untuk seluruh siswa saat check-in (otomatis deteksi sesi masuk & pulang).
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Ionicons name={isSaving ? 'hourglass-outline' : 'checkmark'} size={20} color={Colors.onPrimary} />
          <Text style={styles.saveButtonText}>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</Text>
        </TouchableOpacity>
      </View>

      <Toast toast={toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

const createStyles = (Colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: Colors.surfaceContainerLowest,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: Colors.outlineVariant,
      marginBottom: 16,
      ...Shadows.sm,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 18,
    },
    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardHeaderText: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: Colors.onSurface,
      letterSpacing: -0.1,
    },
    cardSubtitle: {
      fontSize: 12,
      color: Colors.secondary,
      marginTop: 2,
      lineHeight: 17,
    },
    timeField: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: Colors.surfaceContainerLow,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: Colors.outlineVariant,
      paddingHorizontal: 18,
      height: 64,
      marginBottom: 8,
    },
    timeValue: {
      fontSize: 32,
      fontWeight: '700',
      color: Colors.primary,
      letterSpacing: 1,
    },
    timeIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    timeHint: {
      fontSize: 12,
      color: Colors.secondary,
      marginBottom: 4,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: Colors.tertiaryContainer,
      borderRadius: 16,
      padding: 14,
      marginBottom: 20,
    },
    infoText: {
      flex: 1,
      fontSize: 12,
      color: Colors.onTertiaryContainer,
      lineHeight: 18,
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 54,
      borderRadius: 16,
      backgroundColor: Colors.primary,
      gap: 8,
      ...Shadows.sm,
    },
    saveButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: Colors.onPrimary,
    },
  });
