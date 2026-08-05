import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors, Shadows } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Toast, ToastData } from '../components/Toast';

export default function TambahSiswaModal() {
  const router = useRouter();
  const { id: editId } = useLocalSearchParams<{ id?: string }>();
  const { students, schools, addStudent, updateStudent } = useApp();
  const isEdit = !!editId;

  const editingStudent = students.find((s) => s.id === editId);

  const [nis, setNis] = useState('');
  const [name, setName] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(schools[0] || null);
  const [domisili, setDomisili] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  const [toast, setToast] = useState<ToastData | null>(null);
  const backTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isEdit && editingStudent) {
      setNis(editingStudent.nis || '');
      setName(editingStudent.name || '');
      setSelectedSchool(
        schools.find((s) => s.id === editingStudent.schoolId) || schools[0] || null
      );
      setDomisili(editingStudent.domisili || '');
      setStudentPhone(editingStudent.studentPhone || '');
      setGuardianPhone(editingStudent.guardianPhone || '');
    }
  }, [isEdit, editingStudent, schools]);

  useEffect(() => {
    return () => {
      if (backTimer.current) clearTimeout(backTimer.current);
    };
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  // Dropdown modal state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState('');

  const filteredSchools = schools.filter((sch) =>
    sch.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
    sch.npsn.includes(schoolSearch)
  );

  const handleSave = async () => {
    if (!nis.trim() || !name.trim() || !selectedSchool) {
      setToast({ type: 'error', message: 'Mohon isi NIS, Nama Lengkap, dan Asal Sekolah.' });
      return;
    }

    try {
      const payload = {
        nis: nis.trim(),
        name: name.trim(),
        schoolId: selectedSchool.id,
        schoolName: selectedSchool.name,
        domisili: domisili.trim(),
        studentPhone: studentPhone.trim(),
        guardianPhone: guardianPhone.trim(),
        attendanceRate: isEdit && editingStudent ? editingStudent.attendanceRate : 100,
        status: isEdit && editingStudent ? editingStudent.status : ('Aktif' as const),
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a56db&color=fff`,
      };

      if (isEdit && editId) {
        await updateStudent(editId, payload);
        setToast({ type: 'success', message: 'Data siswa berhasil diperbarui!' });
      } else {
        await addStudent(payload);
        setToast({ type: 'success', message: 'Data siswa berhasil ditambahkan!' });
      }
      backTimer.current = setTimeout(() => router.back(), 1100);
    } catch (err) {
      console.error('Gagal menyimpan siswa:', err);
      setToast({ type: 'error', message: 'Gagal menyimpan siswa. Silakan coba lagi.' });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: isEdit ? 'Edit Data Siswa' : 'Tambah Siswa Baru' }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 44 : 0}
      >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.formTitle}>
          {isEdit ? 'Edit Data Siswa Baru' : 'Tambah Data Siswa Baru'}
        </Text>

        {/* 1. NIS */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nomor Induk Siswa (NIS) *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="card-outline" size={20} color={Colors.outline} />
            <TextInput
              style={styles.input}
              placeholder="Contoh: 2024005"
              placeholderTextColor={Colors.outline}
              value={nis}
              onChangeText={setNis}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* 2. Nama Lengkap */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nama Lengkap *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={Colors.outline} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama lengkap siswa"
              placeholderTextColor={Colors.outline}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* 3. Asal Sekolah (Dropdown + Search Bar) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Asal Sekolah *</Text>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            activeOpacity={0.8}
            onPress={() => setIsDropdownOpen(true)}
          >
            <Ionicons name="business-outline" size={20} color={Colors.outline} />
            <Text
              style={[
                styles.dropdownTriggerText,
                !selectedSchool && { color: Colors.outline },
              ]}
              numberOfLines={1}
            >
              {selectedSchool ? selectedSchool.name : 'Pilih Asal Sekolah...'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={Colors.outline} />
          </TouchableOpacity>
        </View>

        {/* 4. Domisili Siswa */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Domisili Siswa</Text>
          <View style={[styles.inputWrapper, styles.multilineWrapper]}>
            <Ionicons name="home-outline" size={20} color={Colors.outline} style={{ marginTop: 2 }} />
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Alamat domisili / tempat tinggal siswa"
              placeholderTextColor={Colors.outline}
              value={domisili}
              onChangeText={setDomisili}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* 5. No HP Siswa */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>No. HP Siswa</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={20} color={Colors.outline} />
            <TextInput
              style={styles.input}
              placeholder="Contoh: 081234567890"
              placeholderTextColor={Colors.outline}
              value={studentPhone}
              onChangeText={setStudentPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* 6. No HP Wali Siswa */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>No. HP Wali Siswa</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="people-outline" size={20} color={Colors.outline} />
            <TextInput
              style={styles.input}
              placeholder="Contoh: 089876543210"
              placeholderTextColor={Colors.outline}
              value={guardianPhone}
              onChangeText={setGuardianPhone}
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
            <Text style={styles.saveBtnText}>{isEdit ? 'Simpan Perubahan' : 'Simpan Siswa'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      <Toast toast={toast} onHide={hideToast} />

      {/* Dropdown Search Modal */}
      <Modal
        visible={isDropdownOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Asal Sekolah</Text>
              <TouchableOpacity onPress={() => setIsDropdownOpen(false)}>
                <Ionicons name="close" size={24} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>

            {/* Dropdown Search Bar */}
            <View style={styles.modalSearchContainer}>
              <Ionicons name="search-outline" size={18} color={Colors.outline} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Cari sekolah..."
                placeholderTextColor={Colors.outline}
                value={schoolSearch}
                onChangeText={setSchoolSearch}
              />
              {schoolSearch ? (
                <TouchableOpacity onPress={() => setSchoolSearch('')}>
                  <Ionicons name="close-circle" size={16} color={Colors.outline} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* School Options List */}
            <ScrollView style={styles.schoolListScroll} keyboardShouldPersistTaps="handled">
              {filteredSchools.length === 0 ? (
                <Text style={styles.noSchoolText}>Sekolah tidak ditemukan</Text>
              ) : (
                filteredSchools.map((sch) => (
                  <TouchableOpacity
                    key={sch.id}
                    style={[
                      styles.schoolSelectItem,
                      selectedSchool?.id === sch.id && styles.schoolSelectItemActive,
                    ]}
                    onPress={() => {
                      setSelectedSchool(sch);
                      setIsDropdownOpen(false);
                      setSchoolSearch('');
                    }}
                  >
                    <View style={styles.schoolSelectInfo}>
                      <Text
                        style={[
                          styles.schoolSelectName,
                          selectedSchool?.id === sch.id && styles.schoolSelectNameActive,
                        ]}
                      >
                        {sch.name}
                      </Text>
                      <Text
                        style={[
                          styles.schoolSelectSub,
                          selectedSchool?.id === sch.id && styles.schoolSelectSubActive,
                        ]}
                      >
                        NPSN: {sch.npsn}
                      </Text>
                    </View>
                    {selectedSchool?.id === sch.id && (
                      <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    height: 76,
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
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  dropdownTriggerText: {
    flex: 1,
    fontSize: 14,
    color: Colors.onSurface,
    marginLeft: 10,
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

  /* Modal Dropdown Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 28,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 14,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.onSurface,
    marginLeft: 8,
  },
  schoolListScroll: {
    maxHeight: 320,
  },
  noSchoolText: {
    fontSize: 13,
    color: Colors.secondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  schoolSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHigh,
  },
  schoolSelectItemActive: {
    backgroundColor: Colors.primaryContainer,
    borderBottomColor: Colors.primaryContainer,
  },
  schoolSelectInfo: {
    flex: 1,
  },
  schoolSelectName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  schoolSelectNameActive: {
    color: Colors.onPrimaryContainer,
  },
  schoolSelectSub: {
    fontSize: 12,
    color: Colors.secondary,
  },
  schoolSelectSubActive: {
    color: Colors.onPrimaryContainer,
  },
});
