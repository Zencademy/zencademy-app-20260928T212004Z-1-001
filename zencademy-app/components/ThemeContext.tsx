import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark';
export type AccentId = 'crimson' | 'ocean' | 'forest' | 'amber' | 'violet' | 'ink';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderLight: string;
  primary: string;
  secondary: string;
  accent: string;
  flame: string;
  xp: string;
  xpSoft: string;
  xpBorder: string;
  coin: string;
  coinSoft: string;
  coinBorder: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  button: string;
  buttonText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
  shadow: string;
  overlay: string;
}

export const ACCENT_PRESETS: { id: AccentId; label: string; light: string; dark: string }[] = [
  { id: 'crimson', label: 'Crimson', light: '#C8102E', dark: '#E11D48' },
  { id: 'ocean', label: 'Ocean', light: '#0369A1', dark: '#38BDF8' },
  { id: 'forest', label: 'Forest', light: '#15803D', dark: '#4ADE80' },
  { id: 'amber', label: 'Amber', light: '#B45309', dark: '#FBBF24' },
  { id: 'violet', label: 'Violet', light: '#6D28D9', dark: '#A78BFA' },
  { id: 'ink', label: 'Ink', light: '#111111', dark: '#F5F5F5' },
];

const lightBase: Omit<ThemeColors, 'primary' | 'accent' | 'button' | 'error'> = {
  background: '#F7F7F5',
  surface: '#EEEEEC',
  card: '#FFFFFF',
  text: '#0A0A0A',
  textSecondary: '#3F3F3F',
  textTertiary: '#737373',
  border: '#E2E2E0',
  borderLight: '#EFEFEE',
  secondary: '#0A0A0A',
  flame: '#F97316',
  xp: '#0A0A0A',
  xpSoft: '#F0F0EE',
  xpBorder: '#D6D6D4',
  coin: '#A16207',
  coinSoft: '#FBF3D5',
  coinBorder: '#E8D48A',
  success: '#15803D',
  warning: '#C2410C',
  info: '#262626',
  buttonText: '#FFFFFF',
  buttonSecondary: '#0A0A0A',
  buttonSecondaryText: '#FFFFFF',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.55)',
};

const darkBase: Omit<ThemeColors, 'primary' | 'accent' | 'button' | 'error'> = {
  background: '#080808',
  surface: '#121212',
  card: '#161616',
  text: '#F4F4F4',
  textSecondary: '#A8A8A8',
  textTertiary: '#6F6F6F',
  border: '#2A2A2A',
  borderLight: '#1C1C1C',
  secondary: '#F4F4F4',
  flame: '#FB923C',
  xp: '#F4F4F4',
  xpSoft: '#1A1A1A',
  xpBorder: '#2E2E2E',
  coin: '#EAB308',
  coinSoft: '#1C1608',
  coinBorder: '#5C4A12',
  success: '#22C55E',
  warning: '#F97316',
  info: '#D4D4D4',
  buttonText: '#FFFFFF',
  buttonSecondary: '#262626',
  buttonSecondaryText: '#F4F4F4',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.82)',
};

function buildTheme(mode: ThemeMode, accentId: AccentId): ThemeColors {
  const preset = ACCENT_PRESETS.find(p => p.id === accentId) || ACCENT_PRESETS[0];
  const color = mode === 'dark' ? preset.dark : preset.light;
  const base = mode === 'dark' ? darkBase : lightBase;
  const buttonText = accentId === 'ink' && mode === 'dark' ? '#0A0A0A' : '#FFFFFF';
  return {
    ...base,
    primary: color,
    accent: color,
    button: color,
    error: accentId === 'crimson' ? color : (mode === 'dark' ? '#E11D48' : '#C8102E'),
    buttonText,
  };
}

interface ThemeContextType {
  theme: ThemeColors;
  themeMode: ThemeMode;
  accentId: AccentId;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentId: (id: AccentId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [accentId, setAccentIdState] = useState<AccentId>('crimson');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const ink = await AsyncStorage.getItem('@theme_ink_v1');
        if (!ink) {
          setThemeModeState('light');
          await AsyncStorage.setItem('@theme_ink_v1', '1');
          await AsyncStorage.setItem('@theme_mode', 'light');
        } else {
          const savedTheme = await AsyncStorage.getItem('@theme_mode');
          if (savedTheme === 'light' || savedTheme === 'dark') {
            setThemeModeState(savedTheme);
          }
        }
        const savedAccent = await AsyncStorage.getItem('@accent_id');
        if (savedAccent && ACCENT_PRESETS.some(p => p.id === savedAccent)) {
          setAccentIdState(savedAccent as AccentId);
        }
      } catch {
        // defaults
      }
      setIsInitialized(true);
    };
    void loadTheme();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      AsyncStorage.setItem('@theme_mode', themeMode).catch(() => {});
    }
  }, [themeMode, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      AsyncStorage.setItem('@accent_id', accentId).catch(() => {});
    }
  }, [accentId, isInitialized]);

  const toggleTheme = () => setThemeModeState(prev => (prev === 'light' ? 'dark' : 'light'));
  const setThemeMode = (mode: ThemeMode) => setThemeModeState(mode);
  const setAccentId = (id: AccentId) => setAccentIdState(id);
  const theme = useMemo(() => buildTheme(themeMode, accentId), [themeMode, accentId]);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, accentId, toggleTheme, setThemeMode, setAccentId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
