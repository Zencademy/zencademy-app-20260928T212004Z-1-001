import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // Accent colors
  primary: string;
  secondary: string;
  accent: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Interactive colors
  button: string;
  buttonText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
  
  // Shadow colors
  shadow: string;
  
  // Overlay colors
  overlay: string;
}

const lightTheme: ThemeColors = {
  // Background colors
  background: '#ffffff',
  surface: '#f8f9fa',
  card: '#ffffff',
  
  // Text colors
  text: '#1a1a1a',
  textSecondary: '#666666',
  textTertiary: '#999999',
  
  // Border colors
  border: '#e8e8e8',
  borderLight: '#f0f0f0',
  
  // Accent colors
  primary: '#6366F1',
  secondary: '#8B5CF6',
  accent: '#F59E0B',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Interactive colors
  button: '#1a1a1a',
  buttonText: '#ffffff',
  buttonSecondary: '#f3f4f6',
  buttonSecondaryText: '#6b7280',
  
  // Shadow colors
  shadow: '#000000',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.8)',
};

const darkTheme: ThemeColors = {
  // Background colors
  background: '#0f0f0f',
  surface: '#1a1a1a',
  card: '#2a2a2a',
  
  // Text colors
  text: '#ffffff',
  textSecondary: '#b3b3b3',
  textTertiary: '#808080',
  
  // Border colors
  border: '#404040',
  borderLight: '#333333',
  
  // Accent colors
  primary: '#8B5CF6',
  secondary: '#A78BFA',
  accent: '#FBBF24',
  
  // Status colors
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  
  // Interactive colors
  button: '#ffffff',
  buttonText: '#0f0f0f',
  buttonSecondary: '#404040',
  buttonSecondaryText: '#b3b3b3',
  
  // Shadow colors
  shadow: '#000000',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.9)',
};

interface ThemeContextType {
  theme: ThemeColors;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load theme from AsyncStorage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme_mode');
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setThemeModeState(savedTheme);
        }
      } catch (error) {
        // Error loading theme, use default
      }
      setIsInitialized(true);
    };

    loadTheme();
  }, []);

  // Save theme to AsyncStorage when it changes
  useEffect(() => {
    if (isInitialized) {
      AsyncStorage.setItem('@theme_mode', themeMode).catch(() => {
        // Error saving theme
      });
    }
  }, [themeMode, isInitialized]);

  const toggleTheme = () => {
    setThemeModeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}





