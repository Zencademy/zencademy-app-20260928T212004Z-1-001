import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
    Text, TextInput, TouchableOpacity, View
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../components/ThemeContext";

const QUOTES = [
  "Win the day with small steps.",
  "Little by little, progress adds up.",
  "Success is built on daily habits.",
  "Your habits create your results.",
  "Big goals? Break them into daily tasks.",
  "Consistency is the secret to success.",
  "Done is better than perfect.",
  "What you do today shapes tomorrow.",
  "Start now. Adjust later.",
  "Stay focused, stay kind.",
  "You’re closer than you think.",
  "Action beats intention.",
  "Check off your dreams, one task at a time.",
  "Every task done is a win.",
  "Finish what you start.",
  "Make every day count.",
  "Greatness is built one day at a time.",
  "You can do hard things.",
  "Progress, not perfection.",
  "One task at a time.",
];

function todayString() {
  const d = new Date();
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}
const TASKS_KEY = '@daily_tasks_' + new Date().toISOString().slice(0,10);

export default function DailyTasksScreen() {
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Confetti Cannon */}
      {showConfetti && (
        <ConfettiCannon
          count={90}
          origin={{ x: 180, y: 0 }}
          fadeOut
          fallSpeed={2800}
          explosionSpeed={500}
          colors={["#111", "#e4e4e4", "#bbb", "#fff"]}
        />
      )}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Safe top bar: back + logo + quote */}
          <View style={styles.safeBar}>
            <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.surface }]} onPress={() => router.push('/')} hitSlop={18}>
              <Ionicons name="arrow-back-outline" size={28} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Daily Tasks</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Titlu mare */}
          <View style={{ marginTop: 28, marginBottom: 6, alignItems: "center" }}>
            <Text style={[styles.pageTitle, { color: theme.text }]}>Daily Tasks</Text>
          </View>

          {/* Badge data */}
          <Text style={[styles.badge, { backgroundColor: theme.surface, color: theme.textSecondary, borderColor: theme.border }]}>{todayString()}</Text>

          {/* Stats Card */}
          <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.statsBig, { color: theme.text }]}>
              {completed}/{tasks.length}
              <Text style={{ fontSize: 18, color: theme.textSecondary, fontWeight: "400" }}> tasks</Text>
            </Text>
            <Text style={[styles.statsMsg, { color: theme.textSecondary }]}>
              {allDone && tasks.length > 0
                ? "Amazing! All done!"
                : completed === 0
                  ? "Let's get started!"
                  : "Almost there, keep it up!"}
            </Text>
          </View>

          {/* Task List */}
          <View style={{ width: "100%", marginTop: 15, marginBottom: 10 }}>
            {tasks.length === 0 && (
              <Text style={[styles.noTasks, { color: theme.textSecondary }]}>No tasks yet. Start by adding one below 👇</Text>
            )}
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

          {/* INPUT + ADD BTN */}
          <View style={[styles.addCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={tasks.length >= 10 ? "Max 10 tasks" : "Add a new task..."}
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
