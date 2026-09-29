import React, { useRef } from 'react';
import { View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

/** Lightweight win effect — fewer particles to keep low-end phones stable. */
export function LightConfetti({ active }: { active: boolean }) {
  const fired = useRef(false);
  if (!active) {
    fired.current = false;
    return null;
  }
  if (fired.current) return null;
  fired.current = true;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 50 }}>
      <ConfettiCannon count={36} origin={{ x: 180, y: 0 }} fadeOut autoStart explosionSpeed={380} fallSpeed={2400} />
    </View>
  );
}
