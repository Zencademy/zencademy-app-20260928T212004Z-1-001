import AsyncStorage from '@react-native-async-storage/async-storage';
import { shopItemById } from '../constants/shop';
import type { UserBoost } from './supabase/services';

const LEGACY_EQUIP_KEY = '@equipped_avatar';
const LEGACY_BOOST_KEY = '@active_boosts';

export type ActiveBoost = { id: string; expiresAt: number };

function equipKey(userId?: string | null) {
  return userId ? `@equipped_avatar:${userId}` : LEGACY_EQUIP_KEY;
}

function boostKey(userId?: string | null) {
  return userId ? `@active_boosts:${userId}` : LEGACY_BOOST_KEY;
}

function parseBoostList(raw: string | null): ActiveBoost[] {
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as ActiveBoost[];
    if (!Array.isArray(list)) return [];
    const now = Date.now();
    return list.filter(b => b && typeof b.id === 'string' && typeof b.expiresAt === 'number' && b.expiresAt > now);
  } catch {
    return [];
  }
}

export async function getEquippedAvatar(userId?: string | null): Promise<string | null> {
  try {
    if (userId) {
      const scoped = await AsyncStorage.getItem(equipKey(userId));
      if (scoped) return scoped;
      // Do not migrate legacy unscoped avatar across accounts.
      return null;
    }
    return (await AsyncStorage.getItem(LEGACY_EQUIP_KEY)) || null;
  } catch {
    return null;
  }
}

export async function setEquippedAvatar(id: string | null, userId?: string | null) {
  const key = equipKey(userId);
  if (!id) await AsyncStorage.removeItem(key);
  else await AsyncStorage.setItem(key, id);
}

export async function getActiveBoosts(userId?: string | null): Promise<ActiveBoost[]> {
  try {
    if (!userId) return [];
    return parseBoostList(await AsyncStorage.getItem(boostKey(userId)));
  } catch {
    return [];
  }
}

/** Cache server boosts locally for UI; server remains authority for rewards. */
export async function syncBoostsFromServer(userId: string, boosts: UserBoost[]) {
  const next: ActiveBoost[] = boosts
    .map(b => ({ id: b.boost_id, expiresAt: Date.parse(b.expires_at) }))
    .filter(b => Number.isFinite(b.expiresAt) && b.expiresAt > Date.now());
  try {
    await AsyncStorage.setItem(boostKey(userId), JSON.stringify(next));
  } catch {
    /* ignore storage errors */
  }
  return next;
}

/** @deprecated Prefer trainingService.activateBoost — local-only activation is not authoritative. */
export async function activateBoost(id: string, userId?: string | null) {
  if (!userId) throw new Error('Sign in required for boosts');
  const item = shopItemById(id);
  const hours = item?.boostHours ?? 1;
  const list = await getActiveBoosts(userId);
  const next = list.filter(b => b.id !== id);
  next.push({ id, expiresAt: Date.now() + hours * 3600 * 1000 });
  await AsyncStorage.setItem(boostKey(userId), JSON.stringify(next));
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
