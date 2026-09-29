import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';
import { useAuth } from './AuthContext';
import { SHOP_ITEMS, isBoostItem, shopItemById } from '../constants/shop';
import { activateBoost } from '../lib/inventory';
import { coinsForXp } from '../lib/progression';
import { playSfx } from '../lib/sound/SoundPack';
import { supabase } from '../lib/supabase/client';
import { trainingService, userDataService } from '../lib/supabase/services';
import type { TrainingSession, UserData } from '../lib/supabase/types';
import { deriveLevelAndLevelXP } from '../utils/levels';
import { useRewardToast } from './RewardToast';
import { useTheme } from './ThemeContext';

function useProgressValue() {
  const { user } = useAuth();
  const toast = useRewardToast();
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
  async function grantReward(points: number) {
    if (!user) throw new Error('Sign in first');
    if (points === 0) return;
    if (points < 0) throw new Error('XP cannot be spent or reduced from training.');
    const coins = coinsForXp(points);
    // Optimistic UI so wallet updates immediately; server remains source of truth.
    setProfile(prev => prev ? { ...prev, points: prev.points + points, coins: prev.coins + coins } : prev);
    toast?.showReward({ xp: points, coins, streak: profile?.daily_streak_count || undefined, label: 'SESSION REWARD' });
    playSfx('reward');
    try {
      await trainingService.recordReward(points, coins);
      await refresh();
    } catch (error) {
      await refresh();
      throw error;
    }
  }
  return {
    name: profile?.username || 'Member', brainType: profile?.brain_type || 'balanced', level: derived.level, xp: derived.levelXP, totalPoints: profile?.points || 0, coins: profile?.coins || 0, plan: profile?.plan || 'free', streak: profile?.daily_streak_count || 0, onboardingChecked: profile?.onboarding_checked || false,
    loading, error, refresh, sessions, profile, completed: profile?.completed_games || 0, completedStats,
    xpHistory: Array.from(xpByDay, ([date, xp]) => ({ date, xp })), timeHistory: Array.from(timeByDay, ([date, time]) => ({ date, time })),
    unlockedBadges: profile?.badges || [], equippedBadge: profile?.equipped_badge || null, ownedEbooks: profile?.owned_ebooks || [],
    setName: (name: string) => edit({ username: name.trim() }), setBrainType: (brain_type: string) => edit({ brain_type }), setOnboardingChecked: (onboarding_checked: boolean) => edit({ onboarding_checked }),
    setEquippedBadge: async (badgeId: string | null) => {
      await userDataService.equipBadge(badgeId);
      await refresh();
      playSfx('tap');
    },
    purchaseShopItem: async (itemId: string) => {
      if (!user) throw new Error('Sign in first');
      const item = shopItemById(itemId) || SHOP_ITEMS.find(i => i.id === itemId);
      if (!item) throw new Error('Unknown item');
      if (isBoostItem(itemId)) {
        setProfile(prev => prev ? { ...prev, coins: Math.max(0, prev.coins - item.price) } : prev);
        try {
          try {
            await userDataService.spendCoins(item.price, itemId);
          } catch {
            // Fallback until spend_coins migration is applied: one-time catalog purchase.
            await userDataService.purchaseShopItem(user.id, itemId);
          }
          await activateBoost(itemId);
          await refresh();
          playSfx('unlock');
        } catch (error) {
          await refresh();
          throw error;
        }
        return;
      }
      await userDataService.purchaseShopItem(user.id, itemId);
      await refresh();
      playSfx('unlock');
    },
    purchaseEbook: async (ebookId: string, _price: number) => {
      if (!user) throw new Error('Sign in first');
      const price = Math.max(0, Math.round(_price || 0));
      setProfile(prev => prev && price > 0 ? { ...prev, coins: Math.max(0, prev.coins - price), owned_ebooks: [...(prev.owned_ebooks || []), ebookId] } : prev);
      try {
        await userDataService.purchaseEbook(ebookId);
        await refresh();
        playSfx('unlock');
      } catch (error) {
        await refresh();
        throw error;
      }
    },
    addXP: async (points = 0) => grantReward(points),
    addXp: async (points = 0) => grantReward(points),
    incrementCompletedGame: async () => { /* tracked by server sessions when wired */ },
  };
}
const XPContext = createContext<ReturnType<typeof useProgressValue> | null>(null);
export function XPProvider({ children }: React.PropsWithChildren) {
  const value = useProgressValue(); const { user, logout } = useAuth(); const { theme } = useTheme();
  if (user && (value.loading || value.error)) return <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.background }}>{value.loading ? <ActivityIndicator /> : <><Text style={{ color: theme.text }}>{value.error}</Text><Button title="Retry" onPress={() => { void value.refresh().catch(() => {}); }} /><Button title="Sign out" onPress={() => { void logout(); }} /></>}</View>;
  return <XPContext.Provider value={value}>{children}</XPContext.Provider>;
}
export function useXP() { const context = useContext(XPContext); if (!context) throw new Error('XPProvider missing'); return context; }
