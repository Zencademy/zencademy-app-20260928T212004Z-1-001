export type ShopCategory = 'badges' | 'avatars' | 'boosts';

export type ShopItem = {
  id: string;
  title: string;
  price: number;
  icon: string;
  desc: string;
  category: ShopCategory;
  /** Mark shown in profile circle */
  glyph?: string;
  /** Neutral fill behind glyph */
  tone?: string;
  /** Ink color for glyph */
  ink?: string;
  /** Hours of effect for boosts (client timer) */
  boostHours?: number;
};

export const SHOP_ITEMS: ShopItem[] = [
  // Badges
  { id: 'badge-focus', title: 'Focus Master', price: 28, icon: 'eye-outline', desc: 'Mark for steady attention.', category: 'badges' },
  { id: 'badge-streak', title: 'Streak Champion', price: 42, icon: 'flame-outline', desc: 'Mark for showing up.', category: 'badges' },
  { id: 'badge-zen', title: 'Zen Spirit', price: 55, icon: 'leaf-outline', desc: 'Mark for calm practice.', category: 'badges' },
  { id: 'badge-legend', title: 'Legend', price: 70, icon: 'medal-outline', desc: 'Mark for a long path.', category: 'badges' },
  { id: 'badge-iron', title: 'Iron Will', price: 48, icon: 'shield-outline', desc: 'Mark for hard sessions.', category: 'badges' },
  { id: 'badge-night', title: 'Night Operator', price: 38, icon: 'moon-outline', desc: 'Mark for late training.', category: 'badges' },

  // Avatars — neutral tones, geometric marks (IDs kept for owned inventory)
  { id: 'avatar-fox', title: 'Apex', price: 35, icon: 'triangle-outline', desc: 'Sharp mark. Charcoal on bone.', category: 'avatars', glyph: '▲', tone: '#2C2C2E', ink: '#F5F5F0' },
  { id: 'avatar-wolf', title: 'Void', price: 40, icon: 'ellipse-outline', desc: 'Full stop. Near-black field.', category: 'avatars', glyph: '●', tone: '#1C1C1E', ink: '#E8E8E3' },
  { id: 'avatar-eagle', title: 'Signal', price: 45, icon: 'diamond-outline', desc: 'Diamond cut. Steel grey.', category: 'avatars', glyph: '◆', tone: '#3A3A3C', ink: '#F2F2ED' },
  { id: 'avatar-lion', title: 'North', price: 55, icon: 'star-outline', desc: 'Star bearing. Ash grey.', category: 'avatars', glyph: '✦', tone: '#48484A', ink: '#FAFAF7' },
  { id: 'avatar-oni', title: 'Grid', price: 60, icon: 'grid-outline', desc: 'Structure mark. Mid stone.', category: 'avatars', glyph: '▦', tone: '#636366', ink: '#F7F7F2' },
  { id: 'avatar-cyber', title: 'Orbit', price: 50, icon: 'radio-button-off-outline', desc: 'Ring mark. Soft graphite.', category: 'avatars', glyph: '◎', tone: '#8E8E93', ink: '#1C1C1E' },

  // Boosts
  { id: 'boost-xp-2h', title: 'XP Pulse 2h', price: 32, icon: 'flash-outline', desc: '+15% XP feel for 2 hours (session boost flag).', category: 'boosts', boostHours: 2 },
  { id: 'boost-focus-1h', title: 'Deep Focus 1h', price: 24, icon: 'timer-outline', desc: 'Focus mode marker for 1 hour.', category: 'boosts', boostHours: 1 },
  { id: 'boost-streak-shield', title: 'Streak Shield', price: 45, icon: 'shield-checkmark-outline', desc: '24h grace marker if you miss a day.', category: 'boosts', boostHours: 24 },
  { id: 'boost-coin-rain', title: 'Coin Rain 1h', price: 36, icon: 'cash-outline', desc: '+10% coins feel for 1 hour.', category: 'boosts', boostHours: 1 },
];

/** Back-compat for older imports */
export const SHOP_BADGES = SHOP_ITEMS.filter(i => i.category === 'badges');

export function shopItemById(id: string) {
  return SHOP_ITEMS.find(i => i.id === id);
}

export function isAvatarItem(id: string) {
  return id.startsWith('avatar-');
}

export function isBoostItem(id: string) {
  return id.startsWith('boost-');
}
