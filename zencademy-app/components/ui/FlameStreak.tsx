import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';

/**
 * Streak flame — Ionicons flicker is always visible (Expo Go-safe).
 * Lottie Noto fire sits on top when it loads; many Go builds skip its track mattes.
 */
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
  const [lottieOk, setLottieOk] = useState(true);
  const box = Math.round(size * 1.7);

  useEffect(() => {
    if (!active) {
      flicker.stopAnimation();
      flicker.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, {
          toValue: 1,
          duration: 280,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(flicker, {
          toValue: 0.25,
          duration: 160,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(flicker, {
          toValue: 0.9,
          duration: 220,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(flicker, {
          toValue: 0,
          duration: 260,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active, flicker]);

  return (
    <View
      style={{
        width: box,
        height: box,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -2,
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          opacity: active
            ? flicker.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] })
            : 0.4,
          transform: [
            {
              scale: active
                ? flicker.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.12] })
                : 1,
            },
            {
              translateY: active
                ? flicker.interpolate({ inputRange: [0, 1], outputRange: [0.8, -1.2] })
                : 0,
            },
          ],
        }}
      >
        <Ionicons name="flame" size={size} color={color} />
      </Animated.View>

      {lottieOk ? (
        <LottieView
          source={require('../../assets/lottie/fire.json')}
          autoPlay={active}
          loop={active}
          resizeMode="contain"
          renderMode="SOFTWARE"
          onAnimationFailure={() => setLottieOk(false)}
          style={{
            width: box,
            height: box,
            // Softly blend over icon when Lottie actually paints
            opacity: active ? 0.95 : 0.35,
          }}
        />
      ) : null}
    </View>
  );
}
