import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScreensaver } from "./ScreensaverContext";
import { useTheme } from "./ThemeContext";
import { useXP } from "./XPContext";

const { width: W, height: H } = Dimensions.get("window");

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function FloatingOrb({
  x,
  size,
  delay,
  duration,
  color,
}: {
  x: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}) {
  const y = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(op, { toValue: 1, duration: duration * 0.2, useNativeDriver: true }),
            Animated.timing(op, { toValue: 0.35, duration: duration * 0.5, useNativeDriver: true }),
            Animated.timing(op, { toValue: 0, duration: duration * 0.3, useNativeDriver: true }),
          ]),
        ]),
        Animated.timing(y, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: x,
        bottom: H * 0.12,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: op.interpolate({ inputRange: [0, 1], outputRange: [0, 0.22] }),
        transform: [
          {
            translateY: y.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -H * 0.55],
            }),
          },
        ],
      }}
    />
  );
}

/**
 * Calm ambient lock screen — clock, breathing rings, soft rising orbs.
 */
export default function ScreensaverOverlay() {
  const { active, showTitle, dismiss } = useScreensaver();
  const { theme, themeMode } = useTheme();
  const { streak, level } = useXP();
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const anim = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(16)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const exitHint = useRef(new Animated.Value(0)).current;
  const dismissing = useRef(false);
  const ringLoop = useRef<Animated.CompositeAnimation | null>(null);

  const orbs = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        x: (W * 0.08) + ((i * 37) % (W * 0.84)),
        size: 4 + (i % 4) * 3,
        delay: i * 480,
        duration: 5200 + (i % 3) * 1400,
      })),
    []
  );

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (active) {
      dismissing.current = false;
      setMounted(true);
      setNow(new Date());
      anim.setValue(0);
      titleOpacity.setValue(0);
      titleY.setValue(16);
      exitHint.setValue(0);
      ring.setValue(0);

      Animated.parallel([
        Animated.timing(anim, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 1, duration: 900, delay: 140, useNativeDriver: true }),
        Animated.timing(titleY, { toValue: 0, duration: 900, delay: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(exitHint, { toValue: 1, duration: 700, delay: 600, useNativeDriver: true }),
      ]).start();

      ringLoop.current?.stop();
      ringLoop.current = Animated.loop(
        Animated.timing(ring, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      );
      ringLoop.current.start();
      return;
    }

    if (!mounted) return;
    ringLoop.current?.stop();
    Animated.parallel([
      Animated.timing(anim, { toValue: 0, duration: 340, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(titleOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(exitHint, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [active]);

  const onDismiss = () => {
    if (dismissing.current) return;
    dismissing.current = true;
    dismiss();
  };

  if (!mounted) return null;

  const hours = pad(now.getHours());
  const mins = pad(now.getMinutes());
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const isDark = themeMode === "dark";
  const gradColors = isDark
    ? [theme.background, "#0A0A0A", theme.surface]
    : [theme.background, "#F7F7F5", theme.surface];

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 99999, elevation: 99999 }]} pointerEvents="box-none">
      <Pressable onPress={onDismiss} style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: anim }]}>
          <LinearGradient colors={gradColors as [string, string, ...string[]]} style={StyleSheet.absoluteFill} />

          {orbs.map((o, i) => (
            <FloatingOrb
              key={i}
              x={o.x}
              size={o.size}
              delay={o.delay}
              duration={o.duration}
              color={theme.text}
            />
          ))}

          {/* Breathing rings behind brand */}
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={`ring-${i}`}
              pointerEvents="none"
              style={{
                position: "absolute",
                alignSelf: "center",
                top: "38%",
                marginTop: -90 - i * 28,
                width: 180 + i * 56,
                height: 180 + i * 56,
                borderRadius: 999,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: theme.primary,
                opacity: ring.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.04 + i * 0.02, 0.12 + i * 0.03, 0.04 + i * 0.02],
                }),
                transform: [
                  {
                    scale: ring.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.92 + i * 0.02, 1.06 - i * 0.01],
                    }),
                  },
                ],
              }}
            />
          ))}

          {showTitle ? (
            <SafeAreaView
              pointerEvents="none"
              style={{
                ...StyleSheet.absoluteFillObject,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Animated.View
                style={{
                  opacity: titleOpacity,
                  transform: [{ translateY: titleY }],
                  width: "100%",
                  alignItems: "center",
                  paddingHorizontal: 28,
                }}
              >
                <Text
                  style={{
                    fontSize: 64,
                    fontWeight: "200",
                    letterSpacing: 4,
                    color: theme.text,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {hours}
                  <Text style={{ opacity: 0.35 }}>:</Text>
                  {mins}
                </Text>
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    fontWeight: "600",
                    letterSpacing: 1.5,
                    color: theme.textSecondary,
                    textTransform: "capitalize",
                  }}
                >
                  {dateLabel}
                </Text>

                <View
                  style={{
                    marginTop: 36,
                    height: StyleSheet.hairlineWidth,
                    width: 48,
                    backgroundColor: theme.primary,
                    opacity: 0.8,
                  }}
                />

                <Text
                  style={{
                    marginTop: 18,
                    fontSize: 22,
                    fontWeight: "900",
                    letterSpacing: 6,
                    color: theme.text,
                    textTransform: "uppercase",
                  }}
                >
                  ZENCADEMY
                </Text>
                <Text
                  style={{
                    marginTop: 10,
                    fontSize: 11,
                    fontWeight: "600",
                    letterSpacing: 3.2,
                    color: theme.textTertiary,
                    textTransform: "uppercase",
                  }}
                >
                  Still · Focus · Ascend
                </Text>
                <Text
                  style={{
                    marginTop: 22,
                    fontSize: 12,
                    fontWeight: "600",
                    letterSpacing: 2,
                    color: theme.textSecondary,
                    opacity: 0.85,
                  }}
                >
                  Lv {level}
                  {streak > 0 ? `  ·  ${streak}d streak` : ""}
                </Text>
              </Animated.View>
            </SafeAreaView>
          ) : null}

          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: 52,
              left: 0,
              right: 0,
              alignItems: "center",
              opacity: exitHint,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 2.4,
                color: theme.textTertiary,
                textTransform: "uppercase",
              }}
            >
              Tap to return
            </Text>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </View>
  );
}
