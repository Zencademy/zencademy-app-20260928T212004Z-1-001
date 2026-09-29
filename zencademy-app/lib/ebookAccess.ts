/** Ebook access plan — what users can unlock now vs later, even before content ships. */

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

/**
 * Canonical access plan.
 * - live / buyable: in Supabase catalog, coins unlock
 * - preview: listed, not for sale yet
 * - planned: roadmap only
 */
export const EBOOK_ACCESS_PLAN: EbookAccessItem[] = [
  { id: '1', title: 'Mindful Living Guide', category: 'Wellness', price: 20, status: 'live', note: 'Readable after purchase' },
  { id: '2', title: 'Stress Management', category: 'Wellness', price: 20, status: 'live', note: 'Readable after purchase' },
  { id: '3', title: 'Advanced Meditation Techniques', category: 'Wellness', price: 21, status: 'live', note: 'Readable after purchase' },
  { id: '4', title: 'Mind-Body Connection', category: 'Wellness', price: 20, status: 'live', note: 'Readable after purchase' },
  { id: '5', title: 'Holistic Health & Wellness', category: 'Wellness', price: 21, status: 'live', note: 'Readable after purchase' },
  { id: '6', title: 'Physical Training Fundamentals', category: 'Fitness', price: 24, status: 'preview', note: 'Route ready · catalog soon' },
  { id: '7', title: 'Focus Under Pressure', category: 'Mental', price: 22, status: 'planned', note: 'Q2 unlock path' },
  { id: '8', title: 'Memory Systems', category: 'Mental', price: 22, status: 'planned', note: 'Q2 unlock path' },
  { id: '9', title: 'Executive Edge', category: 'Productivity', price: 28, status: 'planned', note: 'Elite library track' },
  { id: '10', title: 'Critical Thinking Field Guide', category: 'Mental', price: 26, status: 'planned', note: 'Pairs with fallacy drills' },
];

export const BUYABLE_EBOOK_IDS = new Set(
  EBOOK_ACCESS_PLAN.filter(e => e.status === 'live' || e.status === 'buyable').map(e => e.id)
);

export function ebookPlanPrice(id: string): number | null {
  return EBOOK_ACCESS_PLAN.find(e => e.id === id)?.price ?? null;
}

export function accessLabel(status: EbookAccessStatus, owned: boolean): string {
  if (owned) return 'Owned';
  if (status === 'live' || status === 'buyable') return 'Coins';
  if (status === 'preview') return 'Soon';
  return 'Planned';
}
