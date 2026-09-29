import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import uuid from 'react-native-uuid';
import { useXP } from '../components/XPContext';
import { trainingService } from '../lib/supabase/services';

/** One server-owned reward per attempt. Retrying uses the same idempotency key. */
export function useGameSession(activityId: string) {
  const progress = useXP();
  const attempt = useRef({ id: uuid.v4(), saving: false, done: false, start: null as Promise<void> | null });
  const mounted = useRef(true);
  const start = () => {
    const current = attempt.current;
    if (!current.start) current.start = trainingService.start(current.id, activityId).catch(error => { current.start = null; throw error; });
    return current.start;
  };
  useEffect(() => { mounted.current = true; void start()?.catch(() => {}); return () => { mounted.current = false; }; }, []);
  const award = async (_legacyPoints?: number) => {
    const current = attempt.current;
    if (current.saving || current.done) return;
    current.saving = true;
    try {
      await start(); const result = await trainingService.complete(current.id);
      current.done = true; await progress.refresh();
      if (mounted.current) Alert.alert('Progress saved', `+${result.xp} XP · +${result.coins} coins`);
    } catch (error) {
      if (mounted.current) Alert.alert('Progress not saved', error instanceof Error ? error.message : 'Check your connection and retry.', [{ text: 'Close' }, { text: 'Retry', onPress: () => { void award(); } }]);
    } finally { current.saving = false; }
  };
  const restartSession = () => { if (attempt.current.saving) return; attempt.current = { id: uuid.v4(), saving: false, done: false, start: null }; void start()?.catch(() => {}); };
  return { ...progress, addXP: award, addXp: award, restartSession };
}
