export type KeyValueStorage = { getItem: (key: string) => Promise<string | null>; setItem: (key: string, value: string) => Promise<void> };

/** A store belongs to exactly one key. Async work can never switch its account/day. */
export function createStoredState<T>(storage: KeyValueStorage, key: string, parse: (raw: string | null) => T, initial: T) {
  let snapshot = { value: initial, loaded: false, error: null as string | null };
  let loading: Promise<void> | null = null;
  let writes = Promise.resolve();
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach(listener => listener());
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    load() {
      if (!loading) loading = storage.getItem(key).then(raw => {
        snapshot = { value: parse(raw), loaded: true, error: null }; emit();
      }).catch(() => {
        snapshot = { ...snapshot, error: 'Saved data could not be loaded. Please retry.' }; emit(); loading = null;
      });
      return loading;
    },
    update(action: T | ((previous: T) => T)) {
      if (!snapshot.loaded) return;
      const value = typeof action === 'function' ? (action as (previous: T) => T)(snapshot.value) : action;
      snapshot = { value, loaded: true, error: null }; emit();
      writes = writes.then(() => storage.setItem(key, JSON.stringify(value))).catch(() => {
        snapshot = { ...snapshot, error: 'Changes could not be saved on this device.' }; emit();
      });
    },
    flushed: () => writes,
  };
}
