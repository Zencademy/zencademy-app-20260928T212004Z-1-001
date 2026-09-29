import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert, Animated,
    KeyboardAvoidingView, Platform,
    ScrollView, StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../components/AuthContext";
import { useScreensaver } from "../../components/ScreensaverContext";
import ScreensaverOverlay from "../../components/ScreensaverOverlay";
import { useTheme } from "../../components/ThemeContext";
import { journalService } from "../../utils/supabase";
import useResponsive from '../../hooks/useResponsive';

const MOOD_OPTIONS = [
  { icon: "happy-outline", label: "Happy", value: "happy", feedback: "Amazing! Keep that positive energy!", color: "#10B981" },
  { icon: "leaf", label: "Calm", value: "calm", feedback: "Peaceful vibes! You're doing great!", color: "#059669" },
  { icon: "remove", label: "Neutral", value: "neutral", feedback: "Balanced state! That's perfectly fine!", color: "#6B7280" },
  { icon: "sad-outline", label: "Sad", value: "sad", feedback: "It's okay to feel down. Tomorrow will be better!", color: "#3B82F6" },
  { icon: "flame", label: "Stressed", value: "stressed", feedback: "You're stronger than stress! Take a deep breath!", color: "#F59E0B" },
  { icon: "moon", label: "Tired", value: "tired", feedback: "Rest is important! Take care of yourself!", color: "#8B5CF6" }
];

const ENERGY_OPTIONS = [
  { icon: "flash", label: "High Energy", value: "high", color: "#F59E0B" },
  { icon: "flame", label: "Motivated", value: "motivated", color: "#EF4444" },
  { icon: "happy-outline", label: "Good", value: "good", color: "#10B981" },
  { icon: "remove", label: "Okay", value: "okay", color: "#6B7280" },
  { icon: "moon", label: "Low", value: "low", color: "#8B5CF6" },
  { icon: "bed", label: "Exhausted", value: "exhausted", color: "#374151" }
];

const PRODUCTIVITY_OPTIONS = [
  { icon: "rocket", label: "Super Productive", value: "super", color: "#8B5CF6" },
  { icon: "fitness", label: "Very Productive", value: "very", color: "#F59E0B" },
  { icon: "checkmark-circle", label: "Productive", value: "productive", color: "#10B981" },
  { icon: "remove", label: "Average", value: "average", color: "#6B7280" },
  { icon: "sad-outline", label: "Not Very", value: "not_very", color: "#3B82F6" },
  { icon: "moon", label: "Not At All", value: "not_at_all", color: "#374151" }
];

const SOCIAL_OPTIONS = [
  { icon: "people", label: "Very Social", value: "very", color: "#10B981" },
  { icon: "happy-outline", label: "Social", value: "social", color: "#059669" },
  { icon: "remove", label: "Neutral", value: "neutral", color: "#6B7280" },
  { icon: "sad-outline", label: "Quiet", value: "quiet", color: "#3B82F6" },
  { icon: "volume-mute", label: "Very Quiet", value: "very_quiet", color: "#374151" },
  { icon: "home", label: "Alone Time", value: "alone", color: "#8B5CF6" }
];

const WEATHER_OPTIONS = [
  { icon: "sunny", label: "Sunny", value: "sunny", color: "#F59E0B" },
  { icon: "partly-sunny", label: "Partly Cloudy", value: "partly_cloudy", color: "#6B7280" },
  { icon: "cloudy", label: "Cloudy", value: "cloudy", color: "#374151" },
  { icon: "rainy", label: "Rainy", value: "rainy", color: "#3B82F6" },
  { icon: "snow", label: "Cold", value: "cold", color: "#8B5CF6" },
  { icon: "sunny", label: "Beautiful", value: "beautiful", color: "#10B981" }
];

const ACTIVITY_OPTIONS = [
  { icon: "fitness", label: "Exercise", value: "exercise", color: "#10B981" },
  { icon: "library", label: "Study/Work", value: "study", color: "#3B82F6" },
  { icon: "game-controller", label: "Gaming", value: "gaming", color: "#8B5CF6" },
  { icon: "musical-notes", label: "Music", value: "music", color: "#F59E0B" },
  { icon: "restaurant", label: "Cooking", value: "cooking", color: "#EF4444" },
  { icon: "moon", label: "Rest", value: "rest", color: "#6B7280" }
];

const QUESTIONS = [
  { 
    question: "How's your energy level today?", 
    options: ENERGY_OPTIONS,
    key: "energy"
  },
  { 
    question: "How productive were you?", 
    options: PRODUCTIVITY_OPTIONS,
    key: "productivity"
  },
  { 
    question: "How social did you feel?", 
    options: SOCIAL_OPTIONS,
    key: "social"
  },
  { 
    question: "What's the weather like?", 
    options: WEATHER_OPTIONS,
    key: "weather"
  },
  { 
    question: "What activity describes your day?", 
    options: ACTIVITY_OPTIONS,
    key: "activity"
  }
];

const SUCCESS_MESSAGES = [
  "Fantastic! Your reflection is saved!",
  "Amazing work! Keep up the great energy!",
  "Brilliant! You're making progress every day!",
  "Wonderful! Your thoughts are valuable!",
  "Excellent! You're on the right track!"
];

type Props = {
  goHome?: () => void;
  goMenu?: () => void;
  goJournal?: () => void;
  openMenu?: () => void;
};

export default function JournalScreen({ goHome, goMenu, goJournal, openMenu }: Props) {
  const router = useRouter();
  const { insets } = (useResponsive as any)();
  const { active: screensaverActive } = useScreensaver();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [todayEntry, setTodayEntry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const scrollViewRef = useRef<ScrollView | null>(null);

  // Screensaver global - premium sync
  const { resetTimer, setScreensaverActive } = useScreensaver();
  useFocusEffect(
    useCallback(() => {
      resetTimer();
      setScreensaverActive(false);
      return () => setScreensaverActive(false);
    }, [])
  );

  useEffect(() => { 
    if (user) {
      loadTodayEntry(); 
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadTodayEntry = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const entry = await journalService.getJournalEntry(user.id, today);
      
      if (entry) {
        setTodayEntry(entry);
        setSelectedMood(entry.mood || "");
        setAnswers(entry.answers || {});
      } else {
        // Try to load from AsyncStorage as fallback for migration
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const legacyData = await AsyncStorage.getItem(`@journal_${today}`);
          if (legacyData) {
            const legacyEntry = JSON.parse(legacyData);
            setTodayEntry(legacyEntry);
            setSelectedMood(legacyEntry.mood || "");
            setAnswers(legacyEntry.answers || {});
            // Migrate to Supabase
            await journalService.saveJournalEntry(user.id, {
              date: today,
              mood: legacyEntry.mood,
              answers: legacyEntry.answers,
              timestamp: legacyEntry.timestamp || Date.now(),
            });
          }
        } catch (e) {
          // No legacy data, continue
        }
      }
    } catch (error) {
      console.error('Error loading today entry:', error);
      // Fallback to AsyncStorage if Supabase fails
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const today = new Date().toISOString().split('T')[0];
        const data = await AsyncStorage.getItem(`@journal_${today}`);
        if (data) {
          const entry = JSON.parse(data);
          setTodayEntry(entry);
          setSelectedMood(entry.mood || "");
          setAnswers(entry.answers || {});
        }
      } catch (e) {
        // Error loading
      }
    }
    setIsLoading(false);
  };

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    const selectedMoodData = MOOD_OPTIONS.find(m => m.value === mood);
    if (selectedMoodData) {
      setFeedbackMessage(selectedMoodData.feedback);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    }
  };

  const handleAnswerSelect = (questionKey: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionKey]: value
    }));
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      Alert.alert("Please select your mood first!");
      return;
    }

    if (!user) {
      Alert.alert("Please sign in to save your journal entry");
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const entry = {
      date: today,
      mood: selectedMood,
      answers: answers,
      timestamp: Date.now()
    };

    try {
      // Save to Supabase
      const success = await journalService.saveJournalEntry(user.id, entry);
      
      if (success) {
        setTodayEntry(entry);
        
        // Also save to AsyncStorage as backup
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.setItem(`@journal_${today}`, JSON.stringify({
            date: new Date().toISOString(),
            mood: selectedMood,
            answers: answers,
            timestamp: Date.now()
          }));
        } catch (e) {
          // AsyncStorage backup failed, but Supabase saved
        }
        
        // Show success feedback
        const randomMessage = SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)];
        setFeedbackMessage(randomMessage);
        setShowFeedback(true);
        
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
        setTimeout(() => setShowFeedback(false), 3000);
      } else {
        Alert.alert("Error saving entry", "Please try again");
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert("Error saving entry", "Please check your connection and try again");
    }
  };

  return (
    <Animated.View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        {/* Drawer removed per request */}
        <ScreensaverOverlay />
        {showConfetti && (
          <ConfettiCannon count={100} origin={{ x: 200, y: -16 }} fadeOut autoStart explosionSpeed={380} fallSpeed={1900} />
        )}

        {/* Feedback Message */}
        {showFeedback && (
          <View style={[styles.feedbackContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.feedbackText, { color: theme.text }]}>{feedbackMessage}</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Daily Journal</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Quick reflection for today</Text>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 20, paddingBottom: 40 }}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={true}
            scrollIndicatorInsets={{ right: 5 }}
            indicatorStyle="black"
            bounces={true}
            scrollEventThrottle={16}
            onScrollBeginDrag={resetTimer}
            onTouchStart={resetTimer}
            onScroll={() => resetTimer()}
          >
            {/* Mood Selection */}
            <View style={styles.moodSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>How are you feeling?</Text>
              <View style={styles.moodGrid}>
                {MOOD_OPTIONS.map((mood) => (
                  <TouchableOpacity
                    key={mood.value}
                    style={[
                      styles.moodOption,
                      { backgroundColor: theme.card, borderColor: theme.border },
                      selectedMood === mood.value && styles.moodOptionSelected
                    ]}
                    onPress={() => {
                      resetTimer();
                      handleMoodSelect(mood.value);
                    }}
                  >
                    <View style={[styles.moodIconContainer, { backgroundColor: `${mood.color}20` }]}>
                      <Ionicons name={mood.icon as any} size={24} color={mood.color} />
                    </View>
                    <Text style={[
                      styles.moodLabel,
                      { color: theme.text },
                      selectedMood === mood.value && styles.moodLabelSelected
                    ]}>
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Questions */}
            <View style={styles.questionsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Reflection</Text>
              {QUESTIONS.map((questionData) => (
                <View key={questionData.key} style={styles.questionContainer}>
                  <Text style={[styles.questionText, { color: theme.text }]}>{questionData.question}</Text>
                  <View style={styles.optionsGrid}>
                    {questionData.options.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.optionButton,
                          { backgroundColor: theme.card, borderColor: theme.border },
                          answers[questionData.key] === option.value && styles.optionButtonSelected
                        ]}
                        onPress={() => {
                          resetTimer();
                          handleAnswerSelect(questionData.key, option.value);
                        }}
                      >
                        <View style={[styles.optionIconContainer, { backgroundColor: `${option.color}20` }]}>
                          <Ionicons name={option.icon as any} size={20} color={option.color} />
                        </View>
                        <Text style={[
                          styles.optionLabel,
                          { color: theme.text },
                          answers[questionData.key] === option.value && styles.optionLabelSelected
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>

                {/* Save Button */}
                <TouchableOpacity 
                  style={[
                    styles.saveButton,
                    { backgroundColor: theme.primary },
                    !selectedMood && styles.saveButtonDisabled
                  ]} 
                  onPress={() => {
                    resetTimer();
                    handleSubmit();
                  }}
                  disabled={!selectedMood}
                >
                  <Text style={[styles.saveButtonText, { color: theme.buttonText }]}>
                    {todayEntry ? 'Update Entry' : 'Save Today'}
                  </Text>
                </TouchableOpacity>

                {/* Today's Summary */}
                {todayEntry && (
                  <View style={styles.summarySection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Entry</Text>
                    <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      <View style={styles.summaryHeader}>
                        <View style={styles.summaryMoodContainer}>
                          <View style={[styles.summaryMoodIcon, { backgroundColor: `${MOOD_OPTIONS.find(m => m.value === todayEntry.mood)?.color}20` }]}>
                            <Ionicons 
                              name={MOOD_OPTIONS.find(m => m.value === todayEntry.mood)?.icon as any} 
                              size={20} 
                              color={MOOD_OPTIONS.find(m => m.value === todayEntry.mood)?.color} 
                            />
                          </View>
                          <Text style={[styles.summaryMood, { color: theme.text }]}>
                            {MOOD_OPTIONS.find(m => m.value === todayEntry.mood)?.label}
                          </Text>
                        </View>
                        <Text style={[styles.summaryTime, { color: theme.textSecondary }]}>
                          {new Date(todayEntry.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Text>
                      </View>
                      {QUESTIONS.map((question) => {
                        const answer = todayEntry.answers[question.key];
                        if (!answer) return null;
                        const selectedOption = question.options.find(opt => opt.value === answer);
                        return (
                          <View key={question.key} style={styles.summaryAnswer}>
                            <Text style={[styles.summaryQuestion, { color: theme.text }]}>{question.question}</Text>
                            <View style={styles.summaryAnswerContainer}>
                              <View style={[styles.summaryAnswerIcon, { backgroundColor: `${selectedOption?.color}20` }]}>
                                <Ionicons 
                                  name={selectedOption?.icon as any} 
                                  size={16} 
                                  color={selectedOption?.color} 
                                />
                              </View>
                              <Text style={[styles.summaryAnswerText, { color: theme.textSecondary }]}>
                                {selectedOption?.label}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Scroll Indicator */}
                <View style={styles.scrollIndicator}>
                  <Text style={[styles.scrollText, { color: theme.textTertiary }]}>Scroll for more</Text>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  feedbackContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    borderRadius: 15,
    padding: 15,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  moodSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  moodOption: {
    width: "30%",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    borderWidth: 2,
  },
  moodOptionSelected: {
    borderColor: "#111",
    backgroundColor: "#f8f8f8",
  },
  moodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  moodLabelSelected: {
    color: "#111",
    fontWeight: "600",
  },
  questionsSection: {
    marginBottom: 30,
  },
  questionContainer: {
    marginBottom: 25,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  optionButton: {
    width: "48%",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  optionButtonSelected: {
    borderColor: "#111",
    backgroundColor: "#f8f8f8",
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  optionLabel: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  optionLabelSelected: {
    color: "#111",
    fontWeight: "600",
  },
  saveButton: {
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 30,
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryCard: {
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  summaryMoodContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryMoodIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  summaryMood: {
    fontSize: 16,
    fontWeight: "600",
  },
  summaryTime: {
    fontSize: 14,
  },
  summaryAnswer: {
    marginBottom: 12,
  },
  summaryQuestion: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  summaryAnswerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryAnswerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  summaryAnswerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  scrollIndicator: {
    alignItems: 'center',
    paddingVertical: 20,
    opacity: 0.6,
  },
  scrollText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
