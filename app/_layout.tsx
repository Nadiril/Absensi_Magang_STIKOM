console.log("=== APP STARTED ===");

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../context/AppContext';
import { Colors } from '../constants/theme';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
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
      </Stack>
    </AppProvider>
  );
}
