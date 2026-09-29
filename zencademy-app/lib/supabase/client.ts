import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const isSupabaseConfigured = Boolean(url?.startsWith('https://') && key && !url.includes('YOUR_PROJECT'));
export const supabase = createClient(isSupabaseConfigured ? url! : 'https://unconfigured.invalid', isSupabaseConfigured ? key! : 'not-configured', {
  auth: { storage: AsyncStorage, storageKey: `zencademy-${url || 'setup'}-auth`, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: 'pkce' },
});
export function requireBackend() {
  if (!isSupabaseConfigured) throw new Error('Configure the new Supabase project in .env.local first.');
}
