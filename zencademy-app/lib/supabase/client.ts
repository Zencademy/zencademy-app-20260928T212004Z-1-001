import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
// Expo web static rendering evaluates this module in Node, where AsyncStorage touches `window`.
const isBrowser = typeof window !== 'undefined';
const authStorage = {
  getItem: (storageKey: string) => (isBrowser ? AsyncStorage.getItem(storageKey) : Promise.resolve(null)),
  setItem: (storageKey: string, value: string) => (isBrowser ? AsyncStorage.setItem(storageKey, value) : Promise.resolve()),
  removeItem: (storageKey: string) => (isBrowser ? AsyncStorage.removeItem(storageKey) : Promise.resolve()),
};

export const isSupabaseConfigured = Boolean(url?.startsWith('https://') && key && !url.includes('YOUR_PROJECT'));
export const supabase = createClient(isSupabaseConfigured ? url! : 'https://unconfigured.invalid', isSupabaseConfigured ? key! : 'not-configured', {
  auth: {
    storage: authStorage,
    storageKey: `zencademy-${url || 'setup'}-auth`,
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
export function requireBackend() {
  if (!isSupabaseConfigured) throw new Error('Configure the new Supabase project in .env.local first.');
}
