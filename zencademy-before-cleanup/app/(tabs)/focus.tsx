import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useTheme } from "../../components/ThemeContext";

const QUOTES = [
  "Energy flows where attention goes.",
  "Single-tasking beats multitasking.",
  "Clarity comes from focus.",
  "Shut out the noise. Tune into your work.",
  "Give yourself permission to do one thing at a time.",
  "Deep focus leads to deep satisfaction.",
  "Be here. Now.",
  "Your mind is a muscle. Train your focus.",
];

function getRandomIndex(arr) {
  return Math.floor(Math.random() * arr.length);
}

export default function FocusScreen() {
  const { theme } = useTheme();
  const [timer, setTimer] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("25");
  const [task, setTask] = useState("");
  const [distract, setDistract] = useState("");
  const [reward, setReward] = useState("");
  const [checklist, setChecklist] = useState([false, false, false]);
  const [step, setStep] = useState("before"); // before | running | after
  const [history, setHistory] = useState([]);
  const [journalEnd, setJournalEnd] = useState({ finished: "", feeling: "" });

  // Quotes carousel state
  const [quoteIndex, setQuoteIndex] = useState(getRandomIndex(QUOTES));
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  useEffect(() => {
    if (isRunning && timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(interval);
    }
    if (timer === 0 && isRunning) {
      setIsRunning(false);
      setStep("after");
    }
  }, [isRunning, timer]);

  // Auto-fade quotes
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 320, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
      ]).start();
      setQuoteIndex((q) => (q + 1) % QUOTES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  function format(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function handleStart() {
    setStep("running");
    setIsRunning(true);
  }
  function handlePause() {
    setIsRunning(false);
  }
  function handleReset() {
    setIsRunning(false);
    setTimer(Number(customMinutes) * 60);
    setStep("before");
    setChecklist([false, false, false]);
    setTask("");
    setDistract("");
    setReward("");
    setJournalEnd({ finished: "", feeling: "" });
  }
  function handleFinishSession() {
    setHistory([
      {
        date: new Date().toISOString().split("T")[0],
        duration: customMinutes,
        task,
        finished: journalEnd.finished,
        feeling: journalEnd.feeling,
      },
      ...history,
    ]);
    handleReset();
  }
  function isChecklistReady() {
    return checklist.every((c) => c);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header + Logo + Quote in one safe zone row */}
        <View style={[styles.safeBar, { backgroundColor: theme.background }]}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.surface }]}
            onPress={() => router.back()}
            hitSlop={18}
          >
            <Ionicons name="arrow-back-outline" size={28} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.logoQuoteRow}>
            <View style={[styles.logoCircle, { backgroundColor: theme.primary }]}>
              <Text style={styles.logoZ}>Z</Text>
            </View>
            <Animated.Text style={[styles.quote, { opacity: fadeAnim, color: theme.textSecondary }]}>
              {QUOTES[quoteIndex]}
            </Animated.Text>
          </View>
        </View>

        {/* Main page headline, big and below bar */}
        <View style={{ marginTop: 28, marginBottom: 14, alignItems: "center" }}>
          <Text style={[styles.pageTitle, { color: theme.text }]}>Focus</Text>
        </View>

        {/* Timer Selector */}
        <View style={styles.timerSelectorRow}>
          {[25, 50].map((v) => (
            <TouchableOpacity
              key={v}
              style={[
                styles.timerBtn,
                { backgroundColor: theme.card, borderColor: theme.border },
                Number(customMinutes) === v && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
              onPress={() => { setCustomMinutes(String(v)); setTimer(v * 60); }}
            >
              <Text style={[styles.timerBtnText, { color: theme.text }, Number(customMinutes) === v && { color: theme.buttonText }]}>{v} min</Text>
            </TouchableOpacity>
          ))}
          <View style={[styles.customTimeBox, { borderColor: theme.border }]}>
            <TextInput
              value={customMinutes}
              onChangeText={(txt) => {
                if (/^\d{0,3}$/.test(txt)) {
                  setCustomMinutes(txt);
                  setTimer(Number(txt) * 60);
                }
              }}
              keyboardType="numeric"
              placeholder="Custom"
              style={[styles.customInput, { color: theme.text }]}
              placeholderTextColor={theme.textSecondary}
            />
            <Text style={[styles.customMin, { color: theme.text }]}>min</Text>
          </View>
        </View>

        {/* TIMER */}
        <View style={styles.timerWrap}>
          <Text style={[styles.timerText, { color: theme.text }]}>{format(timer)}</Text>
        </View>

        {/* BEFORE SESSION */}
        {step === "before" && (
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Set Your Focus</Text>
            <TextInput
              value={task}
              onChangeText={setTask}
              placeholder="What will you work on?"
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholderTextColor={theme.textSecondary}
            />
            <TextInput
              value={distract}
              onChangeText={setDistract}
              placeholder="Biggest distraction?"
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholderTextColor={theme.textSecondary}
            />
            <TextInput
              value={reward}
              onChangeText={setReward}
              placeholder="Reward after session?"
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholderTextColor={theme.textSecondary}
            />

            <Text style={[styles.checklistTitle, { color: theme.text }]}>Checklist</Text>
            <View style={styles.checklistItems}>
              <CheckItem
                label="Phone on silent"
                value={checklist[0]}
                onValueChange={(v) => setChecklist([v, checklist[1], checklist[2]])}
                theme={theme}
              />
              <CheckItem
                label="Notifications off"
                value={checklist[1]}
                onValueChange={(v) => setChecklist([checklist[0], v, checklist[2]])}
                theme={theme}
              />
              <CheckItem
                label="Workspace ready"
                value={checklist[2]}
                onValueChange={(v) => setChecklist([checklist[0], checklist[1], v])}
                theme={theme}
              />
            </View>
            <TouchableOpacity
              disabled={task.length < 2 || !isChecklistReady()}
              onPress={handleStart}
              style={[
                styles.mainBtn,
                { backgroundColor: task.length < 2 || !isChecklistReady() ? theme.surface : theme.primary },
              ]}
            >
              <Text style={[styles.mainBtnText, { color: task.length < 2 || !isChecklistReady() ? theme.textSecondary : theme.buttonText }]}>Start Focus Session</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* RUNNING */}
        {step === "running" && (
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.runBtnsRow}>
              <TouchableOpacity style={[styles.pauseBtn, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={handlePause}>
                <Text style={[styles.pauseBtnText, { color: theme.text }]}>{isRunning ? "Pause" : "Resume"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.resetBtn, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={handleReset}>
                <Text style={[styles.resetBtnText, { color: theme.textSecondary }]}>Reset</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Task</Text>
            <Text style={[styles.runTask, { color: theme.text }]}>{task}</Text>
            <Text style={[styles.rewardLine, { color: theme.textSecondary }]}>
              Reward after: <Text style={[styles.rewardText, { color: theme.text }]}>{reward}</Text>
            </Text>
          </View>
        )}

        {/* AFTER SESSION */}
        {step === "after" && (
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.afterTitle, { color: theme.text }]}>Session complete</Text>
            <Text style={[styles.afterLabel, { color: theme.text }]}>Did you finish your main task?</Text>
            <TextInput
              value={journalEnd.finished}
              onChangeText={(val) => setJournalEnd({ ...journalEnd, finished: val })}
              placeholder="yes / partially / no"
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholderTextColor={theme.textSecondary}
            />
            <Text style={[styles.afterLabel, { color: theme.text }]}>How did you feel?</Text>
            <TextInput
              value={journalEnd.feeling}
              onChangeText={(val) => setJournalEnd({ ...journalEnd, feeling: val })}
              placeholder="Energized, tired, happy..."
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholderTextColor={theme.textSecondary}
            />
            <TouchableOpacity
              onPress={handleFinishSession}
              style={[styles.mainBtn, { backgroundColor: theme.primary, marginTop: 12 }]}
            >
              <Text style={[styles.mainBtnText, { color: theme.buttonText }]}>Save Session</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* HISTORY */}
        <View style={{ marginTop: 22, paddingHorizontal: 18 }}>
          <Text style={[styles.historyTitle, { color: theme.text }]}>Focus History</Text>
          {history.length === 0 && (
            <Text style={{ color: theme.textSecondary, fontSize: 15, opacity: 0.7 }}>No sessions saved yet.</Text>
          )}
          {history.map((h, idx) => (
            <View key={idx} style={[styles.historyCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.historyTask, { color: theme.text }]}>{h.task}</Text>
              <Text style={[styles.historyInfo, { color: theme.textSecondary }]}>
                {h.date} · {h.duration} min
              </Text>
              <Text style={[styles.historyInfo, { color: theme.textSecondary }]}>
                {h.finished ? `Result: ${h.finished}` : ""} {h.feeling ? `· ${h.feeling}` : ""}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Checklist Switch Item
function CheckItem({ label, value, onValueChange, theme }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: theme.primary, false: theme.surface }}
        thumbColor={value ? theme.buttonText : theme.textSecondary}
      />
      <Text style={{ marginLeft: 10, color: theme.text, fontSize: 16 }}>{label}</Text>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  safeBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 14 : 12,
    paddingBottom: 8,
    paddingHorizontal: 10,
    minHeight: 54,
    zIndex: 99,
    borderBottomWidth: 0,
  },
  backBtn: {
    borderRadius: 20,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  logoQuoteRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 18,
    minHeight: 44,
    // No gap property for RN, use margin
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  logoZ: {
    fontSize: 19,
    color: "#fff",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  quote: {
    flex: 1,
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "left",
    opacity: 0.89,
    marginRight: 8,
  },
  pageTitle: {
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginTop: 0,
    marginBottom: 0,
    textAlign: "center",
  },
  timerSelectorRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginBottom: 30,
    marginTop: 8,
  },
  timerBtn: {
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 8,
  },
  timerBtnText: {
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  customTimeBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  customInput: {
    fontSize: 16,
    fontWeight: "600",
    width: 40,
    textAlign: "center",
    padding: 0,
    backgroundColor: "transparent",
  },
  customMin: {
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 4,
  },
  timerWrap: {
    alignItems: "center",
    marginBottom: 34,
    marginTop: 0,
  },
  timerText: {
    fontSize: 70,
    fontFamily: "monospace",
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 10,
  },
  card: {
    borderRadius: 26,
    padding: 26,
    marginHorizontal: 14,
    marginBottom: 34,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "left",
  },
  input: {
    borderBottomWidth: 1,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 18,
    backgroundColor: "transparent",
  },
  checklistTitle: {
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 4,
    fontSize: 16,
  },
  checklistItems: {
    flexDirection: "column",
    gap: 8,
    marginBottom: 18,
  },
  mainBtn: {
    borderRadius: 100,
    paddingVertical: 19,
    alignItems: "center",
    marginTop: 6,
  },
  mainBtnText: {
    fontWeight: "bold",
    fontSize: 19,
    letterSpacing: 1,
  },
  runBtnsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginBottom: 15,
  },
  pauseBtn: {
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 30,
    paddingVertical: 13,
    marginRight: 8,
  },
  pauseBtnText: {
    fontWeight: "bold",
    fontSize: 17,
  },
  resetBtn: {
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  resetBtnText: {
    fontWeight: "bold",
    fontSize: 17,
  },
  runTask: {
    fontSize: 17,
    marginBottom: 16,
    fontStyle: "italic",
    opacity: 0.87,
  },
  rewardLine: {
    fontSize: 15,
    marginBottom: 8,
    opacity: 0.7,
  },
  rewardText: {
    fontWeight: "500",
  },
  afterTitle: {
    fontWeight: "800",
    fontSize: 21,
    marginBottom: 16,
    textAlign: "center",
  },
  afterLabel: {
    fontSize: 15,
    marginBottom: 8,
    marginTop: 2,
  },
  historyTitle: {
    fontWeight: "bold",
    fontSize: 19,
    marginBottom: 12,
    marginLeft: 2,
  },
  historyCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 13,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 }
  },
  historyTask: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 2,
  },
  historyInfo: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 2,
  },
});
