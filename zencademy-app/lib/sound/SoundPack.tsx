import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'zencademy.soundsEnabled';

export type SfxName = 'tap' | 'correct' | 'wrong' | 'reward' | 'unlock' | 'streak';

const SOURCES: Record<SfxName, number> = {
  tap: require('../../assets/sounds/tap.wav'),
  correct: require('../../assets/sounds/correct.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  reward: require('../../assets/sounds/reward.wav'),
  unlock: require('../../assets/sounds/unlock.wav'),
  streak: require('../../assets/sounds/streak.wav'),
};

type SoundContextValue = {
  enabled: boolean;
  ready: boolean;
  setEnabled: (value: boolean) => void;
  play: (name: SfxName) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

const players: Partial<Record<SfxName, AudioPlayer>> = {};
let modeReady = false;
let muted = false;

async function ensureAudioMode() {
  if (modeReady) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
      allowsRecording: false,
      shouldRouteThroughEarpiece: false,
    });
    modeReady = true;
  } catch {
    modeReady = true;
  }
}

function getPlayer(name: SfxName): AudioPlayer | null {
  if (players[name]) return players[name]!;
  try {
    const player = createAudioPlayer(SOURCES[name], { keepAudioSessionActive: false });
    player.volume = name === 'tap' ? 0.55 : 0.85;
    players[name] = player;
    return player;
  } catch {
    return null;
  }
}

/** Imperative play — safe from XP / reward modules (no React hook needed). */
export function playSfx(name: SfxName) {
  if (muted) return;
  void (async () => {
    try {
      await ensureAudioMode();
      const player = getPlayer(name);
      if (!player) return;
      await player.seekTo(0);
      player.play();
    } catch {
      // Ignore playback failures.
    }
  })();
}

export function setSfxMuted(value: boolean) {
  muted = value;
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const on = raw == null ? true : raw === '1';
        if (!alive) return;
        muted = !on;
        setEnabledState(on);
        await ensureAudioMode();
        getPlayer('reward');
        getPlayer('correct');
        getPlayer('unlock');
      } catch {
        // keep defaults
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    muted = !value;
    void AsyncStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    if (value) playSfx('tap');
  }, []);

  const play = useCallback((name: SfxName) => {
    playSfx(name);
  }, []);

  const value = useMemo(
    () => ({ enabled, ready, setEnabled, play }),
    [enabled, ready, setEnabled, play]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    return {
      enabled: !muted,
      ready: true,
      setEnabled: (value: boolean) => {
        muted = !value;
      },
      play: playSfx,
    };
  }
  return ctx;
}
