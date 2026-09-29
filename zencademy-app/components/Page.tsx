import React from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from './ThemeContext';
export function Page({ title, children }: React.PropsWithChildren<{ title: string }>) {
  const { theme } = useTheme(); const router = useRouter();
  return <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}><ScrollView contentContainerStyle={{ padding: 22, gap: 18 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Button title="Back" onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} /><Text accessibilityRole="header" style={{ fontSize: 25, fontWeight: '700', color: theme.text }}>{title}</Text></View>{children}</ScrollView></SafeAreaView>;
}
