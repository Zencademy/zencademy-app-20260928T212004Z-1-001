import type { User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { authRedirectUrl, createSessionFromUrl, isRecoveryUrl } from '../lib/authRedirect';
import { supabase, isSupabaseConfigured, requireBackend } from '../lib/supabase/client';

const FRESH_SIGNUP_KEY = '@zencademy_fresh_signup';

type Auth = {
  user: User | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  isAuthenticated: boolean;
  isNewUser: boolean;
  recovery: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  retry: () => Promise<void>;
  requestReset: (email: string) => Promise<void>;
  verifyReset: (email: string, token: string) => Promise<void>;
  changePassword: (password: string) => Promise<void>;
  clearNewUserFlag: () => Promise<void>;
};

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recovery, setRecovery] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const clearNewUserFlag = async () => {
    setIsNewUser(false);
    try {
      await AsyncStorage.removeItem(FRESH_SIGNUP_KEY);
    } catch {
      /* ignore */
    }
  };

  const retry = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await supabase.auth.getSession();
      if (result.error) throw result.error;
      setUser(result.data.session?.user ?? null);
    } catch {
      setError('Could not restore your session. Check your connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    void AsyncStorage.getItem(FRESH_SIGNUP_KEY).then((v) => {
      if (active && v === '1') setIsNewUser(true);
    });
    supabase.auth
      .getSession()
      .then(({ data, error: failure }) => {
        if (!active) return;
        if (failure) setError('Could not restore your session. Please retry.');
        else setUser(data.session?.user ?? null);
      })
      .catch(() => {
        if (active) setError('Could not restore your session. Please retry.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (event === 'SIGNED_OUT') {
        setRecovery(false);
        setIsNewUser(false);
      }
    });

    const handleUrl = async (url: string | null) => {
      if (!active || !url) return;
      try {
        const session = await createSessionFromUrl(url);
        if (!active || !session) return;
        if (isRecoveryUrl(url)) setRecovery(true);
      } catch {
        /* stale / already-used links — user can request a new one */
      }
    };

    void Linking.getInitialURL().then((url) => {
      void handleUrl(url);
    });
    const linkSub = Linking.addEventListener('url', ({ url }) => {
      void handleUrl(url);
    });

    const listener = AppState.addEventListener('change', (state) =>
      state === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh()
    );
    return () => {
      active = false;
      subscription.unsubscribe();
      linkSub.remove();
      listener.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    requireBackend();
    await clearNewUserFlag();
    const { error: failure } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (failure) throw failure;
  };

  const signUp = async (email: string, password: string) => {
    requireBackend();
    const { data, error: failure } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: authRedirectUrl(),
      },
    });
    if (failure) throw failure;
    setIsNewUser(true);
    try {
      await AsyncStorage.setItem(FRESH_SIGNUP_KEY, '1');
    } catch {
      /* ignore */
    }
    return Boolean(data.session);
  };

  const logout = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await clearNewUserFlag();
    const { error: failure } = await supabase.auth.signOut();
    if (failure) throw failure;
  };

  const requestReset = async (email: string) => {
    requireBackend();
    const { error: failure } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: authRedirectUrl(),
    });
    if (failure) throw failure;
  };

  const verifyReset = async (email: string, token: string) => {
    setRecovery(true);
    try {
      // Full verify URL pasted from email (works even if redirect is localhost)
      if (token.includes('http') || token.includes('token=')) {
        const { sessionFromRecoveryLink } = await import('../lib/authRedirect');
        await sessionFromRecoveryLink(token);
        return;
      }
      const { error: failure } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'recovery',
      });
      if (failure) throw failure;
    } catch (error) {
      setRecovery(false);
      throw error;
    }
  };

  const changePassword = async (password: string) => {
    if (password.length < 8) throw new Error('Use at least 8 characters.');
    const { error: failure } = await supabase.auth.updateUser({ password });
    if (failure) throw failure;
    setRecovery(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        retry,
        signIn,
        signUp,
        logout,
        requestReset,
        verifyReset,
        changePassword,
        clearNewUserFlag,
        recovery,
        isNewUser,
        isInitialized: !loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider missing');
  return value;
}
