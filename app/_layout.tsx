import React from 'react';
import { Stack, Redirect, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '../context/AppContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function RootNavigator() {
  const { Colors, isDark } = useTheme();
  const { isLoggedIn, isAuthReady } = useApp();
  const pathname = usePathname();

  if (!isAuthReady) return null;

  const showRedirect =
    isLoggedIn && pathname === '/login'
      ? <Redirect href="/(tabs)" />
      : !isLoggedIn && pathname !== '/login'
        ? <Redirect href="/login" />
        : null;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {showRedirect}
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.primary,
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="auth-loading" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="tambah-siswa"
          options={{
            presentation: 'modal',
            title: 'Tambah Siswa Baru',
            headerStyle: { backgroundColor: Colors.surface },
          }}
        />
        <Stack.Screen
          name="tambah-sekolah"
          options={{
            presentation: 'modal',
            title: 'Tambah Sekolah Baru',
            headerStyle: { backgroundColor: Colors.surface },
          }}
        />
        <Stack.Screen
          name="student-detail"
          options={{
            title: 'Profil & Kartu QR Siswa',
            headerStyle: { backgroundColor: Colors.surface },
          }}
        />
        <Stack.Screen
          name="pengaturan"
          options={{
            title: 'Pengaturan Presensi',
            headerStyle: { backgroundColor: Colors.surface },
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppProvider>
        <RootNavigator />
      </AppProvider>
    </ThemeProvider>
  );
}
