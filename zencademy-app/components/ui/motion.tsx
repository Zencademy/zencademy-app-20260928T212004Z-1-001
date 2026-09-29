import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';

export { FlameStreak } from './FlameStreak';

/** Counts from 0 (or previous) up to `value`. `replayKey` restarts from 0 on each change. */
export function CountUp({
  value,
  duration = 700,
  style,
  prefix = '',
  suffix = '',
  formatter,
  fromZero = false,
  replayKey = 0,
}: {
  value: number;
  duration?: number;
  style?: StyleProp<TextStyle>;
  prefix?: string;
  suffix?: string;
  formatter?: (n: number) => string;
  fromZero?: boolean;
  replayKey?: number | string;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromZero ? 0 : fromRef.current;
    anim.stopAnimation();
    anim.setValue(0);
    setDisplay(from);
    const id = anim.addListener(({ value: t }) => {
      setDisplay(Math.round(from + (value - from) * t));
    });
    Animated.timing(anim, {
      toValue: 1,
      duration: Math.max(280, duration),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      fromRef.current = value;
      setDisplay(value);
    });
    return () => anim.removeListener(id);
  }, [value, duration, fromZero, replayKey, anim]);

  const label = formatter ? formatter(display) : display.toLocaleString();
  return (
    <Text style={style}>
      {prefix}{label}{suffix}
    </Text>
  );
}

/** Classic coin — double rim + currency mark, occasional flip. */
export function SpinCoin({ size = 14, color }: { size?: number; color: string }) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let alive = true;
    const run = () => {
      if (!alive) return;
      spin.setValue(0);
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setTimeout(run, 4200 + Math.random() * 2800);
      });
    };
    const t = setTimeout(run, 800);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);
  const rim = Math.max(1.2, size * 0.1);
  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{
          scaleX: spin.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.08, 1] }),
        }],
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: rim,
          borderColor: '#FFF6D6',
        }}
      >
        <View
          style={{
            position: 'absolute',
            width: size - rim * 3.2,
            height: size - rim * 3.2,
            borderRadius: size / 2,
            borderWidth: Math.max(1, rim * 0.7),
            borderColor: 'rgba(255,255,255,0.45)',
          }}
        />
        <Text
          style={{
            fontSize: size * 0.52,
            fontWeight: '800',
            color: '#1A1208',
            includeFontPadding: false,
            textAlignVertical: 'center',
            lineHeight: size * 0.58,
          }}
        >
          $
        </Text>
      </View>
    </Animated.View>
  );
}

/** Lightning bolt with occasional crack flash — fixed box so it stays aligned with text. */
export function ThunderBolt({ size = 14, color }: { size?: number; color: string }) {
  const flash = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let alive = true;
    const crack = () => {
      if (!alive) return;
      Animated.sequence([
        Animated.timing(flash, { toValue: 1, duration: 70, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0.2, duration: 60, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(crack, 3500 + Math.random() * 3000);
      });
    };
    const t = setTimeout(crack, 600);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          opacity: flash.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }),
          transform: [
            { scale: flash.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) },
          ],
        }}
      >
        <Ionicons name="flash" size={size} color={color} />
      </Animated.View>
    </View>
  );
}

/** Fills from 0 to progress (0–1) with a sliding highlight. */
export function AnimatedXpBar({
  progress,
  height = 10,
  trackColor,
  fillColor,
  style,
}: {
  progress: number;
  height?: number;
  trackColor: string;
  fillColor: string;
  style?: StyleProp<ViewStyle>;
}) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const shine = useRef(new Animated.Value(0)).current;
  const clamped = Math.max(0, Math.min(1, progress));

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: clamped,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clamped]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shine, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(shine, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(900),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={[{ height, borderRadius: height / 2, overflow: 'hidden', backgroundColor: trackColor }, style]}>
      <Animated.View
        style={{
          height: '100%',
          borderRadius: height / 2,
          backgroundColor: fillColor,
          width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 36,
            backgroundColor: 'rgba(255,255,255,0.35)',
            transform: [{
              translateX: shine.interpolate({ inputRange: [0, 1], outputRange: [-40, 220] }),
            }],
            opacity: shine.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 0.9, 0.9, 0] }),
          }}
        />
      </Animated.View>
    </View>
  );
}

/** Soft entrance — fade + slight rise. Pass `replayKey` to replay on revisit. */
export function FadeRise({
  children,
  delay = 0,
  style,
  replayKey = 0,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  replayKey?: number | string;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 520,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [replayKey]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Gentle breathing scale for cards / accents. */
export function Breath({
  children,
  style,
  amount = 1.015,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  amount?: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        { transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, amount] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Thin accent pulse line under brand marks. */
export function AccentPulse({ color }: { color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View
      style={{
        marginTop: 5,
        height: 2,
        width: 36,
        alignSelf: 'center',
        backgroundColor: color,
        borderRadius: 1,
        opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.95] }),
        transform: [{ scaleX: anim.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1.08] }) }],
      }}
    />
  );
}

/** Press-scale wrapper for game cards / buttons. */
export function PressScale({
  children,
  onPress,
  style,
  disabled,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 28, bounciness: 6 }).start();
  };
  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <View
        onStartShouldSetResponder={() => !disabled}
        onResponderGrant={pressIn}
        onResponderRelease={() => {
          pressOut();
          if (!disabled) onPress?.();
        }}
        onResponderTerminate={pressOut}
      >
        {children}
      </View>
    </Animated.View>
  );
}
