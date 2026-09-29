import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router/react-navigation';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../components/AuthContext';
import { ScreensaverProvider } from "../components/ScreensaverContext";
import { ThemeProvider, useTheme } from '../components/ThemeContext';
import { XPProvider } from '../components/XPContext';
// Ads removed

function AppContent() {
  const { user, loading } = useAuth();
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
      <ScreensaverProvider>
        <XPProvider>
          <NavigationThemeProvider value={themeMode === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              {user ? (
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              ) : (
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              )}
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style={themeMode === 'dark' ? "light" : "dark"} hidden={true} />
          </NavigationThemeProvider>
        </XPProvider>
      </ScreensaverProvider>
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
