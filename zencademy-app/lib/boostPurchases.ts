import type { KeyValueStorage } from './storedState';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isPurchaseRequestId(value: string | null | undefined): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

export function createBoostPurchases(
  storage: KeyValueStorage & { removeItem: (key: string) => Promise<void> },
  purchase: (requestId: string, boostId: string) => Promise<void>,
  makeId: () => string,
) {
  const pending = new Map<string, Promise<void>>();
  return (userId: string, boostId: string) => {
    const key = `@boost_purchase:${userId}:${boostId}`;
    const existing = pending.get(key);
    if (existing) return existing;
    const task = (async () => {
      const stored = await storage.getItem(key);
      // Drop stale/non-uuid ids left by older clients — Postgres rejects them.
      const requestId = isPurchaseRequestId(stored) ? stored : makeId();
      if (!isPurchaseRequestId(requestId)) {
        throw new Error('Could not start purchase — invalid purchase id');
      }
      await storage.setItem(key, requestId);
      await purchase(requestId, boostId);
      await storage.removeItem(key);
    })().finally(() => {
      pending.delete(key);
    });
    pending.set(key, task);
    return task;
  };
}
