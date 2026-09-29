import type { User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { supabase, isSupabaseConfigured, requireBackend } from '../lib/supabase/client';

type Auth = { user: User | null; loading: boolean; error: string | null; isInitialized: boolean; isAuthenticated: boolean; isNewUser: boolean; recovery: boolean;
  signIn: (email: string, password: string) => Promise<void>; signUp: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>; retry: () => Promise<void>; requestReset: (email: string) => Promise<void>; verifyReset: (email: string, token: string) => Promise<void>; changePassword: (password: string) => Promise<void> };
const AuthContext = createContext<Auth | null>(null);
export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recovery, setRecovery] = useState(false);
  const retry = async () => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    setLoading(true); setError(null);
    try { const result = await supabase.auth.getSession(); if (result.error) throw result.error; setUser(result.data.session?.user ?? null); }
    catch { setError('Could not restore your session. Check your connection and retry.'); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    let active = true;
    if (!isSupabaseConfigured) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data, error: failure }) => {
      if (!active) return;
      if (failure) setError('Could not restore your session. Please retry.');
      else setUser(data.session?.user ?? null);
    }).catch(() => { if (active) setError('Could not restore your session. Please retry.'); }).finally(() => { if (active) setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      setUser(session?.user ?? null); setLoading(false);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (event === 'SIGNED_OUT') setRecovery(false);
    });
    const listener = AppState.addEventListener('change', state => state === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh());
    return () => { active = false; subscription.unsubscribe(); listener.remove(); supabase.auth.stopAutoRefresh(); };
  }, []);
  const signIn = async (email: string, password: string) => {
    requireBackend(); const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password }); if (error) throw error;
  };
  const signUp = async (email: string, password: string) => {
    requireBackend(); const { data, error } = await supabase.auth.signUp({ email: email.trim(), password }); if (error) throw error;
    return Boolean(data.session);
  };
  const logout = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const { error } = await supabase.auth.signOut(); if (error) throw error;
  };
  const requestReset = async (email: string) => { const { error } = await supabase.auth.resetPasswordForEmail(email.trim()); if (error) throw error; };
  const verifyReset = async (email: string, token: string) => { setRecovery(true); const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: 'recovery' }); if (error) { setRecovery(false); throw error; } };
  const changePassword = async (password: string) => { if (password.length < 8) throw new Error('Use at least 8 characters.'); const { error } = await supabase.auth.updateUser({ password }); if (error) throw error; setRecovery(false); };
  return <AuthContext.Provider value={{ user, loading, error, retry, signIn, signUp, logout, requestReset, verifyReset, changePassword, recovery, isInitialized: !loading, isAuthenticated: !!user, isNewUser: false }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('AuthProvider missing'); return value; }
