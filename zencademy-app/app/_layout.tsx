import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router/react-navigation';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../components/AuthContext';
import { RewardToastProvider } from '../components/RewardToast';
import { ScreensaverProvider } from '../components/ScreensaverContext';
import ScreensaverOverlay from '../components/ScreensaverOverlay';
import { ThemeProvider, useTheme } from '../components/ThemeContext';
import { XPProvider } from '../components/XPContext';
import { SoundProvider } from '../lib/sound/SoundPack';

function AppContent() {
  const { loading } = useAuth();
  const { theme, themeMode } = useTheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    // No ad initialization
  }, []);

  if (!loaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SoundProvider>
        <RewardToastProvider>
          <ScreensaverProvider>
            <XPProvider>
              <NavigationThemeProvider value={themeMode === 'dark' ? DarkTheme : DefaultTheme}>
                <View style={{ flex: 1 }}>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="auth/callback" />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                  <ScreensaverOverlay />
                  <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} hidden={true} />
                </View>
              </NavigationThemeProvider>
            </XPProvider>
          </ScreensaverProvider>
        </RewardToastProvider>
      </SoundProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
