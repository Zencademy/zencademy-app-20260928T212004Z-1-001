import * as Haptics from "expo-haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../components/AuthContext";
import { useTheme } from "../../components/ThemeContext";
import { AppHeader } from "../../components/ui/AppHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { AccentPulse, FadeRise } from "../../components/ui/motion";
import { type } from "../../components/ui/type";
import { practiceService, type PracticeLog } from "../../lib/supabase/services";

const PRESETS = [15, 25, 50];

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
        "Allow notifications so we can ping you when the focus block ends. You can still run the timer without them."
      );
    }
    return final === "granted";
  } catch {
    return false;
  }
}

export default function FocusScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [minutes, setMinutes] = useState(25);
  const [timer, setTimer] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState<"setup" | "run" | "done">("setup");
  const [task, setTask] = useState("");
  const [checklist, setChecklist] = useState([false, false, false]);
  const [note, setNote] = useState("");
  const [history, setHistory] = useState<PracticeLog[]>([]);
  const [saving, setSaving] = useState(false);
  const notifId = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    void practiceService.list(user.id, "focus", 12).then(setHistory).catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    if (!running || timer <= 0) {
      if (timer === 0 && step === "run") {
        setRunning(false);
        setStep("done");
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        void deactivateKeepAwake("focus-session");
      }
      return;
    }
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, timer, step]);

  useEffect(() => () => {
    void deactivateKeepAwake("focus-session");
  }, []);

  const format = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const progress = minutes > 0 ? 1 - timer / (minutes * 60) : 0;

  const start = async () => {
    const ok = checklist.every(Boolean) && task.trim().length > 1;
    if (!ok) return;
    await ensureSessionPermissions();
    await activateKeepAwakeAsync("focus-session");
    try {
      if (notifId.current) await Notifications.cancelScheduledNotificationAsync(notifId.current);
      notifId.current = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Focus complete",
          body: task.trim() || "Your block is done. Review and lock the result.",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.max(minutes * 60, 1),
          repeats: false,
        },
      });
    } catch {
      // Expo Go may limit scheduling — timer still runs locally.
    }
    setTimer(minutes * 60);
    setStep("run");
    setRunning(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const pauseToggle = () => {
    setRunning((r) => !r);
    void Haptics.selectionAsync();
  };

  const reset = async () => {
    setRunning(false);
    setStep("setup");
    setTimer(minutes * 60);
    setChecklist([false, false, false]);
    setNote("");
    void deactivateKeepAwake("focus-session");
    if (notifId.current) {
      try { await Notifications.cancelScheduledNotificationAsync(notifId.current); } catch { /* */ }
      notifId.current = null;
    }
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await practiceService.log("focus", minutes * 60, note.trim(), {
        task: task.trim(),
        minutes,
      });
      if (user?.id) {
        const rows = await practiceService.list(user.id, "focus", 12);
        setHistory(rows);
      }
      await reset();
    } catch (error) {
      Alert.alert(
        "Could not save",
        error instanceof Error ? error.message : "Check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const ready = task.trim().length > 1 && checklist.every(Boolean);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AppHeader title="FOCUS" onBack={() => router.back()} showWallet={false} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FadeRise>
          <Text style={[type.title, { color: theme.text, textAlign: "center" }]}>Deep work</Text>
          <Text style={[type.subtitle, { color: theme.textSecondary, textAlign: "center", marginTop: 4 }]}>
            One task. One block. No theater.
          </Text>
          <AccentPulse color={theme.primary} />
        </FadeRise>

        <FadeRise delay={60}>
          <View style={styles.presets}>
            {PRESETS.map((m) => {
              const on = minutes === m && step === "setup";
              return (
                <TouchableOpacity
                  key={m}
                  disabled={step !== "setup"}
                  onPress={() => { setMinutes(m); setTimer(m * 60); }}
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

        <FadeRise delay={100}>
          <View style={styles.timerBlock}>
            <View style={[styles.ringTrack, { borderColor: theme.border }]}>
              <View
                style={[
                  styles.ringFill,
                  {
                    borderColor: theme.primary,
                    opacity: 0.15 + progress * 0.85,
                    transform: [{ scale: 0.92 + progress * 0.08 }],
                  },
                ]}
              />
              <Text style={[styles.timer, { color: theme.text }]}>{format(timer)}</Text>
            </View>
          </View>
        </FadeRise>

        {step === "setup" && (
          <FadeRise delay={140}>
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[type.card, { color: theme.text, marginBottom: 12 }]}>Set the block</Text>
              <TextInput
                value={task}
                onChangeText={setTask}
                placeholder="What will you finish?"
                placeholderTextColor={theme.textTertiary}
                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              />
              {[
                "Phone on silent",
                "Notifications handled",
                "Workspace clear",
              ].map((label, i) => (
                <View key={label} style={styles.checkRow}>
                  <Switch
                    value={checklist[i]}
                    onValueChange={(v) => {
                      const next = [...checklist];
                      next[i] = v;
                      setChecklist(next);
                    }}
                    trackColor={{ true: theme.primary, false: theme.surface }}
                    thumbColor={checklist[i] ? theme.buttonText : theme.textSecondary}
                  />
                  <Text style={[type.body, { color: theme.text, marginLeft: 10 }]}>{label}</Text>
                </View>
              ))}
              <TouchableOpacity
                disabled={!ready}
                onPress={() => { void start(); }}
                style={[styles.cta, { backgroundColor: ready ? theme.primary : theme.surface }]}
              >
                <Text style={[type.button, { color: ready ? theme.buttonText : theme.textTertiary }]}>
                  Start session
                </Text>
              </TouchableOpacity>
            </View>
          </FadeRise>
        )}

        {step === "run" && (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[type.label, { color: theme.textTertiary }]}>NOW</Text>
            <Text style={[type.card, { color: theme.text, marginTop: 6, marginBottom: 16 }]}>{task}</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={pauseToggle}
                style={[styles.secondaryBtn, { borderColor: theme.border, flex: 1 }]}
              >
                <Text style={[type.button, { color: theme.text }]}>{running ? "Pause" : "Resume"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { void reset(); }}
                style={[styles.secondaryBtn, { borderColor: theme.border, flex: 1 }]}
              >
                <Text style={[type.button, { color: theme.textSecondary }]}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === "done" && (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[type.card, { color: theme.text, textAlign: "center" }]}>Block complete</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Result in one line"
              placeholderTextColor={theme.textTertiary}
              style={[styles.input, { color: theme.text, borderColor: theme.border, marginTop: 14 }]}
            />
            <TouchableOpacity
              onPress={() => { void save(); }}
              disabled={saving}
              style={[styles.cta, { backgroundColor: theme.primary, marginTop: 8, opacity: saving ? 0.6 : 1 }]}
            >
              <Text style={[type.button, { color: theme.buttonText }]}>
                {saving ? "Saving…" : "Save & reset"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ marginTop: 8 }}>
          <Text style={[type.card, { color: theme.text, marginBottom: 10 }]}>Recent</Text>
          {history.length === 0 ? (
            <EmptyState
              icon="timer-outline"
              title="No sessions yet"
              body="Finish one focus block and it will appear here — synced to your account."
            />
          ) : (
            history.map((h) => {
              const meta = h.meta || {};
              const taskLabel = typeof meta.task === "string" ? meta.task : "Focus block";
              const mins = Math.round(h.duration_seconds / 60);
              const date = h.created_at.slice(0, 10);
              return (
                <View key={h.id} style={[styles.hist, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                  <Text style={[type.body, { color: theme.text, fontWeight: "700" }]}>{taskLabel}</Text>
                  <Text style={[type.label, { color: theme.textTertiary, marginTop: 4 }]}>
                    {date} · {mins} min{h.note ? ` · ${h.note}` : ""}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 48, paddingTop: 8 },
  presets: { flexDirection: "row", justifyContent: "center", gap: 10, marginTop: 18, marginBottom: 8 },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 9 },
  timerBlock: { alignItems: "center", marginVertical: 18 },
  ringTrack: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ringFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 100,
    borderWidth: 3,
    margin: 10,
  },
  timer: { fontSize: 48, fontWeight: "800", letterSpacing: 2, fontVariant: ["tabular-nums"] },
  card: { borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 18 },
  input: { borderBottomWidth: 1, paddingVertical: 12, fontSize: 16, marginBottom: 14 },
  checkRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  cta: { borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  secondaryBtn: { borderRadius: 12, borderWidth: 1, paddingVertical: 12, alignItems: "center" },
  hist: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
});
