import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../../components/AuthContext';
import { useTheme } from '../../components/ThemeContext';
import { type } from '../../components/ui/type';
import { createSessionFromUrl, isRecoveryUrl } from '../../lib/authRedirect';

/** Landing route for email confirm / password-recovery deep links. */
export default function AuthCallbackScreen() {
  const { theme } = useTheme();
  const { recovery } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [message, setMessage] = useState('Opening your link…');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const incoming = await Linking.getInitialURL();
        // Rebuild URL from route params when the router stripped the query (PKCE code flow).
        let url = incoming;
        if (!url || (!url.includes('code=') && !url.includes('access_token'))) {
          const code = typeof params.code === 'string' ? params.code : null;
          if (code) {
            url = Linking.createURL('auth/callback', { queryParams: { code } });
          }
        }
        if (!url) {
          setMessage('No auth link found. Request a new email and try again.');
          return;
        }
        const session = await createSessionFromUrl(url);
        if (!alive) return;
        if (!session) {
          // Session may already have been set by AuthProvider’s Linking listener.
          if (recovery || isRecoveryUrl(url)) {
            router.replace('/(auth)/reset-password');
            return;
          }
          setMessage('Link expired or already used. Sign in or request a new one.');
          return;
        }
        if (recovery || isRecoveryUrl(url)) {
          router.replace('/(auth)/reset-password');
        } else {
          router.replace('/(tabs)');
        }
      } catch (error: unknown) {
        if (!alive) return;
        setMessage(error instanceof Error ? error.message : 'Could not open auth link.');
      }
    })();
    return () => {
      alive = false;
    };
  }, [params.code, recovery, router]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background,
        padding: 24,
      }}
    >
      <ActivityIndicator color={theme.primary} />
      <Text style={[type.body, { color: theme.textSecondary, marginTop: 16, textAlign: 'center' }]}>
        {message}
      </Text>
    </View>
  );
}
