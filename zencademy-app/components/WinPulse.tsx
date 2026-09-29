import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

/**
 * Soft win celebration — expanding rings + checkmark.
 * Replaces confetti (calmer, cheaper, brand-aligned).
 */
export function WinPulse({ active, size = 88 }: { active: boolean; size?: number }) {
  const { theme } = useTheme();
  const ringA = useRef(new Animated.Value(0)).current;
  const ringB = useRef(new Animated.Value(0)).current;
  const mark = useRef(new Animated.Value(0)).current;
  const fired = useRef(false);

  useEffect(() => {
    if (!active) {
      fired.current = false;
      ringA.setValue(0);
      ringB.setValue(0);
      mark.setValue(0);
      return;
    }
    if (fired.current) return;
    fired.current = true;
    ringA.setValue(0);
    ringB.setValue(0);
    mark.setValue(0);
    Animated.parallel([
      Animated.timing(mark, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.timing(ringA, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(ringB, {
        toValue: 1,
        duration: 1100,
        delay: 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [active, mark, ringA, ringB]);

  if (!active) return null;

  const ringStyle = (anim: Animated.Value, scaleTo: number) => ({
    position: 'absolute' as const,
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 2,
    borderColor: theme.primary,
    opacity: anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.55, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.55, scaleTo] }) }],
  });

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={ringStyle(ringA, 1.85)} />
        <Animated.View style={ringStyle(ringB, 2.25)} />
        <Animated.View
          style={{
            width: size * 0.62,
            height: size * 0.62,
            borderRadius: size,
            backgroundColor: theme.primary,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: mark.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
            transform: [
              { scale: mark.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
            ],
          }}
        >
          <Ionicons name="checkmark" size={Math.round(size * 0.34)} color={theme.buttonText} />
        </Animated.View>
      </View>
    </View>
  );
}

/** @deprecated alias — prefer WinPulse */
export function LightConfetti({ active }: { active: boolean }) {
  return <WinPulse active={active} />;
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
});
