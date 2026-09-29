import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../components/ThemeContext";
import { AppHeader } from "../../components/ui/AppHeader";
import { AccentPulse, FadeRise } from "../../components/ui/motion";
import { type } from "../../components/ui/type";
import { practiceService } from "../../lib/supabase/services";

type Step = { label: string; duration: number; action: "up" | "down" | "hold" };

const MODES: { name: string; desc: string; steps: Step[] }[] = [
  {
    name: "Box",
    desc: "4 · 4 · 4 · 4 — settle under pressure",
    steps: [
      { label: "Inhale", duration: 4000, action: "up" },
      { label: "Hold", duration: 4000, action: "hold" },
      { label: "Exhale", duration: 4000, action: "down" },
      { label: "Hold", duration: 4000, action: "hold" },
    ],
  },
  {
    name: "4-7-8",
    desc: "Longer exhale — downshift the system",
    steps: [
      { label: "Inhale", duration: 4000, action: "up" },
      { label: "Hold", duration: 7000, action: "hold" },
      { label: "Exhale", duration: 8000, action: "down" },
    ],
  },
  {
    name: "Balance",
    desc: "5 · 5 — even rhythm",
    steps: [
      { label: "Inhale", duration: 5000, action: "up" },
      { label: "Exhale", duration: 5000, action: "down" },
    ],
  },
  {
    name: "Resonance",
    desc: "6 · 6 — slow coherence",
    steps: [
      { label: "Inhale", duration: 6000, action: "up" },
      { label: "Exhale", duration: 6000, action: "down" },
    ],
  },
];

async function ensureSessionPermissions() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let final = existing;
    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      final = status;
    }
    if (final !== "granted") {
      Alert.alert(
        "Notifications",
        "Allow notifications so the session end alert can fire. Breathwork still runs without them."
      );
    }
    return final === "granted";
  } catch {
    return false;
  }
}

function labelMs(ms: number) {
  const s = Math.ceil(ms / 1000);
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export default function MeditateScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [modeIndex, setModeIndex] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [durationMs, setDurationMs] = useState(3 * 60 * 1000);
  const [remaining, setRemaining] = useState(3 * 60 * 1000);
  const [showHelp, setShowHelp] = useState(false);
  const bubble = useRef(new Animated.Value(1)).current;
  const prevScale = useRef(1);
  const notifId = useRef<string | null>(null);
  const loggedComplete = useRef(false);
  const mode = MODES[modeIndex];
  const step = mode.steps[stepIdx];

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1000) {
          setPlaying(false);
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          void deactivateKeepAwake("meditate-session");
          return 0;
        }
        return r - 1000;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing]);

  // Persist completed breathwork once when the timer hits zero.
  useEffect(() => {
    if (remaining !== 0 || playing || loggedComplete.current) return;
    if (durationMs <= 0) return;
    loggedComplete.current = true;
    void practiceService
      .log("meditate", Math.round(durationMs / 1000), "", {
        mode: mode.name,
        minutes: Math.round(durationMs / 60000),
      })
      .catch(() => {});
  }, [remaining, playing, durationMs, mode.name]);

  useEffect(() => {
    if (!playing) {
      bubble.stopAnimation();
      return;
    }
    let alive = true;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    const current = mode.steps[stepIdx];

    if (current.action === "up") {
      Animated.timing(bubble, {
        toValue: 1.22,
        duration: current.duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && alive) {
          prevScale.current = 1.22;
          void Haptics.selectionAsync();
          setStepIdx((i) => (i + 1) % mode.steps.length);
        }
      });
    } else if (current.action === "down") {
      Animated.timing(bubble, {
        toValue: 0.78,
        duration: current.duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && alive) {
          prevScale.current = 0.78;
          void Haptics.selectionAsync();
          setStepIdx((i) => (i + 1) % mode.steps.length);
        }
      });
    } else {
      bubble.setValue(prevScale.current);
      holdTimer = setTimeout(() => {
        if (alive) setStepIdx((i) => (i + 1) % mode.steps.length);
      }, current.duration);
    }

    return () => {
      alive = false;
      if (holdTimer) clearTimeout(holdTimer);
      bubble.stopAnimation();
    };
  }, [playing, stepIdx, modeIndex]);

  useEffect(() => () => {
    void deactivateKeepAwake("meditate-session");
  }, []);

  const selectTime = (mins: number) => {
    if (playing) return;
    const ms = mins * 60 * 1000;
    setDurationMs(ms);
    setRemaining(ms);
    setStepIdx(0);
    bubble.setValue(1);
    prevScale.current = 1;
    loggedComplete.current = false;
  };

  const selectMode = (idx: number) => {
    if (playing) return;
    setModeIndex(idx);
    setStepIdx(0);
    setRemaining(durationMs);
    bubble.setValue(1);
    prevScale.current = 1;
  };

  const toggle = async () => {
    if (playing) {
      setPlaying(false);
      void deactivateKeepAwake("meditate-session");
      if (notifId.current) {
        try { await Notifications.cancelScheduledNotificationAsync(notifId.current); } catch { /* */ }
        notifId.current = null;
      }
      return;
    }

    await ensureSessionPermissions();
    await activateKeepAwakeAsync("meditate-session");
    let nextRemaining = remaining;
    if (remaining === 0) {
      nextRemaining = durationMs;
      setRemaining(durationMs);
      setStepIdx(0);
      bubble.setValue(1);
      prevScale.current = 1;
      loggedComplete.current = false;
    }
    try {
      if (notifId.current) await Notifications.cancelScheduledNotificationAsync(notifId.current);
      notifId.current = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Session complete",
          body: "Breathwork finished. Take one quiet breath before you move.",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.max(Math.ceil(nextRemaining / 1000), 1),
          repeats: false,
        },
      });
    } catch {
      // Expo Go limits are fine — local timer still works.
    }
    setPlaying(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AppHeader
        title="MEDITATE"
        onBack={() => router.back()}
        onRight={() => setShowHelp(true)}
        rightIcon="help-circle-outline"
        showWallet={false}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FadeRise>
          <Text style={[type.title, { color: theme.text, textAlign: "center" }]}>Breathwork</Text>
          <Text style={[type.subtitle, { color: theme.textSecondary, textAlign: "center", marginTop: 4 }]}>
            Slow the system. Hold the edge.
          </Text>
          <AccentPulse color={theme.primary} />
        </FadeRise>

        <FadeRise delay={70}>
          <View style={styles.rowWrap}>
            {MODES.map((m, idx) => {
              const on = modeIndex === idx;
              return (
                <TouchableOpacity
                  key={m.name}
                  disabled={playing}
                  onPress={() => selectMode(idx)}
                  style={[
                    styles.chip,
                    { borderColor: theme.border, backgroundColor: theme.card },
                    on && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                >
                  <Text style={[type.label, { color: on ? theme.buttonText : theme.text }]}>{m.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[type.body, { color: theme.textSecondary, textAlign: "center", marginTop: 10 }]}>
            {mode.desc}
          </Text>
        </FadeRise>

        <FadeRise delay={110}>
          <View style={[styles.rowWrap, { marginTop: 18 }]}>
            {[1, 3, 5, 10].map((m) => {
              const on = durationMs === m * 60 * 1000;
              return (
                <TouchableOpacity
                  key={m}
                  disabled={playing}
                  onPress={() => selectTime(m)}
                  style={[
                    styles.chip,
                    { borderColor: theme.border, backgroundColor: theme.card },
                    on && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                >
                  <Text style={[type.label, { color: on ? theme.buttonText : theme.text }]}>{m} min</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </FadeRise>

        <FadeRise delay={150}>
          <Text style={[styles.clock, { color: theme.text }]}>{labelMs(remaining)}</Text>
          <View style={styles.breathWrap}>
            <Animated.View
              style={[
                styles.breath,
                {
                  borderColor: theme.primary,
                  backgroundColor: theme.card,
                  transform: [{ scale: bubble }],
                },
              ]}
            >
              <Text style={[type.card, { color: theme.text }]}>{step.label}</Text>
            </Animated.View>
          </View>
        </FadeRise>

        <TouchableOpacity onPress={() => { void toggle(); }} style={[styles.play, { backgroundColor: theme.primary }]}>
          <Ionicons name={playing ? "pause" : "play"} size={28} color={theme.buttonText} />
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showHelp} transparent animationType="fade" onRequestClose={() => setShowHelp(false)}>
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setShowHelp(false)}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[type.card, { color: theme.text, marginBottom: 10 }]}>How to use</Text>
            <Text style={[type.body, { color: theme.textSecondary, marginBottom: 8 }]}>
              Pick a pattern and a duration. Start — the circle guides inhale, hold, and exhale.
            </Text>
            <Text style={[type.body, { color: theme.textSecondary, marginBottom: 8 }]}>
              The app asks for notification permission so you get an alert when time is up, and keeps the screen awake during the session.
            </Text>
            <Text style={[type.body, { color: theme.textSecondary }]}>
              Sit upright. Soften the jaw. Follow the mark — do not force the breath.
            </Text>
            <TouchableOpacity onPress={() => setShowHelp(false)} style={[styles.modalBtn, { backgroundColor: theme.primary, marginTop: 16 }]}>
              <Text style={[type.button, { color: theme.buttonText }]}>Got it</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 48, paddingTop: 8, alignItems: "stretch" },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 16 },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9 },
  clock: { fontSize: 40, fontWeight: "800", letterSpacing: 2, textAlign: "center", marginTop: 22, fontVariant: ["tabular-nums"] },
  breathWrap: { alignItems: "center", marginTop: 20, marginBottom: 28 },
  breath: {
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  play: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: { borderRadius: 16, borderWidth: 1, padding: 20, width: "100%", maxWidth: 360 },
  modalBtn: { borderRadius: 12, paddingVertical: 12, alignItems: "center" },
});
