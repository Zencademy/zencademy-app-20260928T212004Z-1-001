import uuid from 'react-native-uuid';

type UuidModule = {
  v4?: () => string;
  default?: { v4?: () => string };
};

/** Stable UUID for idempotent RPCs (claim / purchase_boost). */
export function newRequestId(): string {
  const mod = uuid as unknown as UuidModule;
  const gen = typeof mod.v4 === 'function' ? mod.v4 : mod.default?.v4;
  if (typeof gen === 'function') return String(gen());
  // Last-resort RFC4122 v4 (non-crypto) if the module shape is unexpected.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, ch => {
    const n = (Math.random() * 16) | 0;
    const v = ch === 'x' ? n : (n & 0x3) | 0x8;
    return v.toString(16);
  });
}
