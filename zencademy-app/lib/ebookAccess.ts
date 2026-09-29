/** Ebook access plan — unlock with coins for every live library title. */

import { listEbookMeta } from './ebookContent/catalog';

export type EbookAccessStatus = 'live' | 'buyable' | 'preview' | 'planned';

export type EbookAccessItem = {
  id: string;
  title: string;
  category: string;
  price: number | null;
  status: EbookAccessStatus;
  /** Short note for hub / library plan UI */
  note: string;
};

/** Canonical access plan derived from content catalog. */
export const EBOOK_ACCESS_PLAN: EbookAccessItem[] = listEbookMeta().map((e) => ({
  id: e.id,
  title: e.title,
  category: e.category,
  price: e.price,
  status: 'live' as const,
  note: 'Readable after purchase',
}));

export const BUYABLE_EBOOK_IDS = new Set(EBOOK_ACCESS_PLAN.map((e) => e.id));

export function ebookPlanPrice(id: string): number | null {
  return EBOOK_ACCESS_PLAN.find((e) => e.id === id)?.price ?? null;
}

export function accessLabel(status: EbookAccessStatus, owned: boolean): string {
  if (owned) return 'Owned';
  if (status === 'live' || status === 'buyable') return 'Coins';
  if (status === 'preview') return 'Soon';
  return 'Planned';
}
