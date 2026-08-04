import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';

export default function ScanScreen() {
  const { recordAttendance } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [manualNis, setManualNis] = useState('');
  const [flashOn, setFlashOn] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<{
    success: boolean;
    message: string;
    student?: Student;
  } | null>(null);
  const [successModal, setSuccessModal] = useState<{
    student: Student;
    time: string;
  } | null>(null);

  const handleProcessScan = (inputNis: string) => {
    if (!inputNis.trim()) {
      Alert.alert('Peringatan', 'Silakan masukkan NIS atau ID siswa.');
      return;
    }

    const res = recordAttendance(inputNis);
    setLastScanResult(res);
    if (res.success) {
      setManualNis('');
      setSuccessModal({
        student: res.student!,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      });
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    handleProcessScan(data);
    setTimeout(() => {
      setScanned(false);
    }, 2500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Absensi QR Scanner</Text>
        <Text style={styles.pageSubtitle}>Scan QR code atau masukkan NIS siswa untuk presensi</Text>

        {/* Scanner Viewfinder Box */}
        <View style={styles.scannerBox}>
          {/* Top Controls Header */}
          <View style={styles.scannerControls}>
            <View />
            <TouchableOpacity
              style={[styles.flashButton, flashOn && styles.flashButtonActive]}
              activeOpacity={0.7}
              onPress={() => setFlashOn(!flashOn)}
            >
              <Ionicons
                name={flashOn ? 'flash' : 'flash-outline'}
                size={20}
                color={flashOn ? Colors.primary : Colors.onSurface}
              />
            </TouchableOpacity>
          </View>

          {/* Center Target Frame with Live CameraView */}
          <View style={styles.viewfinderFrame}>
            {permission?.granted ? (
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                enableTorch={flashOn}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              />
            ) : (
              <View style={styles.permissionBox}>
                <Ionicons name="camera-outline" size={42} color="rgba(255,255,255,0.6)" />
                <Text style={styles.permissionMsg}>Izin kamera diperlukan</Text>
                <TouchableOpacity
                  style={styles.grantBtn}
                  activeOpacity={0.8}
                  onPress={requestPermission}
                >
                  <Text style={styles.grantBtnText}>Izinkan Kamera</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Corner Guides Overlay */}
            <View style={[styles.corner, styles.topLeft]} pointerEvents="none" />
            <View style={[styles.corner, styles.topRight]} pointerEvents="none" />
            <View style={[styles.corner, styles.bottomLeft]} pointerEvents="none" />
            <View style={[styles.corner, styles.bottomRight]} pointerEvents="none" />

            {!permission?.granted && (
              <Ionicons
                name="qr-code-outline"
                size={70}
                color="rgba(255,255,255,0.2)"
                style={{ position: 'absolute' }}
                pointerEvents="none"
              />
            )}
          </View>

          <Text style={styles.scanHintText}>
            Posisikan QR Code siswa di dalam kotak di atas
          </Text>
        </View>

        {/* Scan Feedback Result Card */}
        {lastScanResult ? (
          <View
            style={[
              styles.resultCard,
              lastScanResult.success ? styles.successResult : styles.errorResult,
            ]}
          >
            <Ionicons
              name={lastScanResult.success ? 'checkmark-circle' : 'alert-circle'}
              size={28}
              color={lastScanResult.success ? Colors.tertiary : Colors.error}
            />
            <View style={styles.resultTextContainer}>
              <Text
                style={[
                  styles.resultTitle,
                  lastScanResult.success ? { color: Colors.tertiary } : { color: Colors.error },
                ]}
              >
                {lastScanResult.success ? 'Presensi Berhasil!' : 'Presensi Gagal'}
              </Text>
              <Text style={styles.resultMessage}>{lastScanResult.message}</Text>
            </View>
          </View>
        ) : null}

        {/* Manual Entry Fallback */}
        <View style={styles.manualCard}>
          <Text style={styles.manualTitle}>Input NIS Manual</Text>
          <Text style={styles.manualSubtitle}>
            Jika QR Code rusak atau tidak terbaca, masukkan NIS siswa di bawah ini:
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.nisInput}
              placeholder="Contoh: 2024001"
              placeholderTextColor={Colors.outline}
              value={manualNis}
              onChangeText={setManualNis}
              keyboardType="number-pad"
            />
            <TouchableOpacity
              style={styles.submitButton}
              activeOpacity={0.8}
              onPress={() => handleProcessScan(manualNis)}
            >
              <Text style={styles.submitButtonText}>Proses</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={successModal !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSuccessModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalCheckCircle}>
              <Ionicons name="checkmark" size={40} color="#ffffff" />
            </View>
            <Text style={styles.modalTitle}>Presensi Berhasil!</Text>
            <Text style={styles.modalSubtitle}>Data kehadiran siswa berhasil dicatat</Text>

            {successModal ? (
              <View style={styles.modalStudentCard}>
                <Image
                  source={{ uri: successModal.student.avatarUrl }}
                  style={styles.modalAvatar}
                />
                <View style={styles.modalStudentInfo}>
                  <Text style={styles.modalStudentName} numberOfLines={1}>
                    {successModal.student.name}
                  </Text>
                  <Text style={styles.modalStudentDetail}>
                    NIS: {successModal.student.nis}
                  </Text>
                  <Text style={styles.modalStudentDetail} numberOfLines={1}>
                    {successModal.student.schoolName}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.modalTimeRow}>
              <Ionicons name="time-outline" size={16} color={Colors.secondary} />
              <Text style={styles.modalTimeText}>
                {successModal ? `Absen pada pukul ${successModal.time}` : ''}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              activeOpacity={0.8}
              onPress={() => setSuccessModal(null)}
            >
              <Text style={styles.modalButtonText}>Selesai</Text>
            </TouchableOpacity>
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
    padding: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  pageSubtitle: {
    fontSize: 13,
    color: Colors.secondary,
    marginBottom: 16,
  },
  scannerBox: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    ...Shadows.md,
  },
  scannerControls: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 10,
  },
  scanStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotGreen: {
    backgroundColor: '#10b981',
  },
  dotAmber: {
    backgroundColor: '#f59e0b',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  flashButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashButtonActive: {
    backgroundColor: Colors.primaryFixed,
  },
  viewfinderFrame: {
    width: 230,
    height: 230,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#000000',
  },
  permissionBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  permissionMsg: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'center',
  },
  grantBtn: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  grantBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Colors.primaryContainer,
    zIndex: 10,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  scanHintText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
  },
  successResult: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  errorResult: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  resultMessage: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  manualCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    ...Shadows.sm,
  },
  manualTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  manualSubtitle: {
    fontSize: 12,
    color: Colors.secondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  nisInput: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: Colors.onSurface,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...Shadows.md,
  },
  modalCheckCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.secondary,
    marginBottom: 20,
  },
  modalStudentCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginBottom: 16,
  },
  modalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  modalStudentInfo: {
    flex: 1,
  },
  modalStudentName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 2,
  },
  modalStudentDetail: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 1,
  },
  modalTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  modalTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
  },
  modalButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  simTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 8,
  },
  simChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  simChip: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  simChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
});
