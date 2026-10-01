import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'expo-router';
import { newRequestId } from '../lib/requestId';
import { useXP } from '../components/XPContext';
import { activityIdFromPath } from '../lib/activityIds';
import { type Difficulty, boostedSessionReward, coinsForXp } from '../lib/progression';
import { RewardAttempt, errorMessage } from '../lib/rewardAttempt';
import { trainingService } from '../lib/supabase/services';

export function useGameReward(activityId?: string, autoStart = true) {
  const { plan, refresh, applyConfirmedReward, activeBoosts } = useXP();
  const pathname = usePathname();
  const routeId = activityIdFromPath(pathname);
  const resolvedId = activityId || routeId;
  const attempt = useRef<RewardAttempt | null>(null);
  const notified = useRef<string | null>(null);
  const mounted = useRef(false);
  const [last, setLast] = useState<{ xp: number; coins: number; activityId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const getAttempt = useCallback(() => {
    if (!resolvedId) throw new Error('This activity is not configured for rewards.');
    if (!attempt.current || attempt.current.activity !== resolvedId) {
      attempt.current = new RewardAttempt(newRequestId(), resolvedId, trainingService);
    }
    return attempt.current;
  }, [resolvedId]);

  const start = useCallback(async () => {
    try { await getAttempt().start(); }
    catch (failure) {
      if (mounted.current) setError(errorMessage(failure, 'Could not start the session. Check your connection.'));
    }
  }, [getAttempt]);

  const reset = useCallback(() => {
    if (attempt.current?.saving) return false;
    attempt.current = null;
    notified.current = null;
    setLast(null);
    setError(null);
    if (autoStart) void start();
    return true;
  }, [autoStart, start]);

  useEffect(() => {
    mounted.current = true;
    if (autoStart) void start();
    return () => { mounted.current = false; };
  }, [autoStart, start]);

  const claim = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const current = getAttempt();
      const session = await current.claim();
      if (!mounted.current || current !== attempt.current) return null;
      const confirmed = { xp: session.xp, coins: session.coins, activityId: session.activity_id };
      setLast(confirmed);
      if (notified.current !== session.id) {
        notified.current = session.id;
        applyConfirmedReward(session);
      }
      // Refresh failure does not mean the already-confirmed reward failed.
      await refresh().catch(() => {
        if (mounted.current) setError('Reward saved. Reconnect and retry to refresh your balance.');
      });
      return confirmed;
    } catch (failure) {
      if (mounted.current) setError(errorMessage(failure, 'Reward could not be saved. Please retry.'));
      return null;
    } finally {
      if (mounted.current) setBusy(false);
    }
  }, [applyConfirmedReward, getAttempt, refresh]);

  const award = useCallback((_legacyEstimate?: number) => claim(), [claim]);
  const awardFor = useCallback((_difficulty: Difficulty) => claim(), [claim]);
  const estimate = useCallback(
    (d: Difficulty) => boostedSessionReward(d, plan, activeBoosts),
    [plan, activeBoosts]
  );
  return {
    award,
    awardFor,
    retry: claim,
    start,
    reset,
    last,
    error,
    busy,
    plan,
    activeBoosts,
    estimateXp: (d: Difficulty) => estimate(d).xp,
    estimateCoins: (xpOrDifficulty: number | Difficulty) =>
      typeof xpOrDifficulty === 'number'
        ? coinsForXp(xpOrDifficulty)
        : estimate(xpOrDifficulty).coins,
    activityId: resolvedId,
  };
}
