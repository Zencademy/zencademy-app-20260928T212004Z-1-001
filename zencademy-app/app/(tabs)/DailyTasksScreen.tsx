import { WinPulse } from '../../components/WinPulse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
    Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../components/ThemeContext";
import { AppHeader } from "../../components/ui/AppHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { CountUp, FadeRise, FlameStreak } from "../../components/ui/motion";
import { type } from "../../components/ui/type";

const QUOTES = [
  "Execute. Don't negotiate with yourself.",
  "Standards over moods.",
  "Pressure is a privilege.",
  "Finish what average people quit.",
  "Discipline is identity.",
  "No witnesses needed. Just results.",
  "Soft days build soft people.",
  "Move first. Feel later.",
];

function todayString() {
  const d = new Date();
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}
const TASKS_KEY = '@daily_tasks_' + new Date().toISOString().slice(0,10);

export default function DailyTasksScreen({ embedded = false }: { embedded?: boolean }) {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [quoteIdx, setQuoteIdx] = useState(Math.floor(Math.random()*QUOTES.length));
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastConfettiAt, setLastConfettiAt] = useState(0);

  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(TASKS_KEY);
      if (raw) setTasks(JSON.parse(raw));
    })();
  }, []);
  useEffect(() => { AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }, [tasks]);
  const completed = tasks.filter(t => t.done).length;
  const allDone = tasks.length > 0 && completed === tasks.length;

  // Animated quote fade in/out
  useEffect(() => {
    let timeout;
    function nextQuote() {
      Animated.timing(fadeAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => {
        setQuoteIdx((q) => (q + 1) % QUOTES.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
      });
      timeout = setTimeout(nextQuote, 4700);
    }
    timeout = setTimeout(nextQuote, 4700);
    return () => clearTimeout(timeout);
  }, []);

  // Confetti with 30s cooldown
  useEffect(() => {
    if (allDone) {
      const now = Date.now();
      if (now - lastConfettiAt > 30000) {
        setLastConfettiAt(now);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  }, [allDone, tasks.length]);

  const addTask = () => {
    if (!input.trim()) return;
    if (tasks.length >= 10) {
      Alert.alert("Task limit", "Max 10 tasks/day for best focus.");
      return;
    }
    setTasks([...tasks, { id: Date.now().toString(), title: input.trim(), done: false }]);
    setInput('');
    Keyboard.dismiss();
  };
  const toggleTask = (idx) => {
    const copy = [...tasks]; copy[idx].done = !copy[idx].done; setTasks(copy);
  };
  const deleteTask = (idx) => { const copy = [...tasks]; copy.splice(idx, 1); setTasks(copy); };
  const clearAllTasks = () => {
    Alert.alert("Clear all?", "This will remove all tasks for today.", [
      { text: "Cancel", style: "cancel" }, { text: "Clear", style: "destructive", onPress: () => setTasks([]) }
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={embedded ? ['bottom'] : ['top', 'bottom']}>
      {showConfetti && (
        <WinPulse active />
      )}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        {!embedded ? (
          <AppHeader onBack={() => router.push('/')} title="EXECUTE" showWallet={false} />
        ) : (
          <AppHeader title="EXECUTE" showWallet compactWallet={false} />
        )}
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <FadeRise>
            <Text style={[type.title, { color: theme.text, textAlign: 'center', marginTop: 10 }]}>Daily Execution</Text>
            <Text style={[type.subtitle, { color: theme.textSecondary, textAlign: 'center', marginBottom: 8 }]}>
              Write the work. Finish the work. No theater.
            </Text>
          </FadeRise>

          <Text style={[styles.badge, { backgroundColor: theme.surface, color: theme.textSecondary, borderColor: theme.border }]}>{todayString()}</Text>

          <FadeRise delay={90}>
            <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                {allDone && tasks.length > 0 ? <FlameStreak size={22} color={theme.flame} /> : null}
                <Text style={[styles.statsBig, { color: theme.text }]}>
                  <CountUp value={completed} duration={650} style={[styles.statsBig, { color: theme.text }]} />
                  /{tasks.length}
                  <Text style={{ fontSize: 18, color: theme.textSecondary, fontWeight: "400" }}> locked in</Text>
                </Text>
              </View>
              <Text style={[styles.statsMsg, { color: theme.textSecondary }]}>
                {allDone && tasks.length > 0
                  ? "Day secured. Stay sharp."
                  : completed === 0
                    ? "Empty list. Add targets."
                    : "Keep moving. No soft exits."}
              </Text>
            </View>
          </FadeRise>

          <View style={{ width: "100%", marginTop: 15, marginBottom: 10 }}>
            {tasks.length === 0 ? (
              <EmptyState
                icon="checkbox-outline"
                title="No targets yet"
                body="Write one concrete outcome for today. Keep it short — finish it before anything else."
              />
            ) : null}
            {tasks.map((task, idx) => (
              <View key={task.id} style={[styles.taskCard, { backgroundColor: theme.card, borderColor: theme.border }, task.done && styles.taskDone]}>
                <TouchableOpacity onPress={() => toggleTask(idx)} style={styles.checkboxWrap}>
                  <View style={[task.done ? styles.checkboxChecked : styles.checkbox, { borderColor: theme.border, backgroundColor: task.done ? theme.primary : theme.surface }]}>
                    {task.done && <Text style={[styles.checkIcon, { color: theme.buttonText }]}>✓</Text>}
                  </View>
                </TouchableOpacity>
                <Text style={[styles.taskText, { color: theme.text }, task.done && styles.taskTextDone]}>{task.title}</Text>
                <TouchableOpacity onPress={() => deleteTask(idx)} hitSlop={10}>
                  <Text style={[styles.deleteBtn, { color: theme.textTertiary }]}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={[styles.addCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={tasks.length >= 10 ? "Max 10 targets" : "Add a target..."}
              placeholderTextColor={theme.textTertiary}
              value={input}
              editable={tasks.length < 10}
              onChangeText={setInput}
              onSubmitEditing={addTask}
              returnKeyType="done"
              maxLength={60}
            />
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: theme.primary }, tasks.length >= 10 && { opacity: 0.35 }]}
              onPress={addTask}
              disabled={tasks.length >= 10}
            >
              <Text style={[styles.addBtnText, { color: theme.buttonText }]}>＋</Text>
            </TouchableOpacity>
          </View>

          {/* CLEAR ALL */}
          <TouchableOpacity style={[styles.clearBtn, { borderColor: theme.border }]} onPress={clearAllTasks}>
            <Text style={[styles.clearBtnText, { color: theme.textSecondary }]}>Clear all tasks</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 54, width: "100%" },
  safeBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 14 : 12,
    paddingBottom: 8,
    paddingHorizontal: 20,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  placeholder: {
    width: 44,
  },
  logoQuoteRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 18,
    minHeight: 44,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#111",
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
    color: "#555",
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
  badge: {
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 17,
    borderRadius: 13,
    paddingVertical: 5,
    paddingHorizontal: 18,
    marginTop: 2,
    marginBottom: 13,
    overflow: "hidden",
    borderWidth: 1
  },
  statsCard: {
    borderRadius: 20, alignSelf: "center", alignItems: "center",
    padding: 24, width: "87%",
    marginTop: 4, marginBottom: 14,
    shadowColor: "#222", shadowOpacity: 0.07, shadowRadius: 12, elevation: 2, borderWidth: 1
  },
  statsBig: {
    fontSize: 28, fontWeight: "900", letterSpacing: 1.2,
    textAlign: "center", marginBottom: 2,
  },
  statsMsg: {
    fontWeight: "700", fontSize: 16, marginTop: 2, textAlign: "center",
  },
  noTasks: {
    fontSize: 16, textAlign: "center", fontStyle: "italic", marginTop: 14
  },
  taskCard: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 15, padding: 19, marginHorizontal: 18, marginTop: 17,
    shadowColor: "#222", shadowOpacity: 0.07, shadowRadius: 12, elevation: 2,
    borderWidth: 1
  },
  taskDone: {
    opacity: 0.54
  },
  checkboxWrap: { marginRight: 18 },
  checkbox: {
    width: 31, height: 31, borderRadius: 11, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  checkboxChecked: {
    width: 31, height: 31, borderRadius: 11, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  checkIcon: {
    fontWeight: "900", fontSize: 21, marginTop: -2
  },
  taskText: {
    flex: 1, fontSize: 18, fontWeight: "600", letterSpacing: 0.13, marginRight: 10,
  },
  taskTextDone: { textDecorationLine: "line-through" },
  deleteBtn: { fontSize: 24, marginLeft: 15 },

  addCard: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 15, marginTop: 36, marginBottom: 6, paddingHorizontal: 12, paddingVertical: 7,
    marginHorizontal: 18, shadowColor: "#111", shadowOpacity: 0.07, shadowRadius: 7, elevation: 1,
    borderWidth: 1
  },
  input: {
    flex: 1, fontSize: 18, padding: 11, paddingLeft: 14,
    borderRadius: 10, fontWeight: "600",
  },
  addBtn: {
    marginLeft: 9, borderRadius: 10, paddingHorizontal: 19, paddingVertical: 8,
    alignItems: "center", justifyContent: "center", shadowColor: "#111", shadowOpacity: 0.12, shadowRadius: 10, elevation: 2,
  },
  addBtnText: { fontWeight: "bold", fontSize: 26, marginTop: -2 },
  clearBtn: { alignSelf: "center", marginTop: 26, marginBottom: 34, padding: 7, paddingHorizontal: 22, borderWidth: 1, borderRadius: 10 },
  clearBtnText: { fontWeight: "bold", fontSize: 15.3, opacity: 0.5, textDecorationLine: "underline" },
});
