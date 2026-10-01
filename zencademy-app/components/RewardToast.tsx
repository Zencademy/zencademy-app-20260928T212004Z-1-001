import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useTheme } from './ThemeContext';
import { type } from './ui/type';

type ToastPayload = { xp: number; coins: number; streak?: number; label?: string };

type ToastApi = {
  showReward: (payload: ToastPayload) => void;
};

const RewardToastContext = createContext<ToastApi | null>(null);

export function RewardToastProvider({ children }: React.PropsWithChildren) {
  const { theme } = useTheme();
  const [payload, setPayload] = useState<ToastPayload | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(-12)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showReward = useCallback((next: ToastPayload) => {
    if (timer.current) clearTimeout(timer.current);
    setPayload(next);
    opacity.setValue(0);
    slide.setValue(-12);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
    timer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slide, { toValue: -8, duration: 200, useNativeDriver: true }),
      ]).start(() => setPayload(null));
    }, 2200);
  }, [opacity, slide]);

  const api = useMemo(() => ({ showReward }), [showReward]);

  return (
    <RewardToastContext.Provider value={api}>
      {children}
      {payload ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 64,
            alignSelf: 'center',
            opacity,
            transform: [{ translateY: slide }],
            zIndex: 9999,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
            alignItems: 'center',
            gap: 6,
            minWidth: 180,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          {payload.label ? (
            <Text style={[type.label, { color: theme.textTertiary, letterSpacing: 1 }]}>{payload.label}</Text>
          ) : null}
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            {payload.xp > 0 ? (
              <Text style={[type.label, { color: theme.text, fontWeight: '800' }]}>+{payload.xp} XP</Text>
            ) : null}
            {payload.coins > 0 ? (
              <Text style={[type.label, { color: theme.coin, fontWeight: '800' }]}>+{payload.coins} coins</Text>
            ) : null}
            {payload.streak && payload.streak > 0 ? (
              <Text style={[type.label, { color: theme.flame, fontWeight: '800' }]}>{payload.streak}d streak</Text>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </RewardToastContext.Provider>
  );
}

export function useRewardToast() {
  return useContext(RewardToastContext);
}
