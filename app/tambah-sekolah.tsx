import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Shadows, ThemeColors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Toast, ToastData } from '../components/Toast';

export default function TambahSekolahModal() {
  const router = useRouter();
  const { id: editId } = useLocalSearchParams<{ id?: string }>();
  const { schools, addSchool, updateSchool } = useApp();
  const { Colors } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const isEdit = !!editId;

  const editingSchool = schools.find((s) => s.id === editId);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const [toast, setToast] = useState<ToastData | null>(null);
  const backTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isEdit && editingSchool) {
      setName(editingSchool.name || '');
      setAddress(editingSchool.address || '');
      setPhone(editingSchool.phone === '-' ? '' : editingSchool.phone || '');
    }
  }, [isEdit, editingSchool]);

  useEffect(() => {
    return () => {
      if (backTimer.current) clearTimeout(backTimer.current);
    };
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  const handleSave = async () => {
    if (!name.trim() || !address.trim()) {
      setToast({ type: 'error', message: 'Mohon isi Nama Sekolah dan Alamat Sekolah.' });
      return;
    }

    try {
      if (isEdit && editId && editingSchool) {
        await updateSchool(editId, {
          name: name.trim(),
          address: address.trim(),
          phone: phone.trim() || '-',
          status: editingSchool.status,
        });
        setToast({ type: 'success', message: 'Data sekolah berhasil diperbarui!' });
      } else {
        await addSchool({
          name: name.trim(),
          address: address.trim(),
          phone: phone.trim() || '-',
          studentCount: 0,
          status: 'Aktif',
        });
        setToast({ type: 'success', message: 'Data sekolah berhasil ditambahkan!' });
      }
      backTimer.current = setTimeout(() => router.back(), 1100);
    } catch (err) {
      console.error('Gagal menyimpan sekolah:', err);
      setToast({ type: 'error', message: 'Gagal menyimpan sekolah. Silakan coba lagi.' });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: isEdit ? 'Edit Data Sekolah' : 'Tambah Sekolah Baru' }} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={16}
      >
        <Text style={styles.formTitle}>
          {isEdit ? 'Edit Informasi Data Sekolah' : 'Informasi Data Sekolah'}
        </Text>

        {/* 1. Nama Sekolah */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nama Sekolah *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="business-outline" size={20} color={Colors.outline} />
            <TextInput
              style={styles.input}
              placeholder="Contoh: SMK Negeri 4 Jakarta"
              placeholderTextColor={Colors.outline}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* 2. Alamat Sekolah */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Alamat Sekolah *</Text>
          <View style={[styles.inputWrapper, styles.multilineWrapper]}>
            <Ionicons
              name="location-outline"
              size={20}
              color={Colors.outline}
              style={{ marginTop: 2 }}
            />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Masukkan alamat jalan, kota, dan kode pos"
              placeholderTextColor={Colors.outline}
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* 3. No HP Sekolah */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>No. HP / Telepon Sekolah</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={20} color={Colors.outline} />
            <TextInput
              style={styles.input}
              placeholder="Contoh: 081234567890"
              placeholderTextColor={Colors.outline}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelBtnText}>Batal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveBtn}
            activeOpacity={0.8}
            onPress={handleSave}
          >
            <Text style={styles.saveBtnText}>{isEdit ? 'Simpan Perubahan' : 'Simpan Sekolah'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 20,
    letterSpacing: -0.2,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  multilineWrapper: {
    height: 92,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.onSurface,
    marginLeft: 10,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.secondary,
  },
  saveBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
});
