import { Redirect, Stack, usePathname } from 'expo-router';
import { useAuth } from '../../components/AuthContext';

export default function AuthLayout() {
  const { recovery, user, loading } = useAuth();
  const pathname = usePathname();

  if (!loading && user && recovery && !pathname?.includes('reset-password')) {
    return <Redirect href="/(auth)/reset-password" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
