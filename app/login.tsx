import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ThemeColors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Toast, ToastData } from '../components/Toast';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REMEMBER_KEY = '@magangku_remembered_email';

const CARD_RADIUS = 28;
const FIELD_RADIUS = 16;
const CARD_BORDER = '#EAEAEA';
const GRAY_600 = '#4B5563';

type FieldStatus = 'normal' | 'error' | 'success';

const createFieldStyles = (Colors: ThemeColors) =>
  StyleSheet.create({
    fieldWrap: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors.onSurface,
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: FIELD_RADIUS,
      paddingHorizontal: 16,
      height: 56,
      borderWidth: 1,
      backgroundColor: Colors.surfaceContainerLowest,
      borderColor: Colors.outlineVariant,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0,
      shadowRadius: 8,
      elevation: 0,
    },
    inputWrapperFocused: {
      borderWidth: 1.5,
      borderColor: Colors.primary,
      shadowColor: Colors.primary,
      shadowOpacity: 0.14,
      shadowRadius: 12,
      elevation: 3,
    },
    inputWrapperError: {
      borderColor: Colors.error,
    },
    inputWrapperSuccess: {
      borderColor: Colors.success,
    },
    inputWrapperDisabled: {
      opacity: 0.6,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: Colors.onSurface,
      marginLeft: 12,
      paddingVertical: 0,
    },
    helperText: {
      fontSize: 12,
      minHeight: 18,
      lineHeight: 18,
      marginTop: 5,
      marginLeft: 4,
      fontWeight: '500',
    },
  });

interface AuthFieldProps extends TextInputProps {
  label?: string;
  icon: keyof typeof Ionicons.glyphMap;
  status: FieldStatus;
  helper?: string;
  inputRef?: React.Ref<TextInput>;
  endAdornment?: React.ReactNode;
}

function AuthField({
  label,
  icon,
  status,
  helper,
  inputRef,
  secureTextEntry,
  onFocus,
  onBlur,
  endAdornment,
  editable,
  ...rest
}: AuthFieldProps) {
  const { Colors } = useTheme();
  const styles = useMemo(() => createFieldStyles(Colors), [Colors]);
  const [focused, setFocused] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const isActive = focused && status === 'normal';

  const animate = (v: number) =>
    Animated.timing(scale, { toValue: v, duration: 200, useNativeDriver: true }).start();

  const handleFocus = (e: any) => {
    setFocused(true);
    animate(1.01);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setFocused(false);
    animate(1);
    onBlur?.(e);
  };

  const iconColor =
    status === 'error'
      ? Colors.error
      : status === 'success'
        ? Colors.success
        : isActive
          ? Colors.primary
          : Colors.outline;

  const helperColor =
    status === 'error' ? Colors.error : Colors.outline;

  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Animated.View
        style={[
          styles.inputWrapper,
          status === 'error' && styles.inputWrapperError,
          status === 'success' && !focused && styles.inputWrapperSuccess,
          isActive && styles.inputWrapperFocused,
          editable === false && styles.inputWrapperDisabled,
          { transform: [{ scale }] },
        ]}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholderTextColor={Colors.outline}
          selectionColor={Colors.primary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          editable={editable}
          {...rest}
        />
        {status === 'success' && (
          <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
        )}
        {endAdornment}
      </Animated.View>
      <Text style={[styles.helperText, { color: helperColor }]} numberOfLines={1}>
        {status === 'error' ? helper : '\u00A0'}
      </Text>
    </View>
  );
}

function EyeToggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  const { Colors } = useTheme();
  const anim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.7, duration: 90, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, speed: 24, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? 'Sembunyikan password' : 'Tampilkan password'}
      hitSlop={10}
      style={stylesEye.btn}
      onPress={handlePress}
    >
      <Animated.View style={{ transform: [{ scale: anim }] }}>
        <Ionicons name={value ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.outline} />
      </Animated.View>
    </Pressable>
  );
}

const stylesEye = StyleSheet.create({
  btn: {
    padding: 4,
    marginLeft: 4,
    minWidth: 32,
  },
});

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useApp();
  const { Colors } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailStatus, setEmailStatus] = useState<FieldStatus>('normal');
  const [passwordStatus, setPasswordStatus] = useState<FieldStatus>('normal');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const entrance = useRef(new Animated.Value(0)).current;
  const bgFade = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  const hideToast = useCallback(() => setToast(null), []);

  const showMessage = useCallback(
    (data: ToastData) => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast(data);
      toastTimer.current = setTimeout(hideToast, 2800);
    },
    [hideToast]
  );

  useEffect(() => {
    AsyncStorage.getItem(REMEMBER_KEY)
      .then((saved) => {
        if (saved) {
          setEmail(saved);
          setRememberMe(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    Animated.timing(bgFade, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    Animated.spring(entrance, {
      toValue: 1,
      damping: 20,
      stiffness: 150,
      mass: 0.85,
      useNativeDriver: true,
    }).start();

    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [entrance, bgFade]);

  const pressIn = () =>
    Animated.spring(btnScale, { toValue: 0.98, speed: 40, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(btnScale, { toValue: 1, speed: 40, useNativeDriver: true }).start();

  const handleForgotPassword = () => {
    showMessage({ type: 'error', message: 'Fitur pemulihan password belum tersedia pada versi demo.' });
  };

  const validate = () => {
    const trimmedEmail = email.trim();
    const emailOk = EMAIL_REGEX.test(trimmedEmail);
    const passwordOk = password.length >= 6;

    if (!emailOk) setEmailStatus('error');
    else if (trimmedEmail) setEmailStatus('success');

    if (!passwordOk) setPasswordStatus('error');

    return { emailOk, passwordOk };
  };

  const finishLogin = useCallback(
    async (emailValue: string) => {
      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBER_KEY, emailValue).catch(() => {});
      } else {
        await AsyncStorage.removeItem(REMEMBER_KEY).catch(() => {});
      }
      await login(emailValue, password);
      router.replace('/auth-loading');
    },
    [login, password, rememberMe, router]
  );

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      if (!trimmedEmail) setEmailStatus('error');
      if (!password) setPasswordStatus('error');
      showMessage({ type: 'error', message: 'Mohon isi email dan password terlebih dahulu.' });
      return;
    }

    const { emailOk, passwordOk } = validate();
    if (!emailOk || !passwordOk) {
      showMessage({ type: 'error', message: 'Periksa kembali email dan password Anda.' });
      return;
    }

    setIsLoading(true);
    try {
      await finishLogin(trimmedEmail);
    } catch (err) {
      console.error('Gagal masuk:', err);
      showMessage({ type: 'error', message: 'Terjadi kesalahan saat masuk. Silakan coba lagi.' });
      setIsLoading(false);
    }
  };

  const boxTranslate = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Subtle background decorations */}
        <Animated.View pointerEvents="none" style={[styles.bgDecor, { opacity: bgFade }]}>
          <View style={[styles.blob, styles.blobWarm]} />
          <View style={[styles.blob, styles.blobCool]} />
          <View style={[styles.blob, styles.blobTiny]} />
        </Animated.View>

        {/* Floating Login Card */}
        <ScrollView
          style={styles.flexGrow}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[styles.cardShadow, { opacity: entrance, transform: [{ translateY: boxTranslate }] }]}
          >
            <View style={styles.card}>
              <View style={styles.orbLarge} />
              <View style={styles.orbSmall} />

              {/* Hero / Brand */}
              <View style={styles.hero}>
                <Image source={require('../assets/images/image.png')} style={styles.logo} />
                <Text style={styles.brandName}>Magangku</Text>
                <Text style={styles.brandTagline}>Sistem Presensi Siswa Magang</Text>

                <LinearGradient
                  colors={[Colors.primary, Colors.primaryContainer]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.badge}
                >
                  <Ionicons name="shield-checkmark" size={16} color="#ffffff" />
                  <Text style={styles.badgeText}>Aplikasi Resmi Absensi Magang</Text>
                </LinearGradient>
              </View>

              <View style={styles.sectionDivider} />

              {/* Form */}
              <Text style={styles.formTitle}>Masuk ke Akun</Text>
              <Text style={styles.formSubtitle}>Kelola presensi siswa magang dengan mudah dan cepat.</Text>

              <AuthField
                label="Email"
                icon="mail-outline"
                placeholder="nama@sekolah.ac.id"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (emailStatus !== 'normal') setEmailStatus('normal');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                importantForAutofill="yes"
                textContentType="username"
                autoComplete="username"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                status={emailStatus}
                helper="Format email tidak valid"
                editable={!isLoading}
              />

              <AuthField
                label="Kata Sandi"
                icon="lock-closed-outline"
                placeholder="Minimal 6 karakter"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (passwordStatus !== 'normal') setPasswordStatus('normal');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                importantForAutofill="yes"
                textContentType="password"
                autoComplete="current-password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                status={passwordStatus}
                helper="Minimal 6 karakter"
                editable={!isLoading}
                inputRef={passwordRef}
                endAdornment={
                  <EyeToggle value={showPassword} onToggle={() => setShowPassword((prev) => !prev)} />
                }
              />

              {/* Remember + Forgot */}
              <View style={styles.metaRow}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: rememberMe }}
                  accessibilityLabel="Ingat email saya di perangkat ini"
                  hitSlop={8}
                  style={styles.rememberBtn}
                  onPress={() => setRememberMe((prev) => !prev)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <Ionicons name="checkmark" size={13} color={Colors.onPrimary} />}
                  </View>
                  <Text style={styles.rememberText}>Ingat saya</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel="Lupa password"
                  hitSlop={8}
                  style={styles.forgotBtn}
                  onPress={handleForgotPassword}
                >
                  <Text style={styles.forgotText}>Lupa Password?</Text>
                </Pressable>
              </View>

              {/* Primary Button */}
              <Animated.View style={[styles.buttonScale, { transform: [{ scale: btnScale }] }]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Masuk"
                  accessibilityState={{ busy: isLoading }}
                  onPressIn={pressIn}
                  onPressOut={pressOut}
                  onPress={handleLogin}
                  disabled={isLoading}
                  android_ripple={{ color: 'rgba(255,255,255,0.28)', foreground: true }}
                  style={styles.loginBtnPressable}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryContainer]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color={Colors.onPrimary} />
                    ) : (
                      <>
                        <Text style={styles.loginBtnText}>Masuk</Text>
                        <Ionicons name="arrow-forward" size={19} color={Colors.onPrimary} />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footerWrap}>
            <Text style={styles.footer}>AbsensiMagang v1.2.0</Text>
            <Text style={styles.footerSub}>(c) 2026 STIKOM PGRI Banyuwangi</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
    flex: {
      flex: 1,
    },
    bgDecor: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 0,
    },
    blob: {
      position: 'absolute',
      borderRadius: 999,
    },
    blobWarm: {
      width: 180,
      height: 180,
      top: -60,
      right: -60,
      backgroundColor: '#f2b55c',
      opacity: 0.05,
    },
    blobCool: {
      width: 160,
      height: 160,
      bottom: 20,
      left: -70,
      backgroundColor: Colors.primaryContainer,
      opacity: 0.05,
    },
    blobTiny: {
      width: 58,
      height: 58,
      top: '40%',
      right: 20,
      backgroundColor: '#f2b55c',
      opacity: 0.05,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 20,
    },
    flexGrow: {
      flexGrow: 1,
    },
    cardShadow: {
      width: '100%',
      maxWidth: 480,
      borderRadius: CARD_RADIUS,
      shadowColor: '#0a2540',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.08,
      shadowRadius: 28,
      elevation: 6,
    },
    card: {
      backgroundColor: Colors.surfaceContainerLowest,
      borderRadius: CARD_RADIUS,
      borderWidth: 1,
      borderColor: CARD_BORDER,
      padding: 24,
      overflow: 'hidden',
    },
    orbLarge: {
      position: 'absolute',
      width: 180,
      height: 180,
      borderRadius: 90,
      top: -90,
      right: -80,
      backgroundColor: Colors.primaryContainer,
      opacity: 0.07,
    },
    orbSmall: {
      position: 'absolute',
      width: 110,
      height: 110,
      borderRadius: 55,
      bottom: -50,
      left: -40,
      backgroundColor: Colors.primaryContainer,
      opacity: 0.05,
    },
    hero: {
      alignItems: 'center',
      width: '100%',
    },
    logo: {
      width: 52,
      height: 52,
      resizeMode: 'contain',
      marginBottom: 12,
    },
    brandName: {
      fontSize: 32,
      fontWeight: '800',
      color: Colors.primary,
      letterSpacing: -0.6,
      lineHeight: 38,
    },
    brandTagline: {
      fontSize: 16,
      fontWeight: '500',
      color: GRAY_600,
      marginTop: 4,
      lineHeight: 22,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      height: 42,
      paddingHorizontal: 18,
      borderRadius: 21,
      marginTop: 16,
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 3,
    },
    badgeText: {
      fontSize: 12.5,
      fontWeight: '600',
      color: '#ffffff',
    },
    sectionDivider: {
      height: 1,
      backgroundColor: Colors.outlineVariant,
      marginVertical: 24,
      width: '100%',
    },
    formTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: Colors.onSurface,
      letterSpacing: -0.3,
      lineHeight: 26,
    },
    formSubtitle: {
      fontSize: 13,
      fontWeight: '400',
      color: Colors.secondary,
      marginTop: 2,
      marginBottom: 20,
      lineHeight: 18,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 0,
      marginBottom: 20,
      minHeight: 48,
      width: '100%',
    },
    rememberBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      minHeight: 48,
      paddingRight: 8,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: Colors.outline,
      backgroundColor: Colors.surfaceContainerLowest,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
    },
    rememberText: {
      fontSize: 15,
      fontWeight: '400',
      color: Colors.onSurface,
    },
    forgotBtn: {
      minHeight: 48,
      justifyContent: 'center',
    },
    forgotText: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors.primary,
    },
    buttonScale: {
      width: '100%',
    },
    loginBtnPressable: {
      width: '100%',
      borderRadius: 18,
      overflow: 'hidden',
    },
    loginBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: 56,
      borderRadius: 18,
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.22,
      shadowRadius: 12,
      elevation: 4,
    },
    loginBtnDisabled: {
      opacity: 0.65,
    },
    loginBtnText: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors.onPrimary,
      letterSpacing: 0.2,
    },
    footerWrap: {
      alignItems: 'center',
      marginTop: 20,
    },
    footer: {
      fontSize: 12,
      fontWeight: '500',
      color: '#6B7280',
    },
    footerSub: {
      fontSize: 11,
      color: '#6B7280',
      marginTop: 2,
    },
  });