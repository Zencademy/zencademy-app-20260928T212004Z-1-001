import React from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from './ThemeContext';
import { AppHeader } from './ui/AppHeader';
import { type } from './ui/type';

export function Page({ title, children, wallet = true }: React.PropsWithChildren<{ title: string; wallet?: boolean }>) {
  const { theme } = useTheme();
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <AppHeader onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))} showWallet={wallet} compactWallet={false} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
        <Text style={[type.title, { color: theme.text }]}>{title}</Text>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
