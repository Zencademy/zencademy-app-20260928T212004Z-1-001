import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

/** Subtle flicker flame — Ionicons, matches coin/bolt motion language. */
export function FlameStreak({
  size = 18,
  color = '#F97316',
  active = true,
}: {
  size?: number;
  color?: string;
  active?: boolean;
}) {
  const flicker = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      flicker.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, {
          toValue: 1,
          duration: 320,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(flicker, {
          toValue: 0.35,
          duration: 180,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(flicker, {
          toValue: 0.85,
          duration: 240,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(flicker, {
          toValue: 0,
          duration: 280,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active, flicker]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          opacity: active
            ? flicker.interpolate({ inputRange: [0, 1], outputRange: [0.78, 1] })
            : 0.45,
          transform: [
            {
              scale: active
                ? flicker.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] })
                : 1,
            },
            {
              translateY: active
                ? flicker.interpolate({ inputRange: [0, 1], outputRange: [0.6, -0.8] })
                : 0,
            },
          ],
        }}
      >
        <Ionicons name="flame" size={size} color={color} />
      </Animated.View>
    </View>
  );
}
