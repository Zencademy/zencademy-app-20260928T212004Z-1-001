import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../components/AuthContext';
import { useTheme } from '../components/ThemeContext';

export default function Index() {
  const router = useRouter();
  const { user, loading, isInitialized, recovery } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    if (!loading && isInitialized) {
      if (user && recovery) {
        router.replace('/(auth)/reset-password');
      } else if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [user, loading, isInitialized, recovery, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
}
