import { useCallback, useRef, useState } from 'react';
import { useXP } from '../components/XPContext';
import { coinsForXp, type Difficulty, sessionXp } from '../lib/progression';

/** Awards XP+coins once per win so Strict Mode or re-renders cannot double-pay. */
export function useGameReward() {
  const { addXp, plan } = useXP();
  const awarded = useRef(false);
  const [last, setLast] = useState<{ xp: number; coins: number } | null>(null);

  const reset = useCallback(() => {
    awarded.current = false;
    setLast(null);
  }, []);

  const award = useCallback(
    async (xp: number) => {
      if (awarded.current || xp <= 0) return null;
      awarded.current = true;
      const coins = coinsForXp(xp);
      setLast({ xp, coins });
      try {
        await addXp(xp);
      } catch {
        awarded.current = false;
        setLast(null);
        throw new Error('Reward could not be saved. Try again.');
      }
      return { xp, coins };
    },
    [addXp]
  );

  /** Canonical win payout for Easy / Medium / Hard (+ plan bonus). */
  const awardFor = useCallback(
    async (difficulty: Difficulty) => award(sessionXp(difficulty, plan)),
    [award, plan]
  );

  return { award, awardFor, reset, last, plan };
}

export function isAdminUser(user: { email?: string | null; app_metadata?: Record<string, unknown> } | null | undefined) {
  if (!user) return false;
  if (user.app_metadata?.role === 'admin') return true;
  const email = (user.email || '').toLowerCase();
  return email === 'admin@zencademy.app';
}
