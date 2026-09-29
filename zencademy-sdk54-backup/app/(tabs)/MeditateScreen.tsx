import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { useTheme } from "../../components/ThemeContext";

const { width, height } = Dimensions.get("window");

const MODES = [
  {
    name: "Box Breathing",
    desc: "4s Inhale • 4s Hold • 4s Exhale • 4s Hold",
    benefit: "Reduces anxiety. Calms your nervous system. Navy SEALs approved.",
    steps: [
      { label: "Inhale", duration: 4000, action: "up" },
      { label: "Hold", duration: 4000, action: "hold" },
      { label: "Exhale", duration: 4000, action: "down" },
      { label: "Hold", duration: 4000, action: "hold" },
    ],
    color: "#000"
  },
  {
    name: "4-7-8 Breathing",
    desc: "4s Inhale • 7s Hold • 8s Exhale",
    benefit: "Lowers pulse, induces sleep, reduces stress (Dr. Weil method).",
    steps: [
      { label: "Inhale", duration: 4000, action: "up" },
      { label: "Hold", duration: 7000, action: "hold" },
      { label: "Exhale", duration: 8000, action: "down" },
    ],
    color: "#000"
  },
  {
    name: "Balanced",
    desc: "5s Inhale • 5s Exhale",
    benefit: "Balances breathing, great for focus and general relaxation.",
    steps: [
      { label: "Inhale", duration: 5000, action: "up" },
      { label: "Exhale", duration: 5000, action: "down" },
    ],
    color: "#000"
  },
  {
    name: "Resonance",
    desc: "6s Inhale • 6s Exhale",
    benefit: "Maximizes heart-brain coherence (HRV), great for chronic stress.",
    steps: [
      { label: "Inhale", duration: 6000, action: "up" },
      { label: "Exhale", duration: 6000, action: "down" },
    ],
    color: "#000"
  }
];

const quotes = [
  "Just breathe.",
  "Let go of what you can't control.",
  "Relax your mind and body.",
  "Breathing deeply calms the nervous system.",
  "Awareness starts with one breath.",
  "Peace comes from within.",
  "Inhale calm, exhale stress.",
  "Every exhale is an opportunity to let go.",
  "Your breath is your anchor.",
  "The present moment is enough.",
  "Silence your mind and listen to your breath.",
  "You are right where you need to be.",
  "Peace is always within reach.",
  "Breathe in confidence, breathe out doubt.",
  "Slow down. Notice the space between breaths.",
  "Each breath is a fresh start.",
  "Your body knows how to find balance.",
  "Be still. Feel the air move in and out.",
  "One mindful breath can change everything.",
  "The breath is a bridge to the now.",
];

const PRACTICES_GUIDE = {
  title: "Meditation Practices Guide",
  practices: [
    {
      name: "Box Breathing",
      description: "A powerful technique used by Navy SEALs to maintain calm under pressure.",
      benefits: ["Reduces anxiety", "Improves focus", "Calms nervous system", "Enhances performance"],
      whenToUse: "Before important meetings, during stress, or when you need to stay composed."
    },
    {
      name: "4-7-8 Breathing",
      description: "Developed by Dr. Andrew Weil, this technique helps induce sleep and reduce stress.",
      benefits: ["Promotes sleep", "Lowers blood pressure", "Reduces stress", "Improves digestion"],
      whenToUse: "Before bedtime, when feeling anxious, or to calm racing thoughts."
    },
    {
      name: "Balanced Breathing",
      description: "A simple, natural breathing pattern that brings balance to mind and body.",
      benefits: ["Improves focus", "Reduces tension", "Enhances clarity", "Promotes relaxation"],
      whenToUse: "During work breaks, before meditation, or when you need mental clarity."
    },
    {
      name: "Resonance Breathing",
      description: "Optimizes heart rate variability (HRV) for maximum physiological coherence.",
      benefits: ["Maximizes HRV", "Reduces chronic stress", "Improves heart health", "Enhances recovery"],
      whenToUse: "For stress management, recovery, or when you want to optimize your physiology."
    }
  ],
  tips: [
    "Start with 3-5 minutes daily and gradually increase",
    "Practice in a quiet, comfortable environment",
    "Focus on the sensation of breath, not trying to control it",
    "Be patient - the benefits accumulate over time",
    "Consistency is more important than duration"
  ]
};

function getTimerLabel(ms) {
  const s = Math.ceil(ms / 1000);
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
}

// Animated background bubbles
function BubbleBgAnim({ size, left, color, duration, delay, parallax }) {
  const animY = useRef(new Animated.Value(height + size)).current;
  const parallaxX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateY = () => {
      animY.setValue(height + size);
      Animated.timing(animY, {
        toValue: -size,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }).start(() => animateY());
    };
    animateY();

    if (parallax) {
      const animateX = () => {
        Animated.sequence([
          Animated.timing(parallaxX, {
            toValue: 12,
            duration: duration * 0.4,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(parallaxX, {
            toValue: -12,
            duration: duration * 0.4,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(parallaxX, {
            toValue: 0,
            duration: duration * 0.2,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]).start(() => animateX());
      };
      animateX();
    }
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: 0.03 + Math.random() * 0.08,
        filter: Platform.OS === "web" ? "blur(1.5px)" : undefined,
        transform: [{ translateY: animY }, { translateX: parallaxX }],
      }}
    />
  );
}

function ProBubblesBg({ color = "#f0f0f0" }) {
  const bubblesParams = useMemo(() =>
    Array.from({ length: 12 }).map((_, i) => ({
      size: 20 + Math.random() * 40,
      left: Math.random() * (width - 50),
      color,
      duration: 12000 + Math.random() * 8000,
      delay: Math.random() * 4000,
      parallax: i % 2 === 0,
    })), [color]
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      {bubblesParams.map((p, i) => (
        <BubbleBgAnim key={i} {...p} />
      ))}
    </View>
  );
}

export default function MeditateScreen({ goHome }) {
  const { theme } = useTheme();
  const [modeIndex, setModeIndex] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [timer, setTimer] = useState(3 * 60 * 1000);
  const [remaining, setRemaining] = useState(timer);
  const [showHelp, setShowHelp] = useState(false);
  const [modalScale] = useState(new Animated.Value(0.8));
  const [modalOpacity] = useState(new Animated.Value(0));

  // Animated quote
  const [quoteIndex, setQuoteIndex] = useState(Math.floor(Math.random() * quotes.length));
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const router = useRouter();
  const mode = MODES[modeIndex];

  // Bubble animation for breath
  const bubbleAnim = useRef(new Animated.Value(1)).current;
  const prevScale = useRef(1);

  // Quote fade
  useEffect(() => {
    let timeout;
    function nextQuote() {
      Animated.timing(fadeAnim, { toValue: 0, duration: 380, useNativeDriver: true }).start(() => {
        setQuoteIndex((q) => (q + 1) % quotes.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 380, useNativeDriver: true }).start();
      });
      timeout = setTimeout(nextQuote, 4800);
    }
    timeout = setTimeout(nextQuote, 4800);
    return () => clearTimeout(timeout);
  }, []);

  // Modal animations
  useEffect(() => {
    if (showHelp) {
      Animated.parallel([
        Animated.timing(modalOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(modalScale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(modalScale, { toValue: 0.8, duration: 200, useNativeDriver: true })
      ]).start();
    }
  }, [showHelp]);

  // Timer general
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setRemaining(r => {
        if (r <= 1000) {
          setPlaying(false);
          return 0;
        }
        return r - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [playing]);

  // Breathing animation
  useEffect(() => {
    if (!playing) {
      bubbleAnim.stopAnimation();
      return;
    }
    let isActive = true;
    const step = mode.steps[stepIdx];
    let timeout;
    if (step.action === "up") {
      Animated.timing(bubbleAnim, {
        toValue: 1.20,
        duration: step.duration,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }).start(() => {
        if (isActive && playing) {
          prevScale.current = 1.20;
          setStepIdx(i => (i + 1) % mode.steps.length);
        }
      });
    } else if (step.action === "down") {
      Animated.timing(bubbleAnim, {
        toValue: 0.76,
        duration: step.duration,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }).start(() => {
        if (isActive && playing) {
          prevScale.current = 0.76;
          setStepIdx(i => (i + 1) % mode.steps.length);
        }
      });
    } else if (step.action === "hold") {
      bubbleAnim.setValue(prevScale.current);
      timeout = setTimeout(() => {
        if (isActive && playing) {
          setStepIdx(i => (i + 1) % mode.steps.length);
        }
      }, step.duration);
    }
    return () => {
      isActive = false;
      if (timeout) clearTimeout(timeout);
      bubbleAnim.stopAnimation();
    };
  }, [playing, stepIdx, modeIndex]);

  // Reset for new mode/timer
  const selectTime = (ms) => {
    setTimer(ms);
    setRemaining(ms);
    setPlaying(false);
    setStepIdx(0);
    bubbleAnim.setValue(1);
    prevScale.current = 1;
  };
  const selectMode = (idx) => {
    setModeIndex(idx);
    setPlaying(false);
    setStepIdx(0);
    setRemaining(timer);
    bubbleAnim.setValue(1);
    prevScale.current = 1;
  };
  const toggle = () => {
    if (remaining === 0) {
      setRemaining(timer);
      setStepIdx(0);
      bubbleAnim.setValue(1);
      prevScale.current = 1;
    }
    setPlaying(p => !p);
  };

  const currentStep = mode.steps[stepIdx];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ProBubblesBg color={theme.surface} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.surface }]}
          onPress={() => {
            if (typeof goHome === "function") goHome();
            else router.back();
          }}
          hitSlop={18}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Meditate</Text>
          <Animated.Text style={[styles.quote, { opacity: fadeAnim, color: theme.textSecondary }]}>
            {quotes[quoteIndex]}
          </Animated.Text>
        </View>
        <TouchableOpacity
          style={[styles.helpButton, { backgroundColor: theme.surface }]}
          onPress={() => setShowHelp(true)}
          hitSlop={18}
        >
          <Ionicons name="help-circle-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Breathing Mode Selector */}
        <View style={styles.modesContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Breathing Techniques</Text>
          <View style={styles.modesRow}>
            {MODES.map((m, idx) => (
              <TouchableOpacity
                key={m.name}
                style={[
                  styles.modeButton,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  modeIndex === idx && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => selectMode(idx)}
                disabled={playing}
              >
                <Text style={[
                  styles.modeButtonText,
                  { color: theme.text },
                  modeIndex === idx && { color: theme.buttonText }
                ]}>{m.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mode Description */}
        <View style={[styles.modeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.modeDesc, { color: theme.text }]}>{mode.desc}</Text>
          <Text style={[styles.modeBenefit, { color: theme.textSecondary }]}>{mode.benefit}</Text>
        </View>

        {/* Timer Selection */}
        <View style={styles.timerContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Duration</Text>
          <View style={styles.timerRow}>
            {[1, 3, 5, 10].map(m => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.timerButton,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  timer === m * 60 * 1000 && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => selectTime(m * 60 * 1000)}
                disabled={playing}
              >
                <Text style={[
                  styles.timerButtonText,
                  { color: theme.text },
                  timer === m * 60 * 1000 && { color: theme.buttonText }
                ]}>
                  {m} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Timer Display */}
        <View style={styles.timerDisplay}>
          <Text style={[styles.timerBig, { color: theme.text }]}>{getTimerLabel(remaining)}</Text>
        </View>

        {/* Breathing Animation */}
        <View style={styles.breathingContainer}>
          <Animated.View
            style={[
              styles.breathCircle,
              { backgroundColor: theme.card, borderColor: theme.primary },
              {
                transform: [{ scale: bubbleAnim }]
              }
            ]}
          >
            <Text style={[styles.breathText, { color: theme.text }]}>{currentStep.label}</Text>
          </Animated.View>
          
          {/* Box step guide for Box Breathing */}
          {mode.name === "Box Breathing" && (
            <View style={styles.boxGuideRow}>
              {mode.steps.map((step, i) => (
                <View key={i} style={[
                  styles.boxGuideStep,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  i === stepIdx && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}>
                  <Text style={[
                    styles.boxGuideText,
                    { color: theme.text },
                    i === stepIdx && { color: theme.buttonText }
                  ]}>{step.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Play Button */}
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: theme.primary }]}
          onPress={toggle}
        >
          <Ionicons name={playing ? "pause" : "play"} size={32} color={theme.buttonText} />
        </TouchableOpacity>
      </ScrollView>

      {/* Help Modal */}
      <Modal visible={showHelp} transparent animationType="none">
        <TouchableWithoutFeedback onPress={() => setShowHelp(false)}>
          <Animated.View 
            style={[
              styles.modalOverlay,
              { opacity: modalOpacity, backgroundColor: theme.overlay }
            ]}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View 
                style={[
                  styles.modalContent,
                  { backgroundColor: theme.card },
                  {
                    opacity: modalOpacity,
                    transform: [{ scale: modalScale }]
                  }
                ]}
              >
                <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>{PRACTICES_GUIDE.title}</Text>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowHelp(false)}
                  >
                    <Ionicons name="close" size={24} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  {PRACTICES_GUIDE.practices.map((practice, index) => (
                    <View key={index} style={[styles.practiceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      <Text style={[styles.practiceName, { color: theme.text }]}>{practice.name}</Text>
                      <Text style={[styles.practiceDescription, { color: theme.textSecondary }]}>{practice.description}</Text>
                      
                      <View style={styles.benefitsContainer}>
                        <Text style={[styles.benefitsTitle, { color: theme.text }]}>Benefits:</Text>
                        {practice.benefits.map((benefit, idx) => (
                          <View key={idx} style={styles.benefitItem}>
                            <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
                            <Text style={[styles.benefitText, { color: theme.textSecondary }]}>{benefit}</Text>
                          </View>
                        ))}
                      </View>
                      
                      <View style={styles.whenToUseContainer}>
                        <Text style={[styles.whenToUseTitle, { color: theme.text }]}>When to use:</Text>
                        <Text style={[styles.whenToUseText, { color: theme.textSecondary }]}>{practice.whenToUse}</Text>
                      </View>
                    </View>
                  ))}
                  
                  <View style={[styles.tipsContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.tipsTitle, { color: theme.text }]}>General Tips</Text>
                    {PRACTICES_GUIDE.tips.map((tip, index) => (
                      <View key={index} style={styles.tipItem}>
                        <Ionicons name="bulb-outline" size={16} color={theme.accent} />
                        <Text style={[styles.tipText, { color: theme.textSecondary }]}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 14 : 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  quote: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
    opacity: 0.8,
  },
  helpButton: {
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  modesContainer: {
    marginTop: 24,
    marginBottom: 20,
  },
  modesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modeButton: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  modeButtonActive: {
  },
  modeButtonText: {
    fontWeight: "600",
    fontSize: 15,
  },
  modeButtonTextActive: {
  },
  modeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  modeDesc: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  modeBenefit: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  timerContainer: {
    marginBottom: 24,
  },
  timerRow: {
    flexDirection: "row",
    gap: 8,
  },
  timerButton: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  timerButtonActive: {
  },
  timerButtonText: {
    fontWeight: "600",
    fontSize: 15,
  },
  timerButtonTextActive: {
  },
  timerDisplay: {
    alignItems: "center",
    marginBottom: 32,
  },
  timerBig: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: 2,
  },
  breathingContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  breathCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  breathText: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 1,
  },
  boxGuideRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  boxGuideStep: {
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  boxGuideStepActive: {
  },
  boxGuideText: {
    fontWeight: "600",
    fontSize: 14,
  },
  boxGuideTextActive: {
  },
  playButton: {
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    alignSelf: "center",
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    borderRadius: 24,
    padding: 0,
    minWidth: 320,
    maxWidth: 380,
    maxHeight: "80%",
    elevation: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    zIndex: 1001,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    padding: 24,
  },
  practiceCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  practiceName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  practiceDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  benefitsContainer: {
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 14,
    marginLeft: 8,
  },
  whenToUseContainer: {
    marginBottom: 8,
  },
  whenToUseTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  whenToUseText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipsContainer: {
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
