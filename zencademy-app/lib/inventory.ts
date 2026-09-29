import AsyncStorage from '@react-native-async-storage/async-storage';
import { shopItemById } from '../constants/shop';

const EQUIP_KEY = '@equipped_avatar';
const BOOST_KEY = '@active_boosts';

export type ActiveBoost = { id: string; expiresAt: number };

export async function getEquippedAvatar(): Promise<string | null> {
  try {
    return (await AsyncStorage.getItem(EQUIP_KEY)) || null;
  } catch {
    return null;
  }
}

export async function setEquippedAvatar(id: string | null) {
  if (!id) await AsyncStorage.removeItem(EQUIP_KEY);
  else await AsyncStorage.setItem(EQUIP_KEY, id);
}

export async function getActiveBoosts(): Promise<ActiveBoost[]> {
  try {
    const raw = await AsyncStorage.getItem(BOOST_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as ActiveBoost[];
    const now = Date.now();
    return list.filter(b => b.expiresAt > now);
  } catch {
    return [];
  }
}

export async function activateBoost(id: string) {
  const item = shopItemById(id);
  const hours = item?.boostHours ?? 1;
  const list = await getActiveBoosts();
  const next = list.filter(b => b.id !== id);
  next.push({ id, expiresAt: Date.now() + hours * 3600 * 1000 });
  await AsyncStorage.setItem(BOOST_KEY, JSON.stringify(next));
  return next;
}

export function avatarGlyph(id: string | null | undefined, fallbackLetter: string) {
  if (!id) return fallbackLetter;
  const item = shopItemById(id);
  return item?.glyph || fallbackLetter;
}

export function avatarTone(id: string | null | undefined) {
  if (!id) return null;
  const item = shopItemById(id);
  if (!item?.tone) return null;
  return { tone: item.tone, ink: item.ink || '#F5F5F0' };
}
