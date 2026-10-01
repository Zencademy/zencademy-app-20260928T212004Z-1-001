import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { AppHeader, WalletBar } from './AppHeader';
import { type } from './type';

export { WalletBar } from './AppHeader';

export function Screen({
  title,
  subtitle,
  backTo,
  children,
  wallet = true,
}: React.PropsWithChildren<{ title: string; subtitle?: string; backTo?: string; wallet?: boolean }>) {
  const { theme } = useTheme();
  const router = useRouter();
  const goBack = () => (backTo ? router.push(backTo as never) : router.canGoBack() ? router.back() : router.replace('/(tabs)'));
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <AppHeader onBack={goBack} showWallet={wallet} compactWallet />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 12 }} showsVerticalScrollIndicator={false}>
        <Text style={[type.title, { color: theme.text }]}>{title}</Text>
        {subtitle ? <Text style={[type.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} activeOpacity={0.85} style={{ marginTop: 8, borderRadius: 14, paddingVertical: 12, alignItems: 'center', backgroundColor: disabled ? theme.border : theme.primary, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
      <Text style={[type.button, { color: disabled ? theme.textSecondary : theme.buttonText }]}>{label}</Text>
      {!disabled ? <Ionicons name="arrow-forward" size={16} color={theme.buttonText} /> : null}
    </TouchableOpacity>
  );
}
