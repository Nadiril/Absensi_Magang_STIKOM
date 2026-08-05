import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export interface ToastData {
  type: 'success' | 'error';
  message: string;
}

interface ToastProps {
  toast: ToastData | null;
  onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onHide }) => {
  const { Colors } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-64)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return;

    translateY.setValue(-64);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(onHide, 2600);
    return () => clearTimeout(timer);
  }, [toast, onHide, translateY, opacity]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <View
      style={[styles.wrapper, { top: insets.top + 10 }]}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          styles.toast,
          { backgroundColor: isSuccess ? Colors.success : Colors.error },
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <Ionicons
          name={isSuccess ? 'checkmark-circle' : 'close-circle'}
          size={18}
          color="#ffffff"
        />
        <Text style={styles.message} numberOfLines={2}>
          {toast.message}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    maxWidth: 440,
    width: 'auto',
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 6,
  },
  message: {
    flexShrink: 1,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
});
