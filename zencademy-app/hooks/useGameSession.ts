import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useXP } from '../components/XPContext';
import { newRequestId } from '../lib/requestId';
import { trainingService } from '../lib/supabase/services';

/** One server-owned reward per attempt. Retrying uses the same idempotency key. */
export function useGameSession(activityId: string) {
  const progress = useXP();
  const attempt = useRef({
    id: newRequestId(),
    saving: false,
    done: false,
    start: null as Promise<void> | null,
  });
  const mounted = useRef(true);

  const start = () => {
    const current = attempt.current;
    if (!current.start) {
      current.start = trainingService.start(current.id, activityId).catch(error => {
        current.start = null;
        throw error;
      });
    }
    return current.start;
  };

  useEffect(() => {
    mounted.current = true;
    void start()?.catch(() => {});
    return () => {
      mounted.current = false;
    };
    // start is stable for the current attempt; re-run when activity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  const award = async () => {
    const current = attempt.current;
    if (current.saving || current.done) return;
    current.saving = true;
    try {
      await start();
      const result = await trainingService.complete(current.id);
      current.done = true;
      progress.applyConfirmedReward(result);
      await progress.refresh();
      if (mounted.current) Alert.alert('Progress saved', `+${result.xp} XP · +${result.coins} coins`);
    } catch (error) {
      if (mounted.current) {
        Alert.alert(
          'Progress not saved',
          error instanceof Error ? error.message : 'Check your connection and retry.',
          [{ text: 'Close' }, { text: 'Retry', onPress: () => { void award(); } }]
        );
      }
    } finally {
      current.saving = false;
    }
  };

  const restartSession = () => {
    if (attempt.current.saving) return;
    attempt.current = { id: newRequestId(), saving: false, done: false, start: null };
    void start()?.catch(() => {});
  };

  return { ...progress, addXP: award, addXp: award, restartSession };
}
