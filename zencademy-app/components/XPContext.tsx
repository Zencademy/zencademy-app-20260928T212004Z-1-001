import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBoostPurchases } from '../lib/boostPurchases';
import { newRequestId } from '../lib/requestId';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';
import { useAuth } from './AuthContext';
import { SHOP_ITEMS, isBoostAvailable, isBoostItem, shopItemById } from '../constants/shop';
import { syncBoostsFromServer, type ActiveBoost } from '../lib/inventory';
import { playSfx } from '../lib/sound/SoundPack';
import { supabase } from '../lib/supabase/client';
import { trainingService, userDataService } from '../lib/supabase/services';
import type { TrainingSession, UserData } from '../lib/supabase/types';
import { deriveLevelAndLevelXP } from '../utils/levels';
import { useRewardToast } from './RewardToast';
import { useTheme } from './ThemeContext';

const buyBoost = createBoostPurchases(AsyncStorage, trainingService.purchaseBoost, newRequestId);

function shopFailureMessage(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error && 'message' in error
        ? String((error as { message: unknown }).message)
        : '';
  if (/Not enough coins/i.test(raw)) return 'Not enough coins.';
  if (/Unknown item|Unknown boost/i.test(raw)) return 'Item not found in the store catalog.';
  if (/not available/i.test(raw)) return 'This boost is not available.';
  if (/Authentication required/i.test(raw)) return 'Sign in to buy.';
  if (/Purchase conflict/i.test(raw)) return 'Purchase conflict — try again.';
  if (/invalid input syntax for type uuid/i.test(raw)) return 'Purchase failed — try again.';
  return raw || 'Purchase failed. Please retry.';
}
type ConfirmedReward = { id: string; xp: number; coins: number };

function useProgressValue() {
  const { user } = useAuth();
  const toast = useRewardToast();
  const [profile, setProfile] = useState<UserData | null>(null);
  const [days, setDays] = useState<Awaited<ReturnType<typeof trainingService.days>>>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [totals, setTotals] = useState<{ session_count: number; total_xp: number; total_coins: number; total_duration_seconds: number } | null>(null);
  const [activeBoosts, setActiveBoosts] = useState<ActiveBoost[]>([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const notified = useRef(new Set<string>());

  const refresh = useCallback(async () => {
    if (!user) return;
    const version = generation.current;
    try {
      // Profile first — unlocks Home/onboarding without waiting on history.
      const p = await userDataService.getUserData(user.id);
      if (version !== generation.current) return;
      setProfile(p);
      setLoading(false);
      setError(null);
    } catch (failure) {
      if (version !== generation.current) return;
      setError('Progress could not be loaded. Your saved data has not been reset.');
      setLoading(false);
      throw failure;
    }

    const settled = await Promise.allSettled([
      trainingService.list(user.id),
      trainingService.totals(),
      trainingService.listBoosts(),
      trainingService.days(),
    ]);
    if (version !== generation.current) return;

    const [history, serverTotals, boosts, dailyStats] = settled;
    if (history.status === 'fulfilled') setSessions(history.value);
    if (dailyStats.status === 'fulfilled') setDays(dailyStats.value);
    if (serverTotals.status === 'fulfilled') setTotals(serverTotals.value);
    if (boosts.status === 'fulfilled') {
      const next = await syncBoostsFromServer(user.id, boosts.value).catch(() =>
        boosts.value
          .map(b => ({ id: b.boost_id, expiresAt: Date.parse(b.expires_at) }))
          .filter(b => Number.isFinite(b.expiresAt) && b.expiresAt > Date.now())
      );
      setActiveBoosts(next);
    }
  }, [user?.id]);

  useEffect(() => {
    generation.current++;
    if (!user) return;
    const version = generation.current;
    const load = () =>
      refresh().catch(() => {
        if (generation.current === version) {
          setError('Progress could not be loaded. Your saved data has not been reset.');
          setLoading(false);
        }
      });
    void load();
    const channel = userDataService.subscribeToUserData(user.id, () => {
      void load();
    });
    return () => {
      generation.current++;
      void supabase.removeChannel(channel);
    };
  }, [user?.id, refresh]);

  const edit = async (updates: Parameters<typeof userDataService.updateUserData>[1]) => {
    if (!user) throw new Error('Sign in first');
    await userDataService.updateUserData(user.id, updates);
    await refresh();
  };

  const xpByDay = new Map<string, number>();
  const timeByDay = new Map<string, number>();
  const completedStats: Record<string, number> = {};
  for (const s of sessions) {
    if (!s.activity_day) continue;
    xpByDay.set(s.activity_day, (xpByDay.get(s.activity_day) || 0) + s.xp);
    timeByDay.set(s.activity_day, (timeByDay.get(s.activity_day) || 0) + s.duration_seconds / 3600);
    completedStats[s.activity_id] = (completedStats[s.activity_id] || 0) + 1;
  }
  const derived = deriveLevelAndLevelXP(profile?.points || 0);
  const historyTruncated = totals != null && totals.session_count > sessions.length;

  const applyConfirmedReward = useCallback(
    (reward: ConfirmedReward) => {
      if (notified.current.has(reward.id)) return;
      notified.current.add(reward.id);
      if (!reward.xp && !reward.coins) return;
      const now = Date.now();
      const boosted =
        activeBoosts.some(b => b.id === 'boost-xp-2h' && b.expiresAt > now) ||
        activeBoosts.some(b => b.id === 'boost-coin-rain' && b.expiresAt > now);
      toast?.showReward({
        xp: reward.xp,
        coins: reward.coins,
        streak: profile?.daily_streak_count || undefined,
        label: boosted ? 'BOOSTED REWARD' : 'SESSION REWARD',
      });
      playSfx('reward');
    },
    [activeBoosts, profile?.daily_streak_count, toast]
  );

  return {
    name: profile?.username || 'Member',
    brainType: profile?.brain_type || 'balanced',
    level: derived.level,
    xp: derived.levelXP,
    totalPoints: profile?.points || 0,
    coins: profile?.coins || 0,
    plan: profile?.plan || 'free',
    streak: profile?.daily_streak_count || 0,
    onboardingChecked: profile?.onboarding_checked || false,
    loading,
    error,
    refresh,
    sessions,
    profile,
    totals,
    historyTruncated,
    days,
    completed: profile?.completed_games || 0,
    completedStats,
    xpHistory: Array.from(xpByDay, ([date, xp]) => ({ date, xp })),
    timeHistory: Array.from(timeByDay, ([date, time]) => ({ date, time })),
    unlockedBadges: profile?.badges || [],
    equippedBadge: profile?.equipped_badge || null,
    ownedEbooks: profile?.owned_ebooks || [],
    activeBoosts,
    applyConfirmedReward,
    setName: (name: string) => edit({ username: name.trim() }),
    setBrainType: (brain_type: string) => edit({ brain_type }),
    setOnboardingChecked: (onboarding_checked: boolean) => edit({ onboarding_checked }),
    setEquippedBadge: async (badgeId: string | null) => {
      await userDataService.equipBadge(badgeId);
      await refresh();
      playSfx('tap');
    },
    purchaseShopItem: async (itemId: string) => {
      if (!user) throw new Error('Sign in first');
      const item = shopItemById(itemId) || SHOP_ITEMS.find(i => i.id === itemId);
      if (!item) throw new Error('Unknown item');

      const applyLocal = () => {
        setProfile(prev => {
          if (!prev) return prev;
          const coins = Math.max(0, (prev.coins || 0) - item.price);
          if (isBoostItem(itemId)) return { ...prev, coins };
          const badges = prev.badges?.includes(itemId) ? prev.badges : [...(prev.badges || []), itemId];
          return { ...prev, coins, badges };
        });
      };

      try {
        if (isBoostItem(itemId)) {
          if (!isBoostAvailable(itemId)) {
            throw new Error('This boost is not available yet');
          }
          await buyBoost(user.id, itemId);
          applyLocal();
          const hours = item.boostHours ?? 1;
          const expiresAt = Date.now() + hours * 3600 * 1000;
          setActiveBoosts(prev => {
            const rest = prev.filter(b => b.id !== itemId && b.expiresAt > Date.now());
            const existing = prev.find(b => b.id === itemId);
            const nextExpiry = existing && existing.expiresAt > Date.now()
              ? existing.expiresAt + hours * 3600 * 1000
              : expiresAt;
            return [...rest, { id: itemId, expiresAt: nextExpiry }];
          });
          await refresh().catch(() => {});
          playSfx('unlock');
          return;
        }
        await userDataService.purchaseShopItem(user.id, itemId);
        applyLocal();
        await refresh().catch(() => {});
        playSfx('unlock');
      } catch (error) {
        await refresh().catch(() => {});
        throw new Error(shopFailureMessage(error));
      }
    },
    purchaseEbook: async (ebookId: string, _price: number) => {
      if (!user) throw new Error('Sign in first');
      const price = Math.max(0, Math.round(_price || 0));
      setProfile(prev =>
        prev && price > 0
          ? { ...prev, coins: Math.max(0, prev.coins - price), owned_ebooks: [...(prev.owned_ebooks || []), ebookId] }
          : prev
      );
      try {
        await userDataService.purchaseEbook(ebookId);
        await refresh();
        playSfx('unlock');
      } catch (err) {
        await refresh();
        throw err;
      }
    },
    /** Client cannot choose XP amounts. Use useGameReward / claim_activity_reward. */
    addXP: async () => {
      throw new Error('Use training claim (useGameReward); arbitrary XP grants are disabled');
    },
    addXp: async () => {
      throw new Error('Use training claim (useGameReward); arbitrary XP grants are disabled');
    },
    incrementCompletedGame: async () => {
      /* Server increments completed_games on claim/complete. */
    },
    /** Streak advances on server when training is claimed; login alone does not mint XP. */
    updateDailyLoginStreak: async () => {
      /* no-op: daily_streak_count is owned by complete_activity / claim_activity_reward */
    },
  };
}

const XPContext = createContext<ReturnType<typeof useProgressValue> | null>(null);

function UserProgress({ children }: React.PropsWithChildren) {
  const value = useProgressValue();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  if (user && (value.loading || value.error)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.background }}>
        {value.loading ? (
          <ActivityIndicator />
        ) : (
          <>
            <Text style={{ color: theme.text }}>{value.error}</Text>
            <Button
              title="Retry"
              onPress={() => {
                void value.refresh().catch(() => {});
              }}
            />
            <Button
              title="Sign out"
              onPress={() => {
                void logout();
              }}
            />
          </>
        )}
      </View>
    );
  }
  return <XPContext.Provider value={value}>{children}</XPContext.Provider>;
}

export function useXP() {
  const context = useContext(XPContext);
  if (!context) throw new Error('XPProvider missing');
  return context;
}

export function XPProvider({ children }: React.PropsWithChildren) {
  const { user } = useAuth();
  return <UserProgress key={user?.id || 'guest'}>{children}</UserProgress>;
}
