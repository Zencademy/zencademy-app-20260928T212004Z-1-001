import { useCallback, useRef, useState } from 'react';
import { useXP } from '../components/XPContext';
import { coinsForXp } from '../lib/progression';

/** Awards XP+coins once per win so Strict Mode or re-renders cannot double-pay. */
export function useGameReward() {
  const { addXp } = useXP();
  const awarded = useRef(false);
  const [last, setLast] = useState<{ xp: number; coins: number } | null>(null);
  const reset = useCallback(() => { awarded.current = false; setLast(null); }, []);
  const award = useCallback(async (xp: number) => {
    if (awarded.current || xp <= 0) return null;
    awarded.current = true;
    const coins = coinsForXp(xp);
    setLast({ xp, coins });
    await addXp(xp);
    return { xp, coins };
  }, [addXp]);
  return { award, reset, last };
}

export function isAdminUser(user: { email?: string | null; app_metadata?: Record<string, unknown> } | null | undefined) {
  if (!user) return false;
  if (user.app_metadata?.role === 'admin') return true;
  const email = (user.email || '').toLowerCase();
  return email === 'admin@zencademy.app';
}
