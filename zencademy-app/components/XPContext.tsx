import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase/client';
import { trainingService, userDataService } from '../lib/supabase/services';
import type { TrainingSession, UserData } from '../lib/supabase/types';
import { deriveLevelAndLevelXP } from '../utils/levels';
import { useTheme } from './ThemeContext';

function useProgressValue() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserData | null>(null);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    if (!user) return;
    const version = generation.current;
    const [p, history] = await Promise.all([userDataService.getUserData(user.id), trainingService.list(user.id)]);
    if (version !== generation.current) return;
    setProfile(p); setSessions(history); setError(null); setLoading(false);
  }, [user?.id]);
  useEffect(() => {
    generation.current++; setProfile(null); setSessions([]); setError(null);
    if (!user) { setLoading(false); return; }
    const version = generation.current; setLoading(true);
    const load = () => refresh().catch(() => { if (generation.current === version) { setError('Progress could not be loaded. Your saved data has not been reset.'); setLoading(false); } });
    void load();
    const channel = userDataService.subscribeToUserData(user.id, () => { void load(); });
    return () => { generation.current++; void supabase.removeChannel(channel); };
  }, [user?.id, refresh]);
  const edit = async (updates: Parameters<typeof userDataService.updateUserData>[1]) => {
    if (!user) throw new Error('Sign in first');
    await userDataService.updateUserData(user.id, updates); await refresh();
  };
  const xpByDay = new Map<string, number>(); const timeByDay = new Map<string, number>();
  const completedStats: Record<string, number> = {};
  for (const s of sessions) { if (!s.activity_day) continue; xpByDay.set(s.activity_day, (xpByDay.get(s.activity_day) || 0) + s.xp); timeByDay.set(s.activity_day, (timeByDay.get(s.activity_day) || 0) + s.duration_seconds / 3600); completedStats[s.activity_id] = (completedStats[s.activity_id] || 0) + 1; }
  const derived = deriveLevelAndLevelXP(profile?.points || 0);
  return { name: profile?.username || 'Member', brainType: profile?.brain_type || 'balanced', level: derived.level, xp: derived.levelXP, totalPoints: profile?.points || 0, coins: profile?.coins || 0, plan: profile?.plan || 'free', streak: profile?.daily_streak_count || 0, onboardingChecked: profile?.onboarding_checked || false,
    loading, error, refresh, sessions, profile, completed: profile?.completed_games || 0, completedStats,
    xpHistory: Array.from(xpByDay, ([date, xp]) => ({ date, xp })), timeHistory: Array.from(timeByDay, ([date, time]) => ({ date, time })),
    unlockedBadges: profile?.badges || [], equippedBadge: profile?.equipped_badge || null,
    setName: (name: string) => edit({ username: name.trim() }), setBrainType: (brain_type: string) => edit({ brain_type }), setOnboardingChecked: (onboarding_checked: boolean) => edit({ onboarding_checked }),
    setEquippedBadge: async (badgeId: string | null) => { await userDataService.equipBadge(badgeId); await refresh(); },
    purchaseShopItem: async (itemId: string) => { if (!user) throw new Error('Sign in first'); await userDataService.purchaseShopItem(user.id, itemId); await refresh(); },
  };
}
const XPContext = createContext<ReturnType<typeof useProgressValue> | null>(null);
export function XPProvider({ children }: React.PropsWithChildren) {
  const value = useProgressValue(); const { user, logout } = useAuth(); const { theme } = useTheme();
  if (user && (value.loading || value.error)) return <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.background }}>{value.loading ? <ActivityIndicator /> : <><Text style={{ color: theme.text }}>{value.error}</Text><Button title="Retry" onPress={() => { void value.refresh().catch(() => {}); }} /><Button title="Sign out" onPress={() => { void logout(); }} /></>}</View>;
  return <XPContext.Provider value={value}>{children}</XPContext.Provider>;
}
export function useXP() { const context = useContext(XPContext); if (!context) throw new Error('XPProvider missing'); return context; }
