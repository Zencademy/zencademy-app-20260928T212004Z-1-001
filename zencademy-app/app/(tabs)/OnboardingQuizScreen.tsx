import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";
import { useTheme } from "../../components/ThemeContext";
import { useXP } from "../../components/XPContext";

// --- QUIZ DATA ---
const FUN_FACTS = [
  [
    "Solving puzzles can boost your IQ by up to 10 points.",
    "People who enjoy games tend to adapt faster in life.",
    "Your brain loves patterns—it's why you notice shapes in clouds!"
  ],
  [
    "Learning in steps improves retention.",
    "Recall and repetition are secrets to long-term memory.",
    "Trying new things keeps your mind young and flexible."
  ],
  [
    "Strategic thinkers excel in both business and sports.",
    "Creativity is linked to happiness—draw, write, invent!",
    "Quick decisions are powered by your 'fight or flight' brain zone."
  ],
  [
    "Coming up with new ideas wires new neural paths!",
    "Speed challenges increase dopamine, the motivation chemical.",
    "Memory champions use visual techniques for recall."
  ],
  [
    "Collaboration increases innovation by 50%.",
    "A clear plan can boost team performance by 30%.",
    "Brainstorming triggers more creative ideas."
  ],
  [
    "Puzzle lovers have denser connections in the brain.",
    "Strategy games build patience and planning.",
    "Creative hobbies lower stress and improve mood."
  ],
  [
    "Staying calm under pressure is a hallmark of high achievers.",
    "The brain can adapt to stress—practice makes perfect.",
    "Big picture thinking is a sign of high intelligence."
  ],
  [
    "Math trains your problem-solving circuits.",
    "Art and music improve emotional intelligence.",
    "Language learning builds a more flexible brain."
  ]
];

const QUESTIONS = [
  {
    q: "What energizes your mind the most?",
    options: [
      { text: "Solving tough puzzles", type: "Logic Guru" },
      { text: "Memorizing details easily", type: "Memory Master" },
      { text: "Reacting instantly in games", type: "Quick Reactor" },
      { text: "Spotting hidden connections", type: "Pattern Pro" },
    ],
  },
  {
    q: "How do you approach learning something new?",
    options: [
      { text: "Break it down step by step", type: "Logic Guru" },
      { text: "Recall similar situations", type: "Memory Master" },
      { text: "Jump right in and adapt", type: "Quick Reactor" },
      { text: "Find patterns or visuals", type: "Pattern Pro" },
    ],
  },
  {
    q: "Your friends describe you as...",
    options: [
      { text: "The strategist", type: "Strategic Thinker" },
      { text: "The creative", type: "Creative Visionary" },
      { text: "The resilient one", type: "Resilient Optimizer" },
      { text: "The one with amazing memory", type: "Memory Master" },
    ],
  },
  {
    q: "You feel proudest when you...",
    options: [
      { text: "Solve something nobody else could", type: "Logic Guru" },
      { text: "Recall facts no one else remembers", type: "Memory Master" },
      { text: "Win a fast challenge", type: "Quick Reactor" },
      { text: "Come up with new ideas", type: "Creative Visionary" },
    ],
  },
  {
    q: "In a team project, you usually...",
    options: [
      { text: "Create a clear plan", type: "Strategic Thinker" },
      { text: "Connect people & motivate", type: "Social Connector" },
      { text: "Keep everyone on task", type: "Focus Champion" },
      { text: "Remember all the details", type: "Memory Master" },
    ],
  },
  {
    q: "Your favorite activity is...",
    options: [
      { text: "Strategy games", type: "Strategic Thinker" },
      { text: "Puzzles or brain teasers", type: "Logic Guru" },
      { text: "Drawing, music or writing", type: "Visualizer" },
      { text: "Speed challenges", type: "Quick Reactor" },
    ],
  },
  {
    q: "What do you do when faced with a tough challenge?",
    options: [
      { text: "Stay calm & analyze", type: "Logic Guru" },
      { text: "Remember how I solved similar things", type: "Memory Master" },
      { text: "Act quickly, trust my instincts", type: "Quick Reactor" },
      { text: "Try to see the big picture", type: "Pattern Pro" },
    ],
  },
  {
    q: "Which school subject did you love most?",
    options: [
      { text: "Math or Physics", type: "Logic Guru" },
      { text: "Art or Music", type: "Creative Visionary" },
      { text: "History or Languages", type: "Memory Master" },
      { text: "Sports", type: "Quick Reactor" },
    ],
  },
];

const STATS_PER_QUESTION = [
  [35, 22, 23, 20],
  [28, 29, 21, 22],
  [24, 27, 22, 27],
  [26, 28, 21, 25],
  [23, 28, 29, 20],
  [27, 31, 22, 20],
  [30, 27, 22, 21],
  [25, 30, 23, 22],
];

const BRAIN_TYPE_DESC = {
  "Logic Guru": "You see life as a giant puzzle — and you love solving it.",
  "Memory Master": "Your mind is a vault. Names, facts, stories—nothing escapes you.",
  "Quick Reactor": "You're always ready for action. Speed and agility are your mental superpowers.",
  "Pattern Pro": "You spot patterns and connections others miss. Nothing is random to you.",
  "Focus Champion": "Nothing breaks your concentration. You can work for hours on end.",
  "Strategic Thinker": "You think three steps ahead and always have a plan.",
  "Creative Visionary": "You see what others can't. Your creativity makes you stand out.",
  "Resilient Optimizer": "You bounce back fast, learn from setbacks, and keep improving.",
  "Social Connector": "You energize teams, build trust, and help people work better together.",
  "Visualizer": "You think in images and stories—turning ideas into clear mental pictures.",
};

const GRADIENTS = {
  "Logic Guru": ["#80ffea", "#00b4d8"],
  "Memory Master": ["#f9d423", "#ff4e50"],
  "Quick Reactor": ["#f7971e", "#ffd200"],
  "Pattern Pro": ["#a18cd1", "#fbc2eb"],
  "Focus Champion": ["#43cea2", "#185a9d"],
  "Strategic Thinker": ["#f7971e", "#ffd200"],
  "Creative Visionary": ["#fc5c7d", "#6a82fb"],
  "Resilient Optimizer": ["#2bc0e4", "#eaecc6"],
  "Social Connector": ["#56ab2f", "#a8e063"],
  "Visualizer": ["#bdc3c7", "#2c3e50"],
};

const black = "#131313", white = "#fafbfc", accent = "#111";
const SCREEN_WIDTH = Dimensions.get("window").width;

// Simple wrapper without animations
type FadeInProps = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: any;
};
function FadeIn({ children, delay = 0, duration = 300, style }: FadeInProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
  
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  return (
    <Animated.View 
      style={[
        style, 
        { 
          opacity: fadeAnim, 
          transform: [{ scale: scaleAnim }] 
        }
      ]}
    >
      {children}
    </Animated.View>
  );
}

// ------------ MODIFICARE: acceptă onFinish ca prop ------------
type OnboardingQuizScreenProps = {
  onFinish: () => void;
};
export default function OnboardingQuizScreen({ onFinish }: OnboardingQuizScreenProps) {
  const { name: existingName, setName, setBrainType, setOnboardingChecked } = useXP();

  // Start with story screen
  const [screen, setScreen] = useState("story");
  // Use existing name or default
  const userName = existingName || "Champion";

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  type ResultType = {
    type: keyof typeof BRAIN_TYPE_DESC;
    desc: string;
    name: string;
  } | null;
  const [result, setResult] = useState<ResultType>(null);
  const [statIdx, setStatIdx] = useState<number>(0);
  const [answerIdx, setAnswerIdx] = useState<number | null>(null);
  const [funFact, setFunFact] = useState("");
  const [confetti1, setConfetti1] = useState(false);
  const [confetti2, setConfetti2] = useState(false);
  const [confetti3, setConfetti3] = useState(false);

  // Progress bar - simple calculation without animation
  const progress = step > 0 ? step / QUESTIONS.length : 0;

  // Set fun fact when stats screen appears
  React.useEffect(() => {
    if (screen === "stats") {
      const factList = FUN_FACTS[step];
      setFunFact(factList[Math.floor(Math.random() * factList.length)]);
      setStatsCardKey(prev => prev + 1);
    }
  }, [screen, statIdx, step]);

  // Confetti în 3 valuri!
  React.useEffect(() => {
    if (screen === "result" && result) {
      setConfetti1(false); setConfetti2(false); setConfetti3(false);
      const t1 = setTimeout(() => setConfetti1(true), 300);
      const t2 = setTimeout(() => setConfetti2(true), 1200);
      const t3 = setTimeout(() => setConfetti3(true), 2100);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [screen, result]);

  // Reset component state when it mounts (for reopening onboarding)
  React.useEffect(() => {
    // Reset all state when component mounts
    setScreen("story");
    setStep(0);
    setAnswers([]);
    setResult(null);
    setStatIdx(0);
    setAnswerIdx(null);
    setFunFact("");
    setConfetti1(false);
    setConfetti2(false);
    setConfetti3(false);
    setStoryIdx(0);
    setStoryAnimDone(false);
    setStoryTextComplete(false);
    setQuizCardKey(0);
    setStatsCardKey(0);
    // Note: Animated values are already initialized to 0 in useRef
    // They will be reset naturally when animations restart
  }, []);

  // Epic motivational messages
  const EPIC_MESSAGES = [
    "In a world of infinite possibilities, your mind is the ultimate frontier. Every thought you nurture shapes your reality.",
    "The journey of a thousand achievements begins with a single decision. Today, you choose to unlock your true potential."
  ];
  const [storyIdx, setStoryIdx] = useState(0);
  const [storyAnimDone, setStoryAnimDone] = useState(false);
  const [storyTextComplete, setStoryTextComplete] = useState(false);
  
  // Static gradient for logo (no animation)

  // Finalizează quiz-ul
  const finishQuiz = async (finalAnswers: any[], userName: string) => {
    const tally: { [key: string]: number } = {};
    for (const a of finalAnswers) tally[a] = (tally[a] || 0) + 1;
    let best = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    const topTypes = best.filter(t => t[1] === best[0][1]).map(t => t[0]);
    const type = topTypes[Math.floor(Math.random() * topTypes.length)];
    setResult({ type: type as keyof typeof BRAIN_TYPE_DESC, desc: BRAIN_TYPE_DESC[type as keyof typeof BRAIN_TYPE_DESC], name: userName });
    setName(userName);
    // Save brain type and mark onboarding as completed
    await setBrainType(type);
    await setOnboardingChecked(true);
    setScreen("result");
  };

  // Simple text display without animations
  type StoryLetterFadeProps = { 
    text: string; 
    onDone: () => void; 
    color?: string; 
    fontFamily?: string; 
    fontSize?: number;
    instant?: boolean; // If true, show text instantly
    onComplete?: () => void; // Called when text is fully displayed
  };
  function StoryLetterFade({ text, onDone, color = '#111', fontFamily = 'SpaceMono-Regular', fontSize = 38, instant = false, onComplete }: StoryLetterFadeProps) {
    useEffect(() => {
      // Call onComplete immediately
      if (onComplete) {
        onComplete();
      }
      // Call onDone after a short delay
      const timer = setTimeout(() => {
        onDone();
      }, 100);
      return () => clearTimeout(timer);
    }, [text]);
    
    return (
      <Text style={{ color, fontFamily, fontSize, fontWeight: 'bold', textAlign: 'center', alignSelf: 'center', marginBottom: 38, letterSpacing: 2.5, lineHeight: fontSize * 1.4, paddingHorizontal: 24, textTransform: 'none', width: '100%' }}>
        {text}
      </Text>
    );
  }

  
  // Get theme for dark mode
  const { theme } = useTheme();
  
  // Handle exit from onboarding
  const handleExitOnboarding = async () => {
    // Mark onboarding as completed
    await setOnboardingChecked(true);
    // Call onFinish callback if provided
    if (onFinish) {
      onFinish();
    }
    // Navigate to main app
    router.replace('/(tabs)');
  };

  // Dark purple theme colors for onboarding
  const onboardingBg = '#0a0a0f';
  const onboardingText = '#ffffff';
  const onboardingTextSecondary = '#b8a0d9';
  
  // Static gradient for logo

  // Animation values for smooth transitions - use simple fade animations
  const [quizCardKey, setQuizCardKey] = useState(0);
  const [statsCardKey, setStatsCardKey] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: onboardingBg }}>
      
      {/* Cinematic story screen 1 */}
      {screen === "story" && storyIdx === 0 && (
        <SafeAreaView style={{ flex: 1, backgroundColor: onboardingBg, justifyContent: 'center', alignItems: 'center', padding: 0 }}>
          {/* Professional header with logo and exit button */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
            <SafeAreaView>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 }}>
                <Pressable
                  onPress={handleExitOnboarding}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  hitSlop={10}
                >
                  <Ionicons name="close" size={18} color={onboardingText} />
                </Pressable>
                <MaskedView
                  maskElement={
                    <Text style={{ fontSize: 24, fontWeight: '900', letterSpacing: 3, fontFamily: 'SpaceMono-Regular', textAlign: 'center' }}>
                      ZENCADEMY
                    </Text>
                  }
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#A78BFA', '#C084FC', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ paddingVertical: 8 }}
                  >
                    <Text style={{ fontSize: 24, fontWeight: '900', letterSpacing: 3, fontFamily: 'SpaceMono-Regular', textAlign: 'center', opacity: 0 }}>
                      ZENCADEMY
                    </Text>
                  </LinearGradient>
                </MaskedView>
                <View style={{ width: 32 }} />
              </View>
            </SafeAreaView>
          </View>
          
          {/* Tap to skip indicator */}
          <View style={{ position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
            <Text style={{ color: onboardingTextSecondary, fontSize: 14, fontWeight: '600', letterSpacing: 1, fontFamily: 'SpaceMono-Regular', opacity: 0.6 }}>
              {storyTextComplete ? 'Tap to continue' : 'Tap to reveal text'}
            </Text>
          </View>
          
          {/* Tap anywhere */}
          <Pressable
            onPress={() => {
              if (!storyTextComplete) {
                // First tap: complete text instantly
                setStoryTextComplete(true);
                // Force complete all letters
                const allLetters = EPIC_MESSAGES[0].split('');
                // This will be handled by setting instant prop
              } else {
                // Second tap: go to next screen
                setScreen("ready");
              }
            }}
            style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingHorizontal: 24 }}>
              <StoryLetterFade
                key={`story-${storyIdx}-${storyTextComplete}`}
                text={EPIC_MESSAGES[0]}
                onDone={() => {
                  if (!storyTextComplete) {
                    setStoryTextComplete(true);
                  }
                }}
                onComplete={() => setStoryTextComplete(true)}
                color={onboardingText}
                fontFamily="SpaceMono-Regular"
                fontSize={36}
                instant={storyTextComplete}
              />
            </View>
          </Pressable>
        </SafeAreaView>
      )}

      {/* Cinematic story screen 2 (ready) */}
      {screen === "ready" && (
        <SafeAreaView style={{ flex: 1, backgroundColor: onboardingBg, justifyContent: 'center', alignItems: 'center', padding: 0 }}>
          {/* Professional header with logo and exit button */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
            <SafeAreaView>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 }}>
                <Pressable
                  onPress={handleExitOnboarding}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  hitSlop={10}
                >
                  <Ionicons name="close" size={18} color={onboardingText} />
                </Pressable>
                <MaskedView
                  maskElement={
                    <Text style={{ fontSize: 24, fontWeight: '900', letterSpacing: 3, fontFamily: 'SpaceMono-Regular', textAlign: 'center' }}>
                      ZENCADEMY
                    </Text>
                  }
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#A78BFA', '#C084FC', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ paddingVertical: 8 }}
                  >
                    <Text style={{ fontSize: 24, fontWeight: '900', letterSpacing: 3, fontFamily: 'SpaceMono-Regular', textAlign: 'center', opacity: 0 }}>
                      ZENCADEMY
                    </Text>
                  </LinearGradient>
                </MaskedView>
                <View style={{ width: 32 }} />
              </View>
            </SafeAreaView>
          </View>
          
          {/* Main content - no tap to skip */}
          <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <Text style={{ fontFamily: 'SpaceMono-Regular', fontSize: 36, textAlign: 'center', lineHeight: 48 }}>
                <Text style={{ color: onboardingTextSecondary }}>Are you </Text>
                <Text style={{ color: '#A78BFA', fontWeight: '900' }}>READY</Text>
                <Text style={{ color: onboardingTextSecondary }}> to unlock your true potential?</Text>
              </Text>
            </View>
            <FadeIn delay={0}>
              <TouchableOpacity
                onPress={() => setScreen("quiz")}
                style={{
                  backgroundColor: '#8B5CF6',
                  borderRadius: 22,
                  paddingVertical: 13,
                  paddingHorizontal: 48,
                  alignSelf: 'center',
                  marginTop: 30,
                  shadowColor: '#8B5CF6',
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 4,
                  zIndex: 2,
                }}
              >
                <Text style={{ color: onboardingText, fontWeight: '900', fontSize: 22, letterSpacing: 2, fontFamily: 'SpaceMono-Regular' }}>YES</Text>
              </TouchableOpacity>
            </FadeIn>
          </View>
        </SafeAreaView>
      )}


      {/* PAGE: QUIZ */}
      {screen === "quiz" && (
        <SafeAreaView style={{ flex: 1, backgroundColor: onboardingBg }}>
          <View style={{ width: '100%', alignItems: 'center', marginTop: 20, marginBottom: 0 }}>
            <View style={[styles.progressBarWrap, { backgroundColor: '#1a1a2e' }]}>
              <View
                style={[
                  styles.progressBarFill,
                  { 
                    width: `${progress * 100}%`,
                    backgroundColor: '#8B5CF6'
                  }
                ]}
              />
            </View>
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingHorizontal: 20 }}>
            <FadeIn key={`quiz-card-${quizCardKey}`} delay={0} duration={400}>
              <View
                style={[
                  styles.quizCard,
                  {
                    backgroundColor: '#1a1a2e',
                    borderColor: '#8B5CF6',
                    borderWidth: 2,
                  }
                ]}
              >
                <FadeIn delay={0}>
                  <Text style={[styles.questionNo, { fontFamily: 'SpaceMono-Regular', color: onboardingTextSecondary }]}>
                    Question {step + 1} of {QUESTIONS.length}
                  </Text>
                </FadeIn>
                <FadeIn delay={110}>
                  <Text style={[styles.questionText, { fontFamily: 'SpaceMono-Regular', color: onboardingText }]}>
                    {QUESTIONS[step].q}
                  </Text>
                </FadeIn>
                {QUESTIONS[step].options.map((o, i) => (
                  <FadeIn key={i} delay={220 + i * 70}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.optionBtn,
                        {
                          backgroundColor: answerIdx === i ? '#8B5CF6' : '#0f0f1a',
                          borderColor: answerIdx === i ? '#A78BFA' : '#2a2a3e',
                          borderWidth: answerIdx === i ? 2 : 1.5,
                          shadowColor: answerIdx === i ? '#8B5CF6' : 'transparent',
                          shadowOpacity: answerIdx === i ? 0.5 : 0,
                          shadowRadius: answerIdx === i ? 10 : 0,
                          elevation: answerIdx === i ? 8 : 2,
                          transform: [{ scale: pressed ? 0.98 : 1 }]
                        }
                      ]}
                      onPress={() => {
                        setAnswerIdx(i);
                        setStatIdx(i);
                        setScreen("stats");
                      }}
                    >
                      <Text style={[
                        styles.optionText,
                        { 
                          fontFamily: 'SpaceMono-Regular',
                          color: answerIdx === i ? onboardingText : onboardingTextSecondary
                        }
                      ]}>
                        {o.text}
                      </Text>
                    </Pressable>
                  </FadeIn>
                ))}
              </View>
            </FadeIn>
          </View>
        </SafeAreaView>
      )}

      {/* PAGE: STATS */}
      {screen === "stats" && (
        <SafeAreaView style={{ flex: 1, backgroundColor: onboardingBg, justifyContent: 'center', alignItems: 'center' }}>
          <FadeIn key={`stats-card-${statsCardKey}`} delay={0} duration={400}>
            <View 
              style={[
                styles.statsCard, 
                { 
                  backgroundColor: '#1a1a2e',
                  borderColor: '#8B5CF6',
                  borderWidth: 2,
                  justifyContent: 'center', 
                  alignItems: 'center',
                }
              ]}
            > 
              <FadeIn delay={0}>
                <Text style={{ fontSize: 21, fontWeight: "900", textAlign: "center", marginBottom: 9, fontFamily: 'SpaceMono-Regular', color: onboardingText }}>
                  {QUESTIONS[step].options[statIdx].text}
                </Text>
              </FadeIn>
              <FadeIn delay={80}>
                <Text style={{ fontSize: 17, textAlign: "center", marginBottom: 9, fontFamily: 'SpaceMono-Regular', color: onboardingTextSecondary }}>
                  <Text style={{ fontWeight: "700", color: "#A78BFA" }}>
                    {STATS_PER_QUESTION[step][statIdx]}%
                  </Text> of users chose this!
                </Text>
              </FadeIn>
              <View style={{ flexDirection: "column", width: "100%", marginBottom: 14, alignItems: 'center', justifyContent: 'center' }}>
                {QUESTIONS[step].options.map((op, opi) => {
                  const barWidth = `${STATS_PER_QUESTION[step][opi]}%`;
                  
                  return (
                    <FadeIn key={opi} delay={130 + opi * 60}>
                      <View style={{
                        flexDirection: "row", 
                        alignItems: "center", 
                        marginVertical: 4, 
                        justifyContent: 'center', 
                        alignSelf: 'center',
                        width: '100%',
                        maxWidth: 300
                      }}>
                        <View style={{
                          flex: 1,
                          height: 10,
                          backgroundColor: '#0f0f1a',
                          borderRadius: 5,
                          marginRight: 10,
                          overflow: 'hidden'
                        }}>
                          <View
                            style={{
                              height: '100%',
                              width: barWidth,
                              backgroundColor: opi === statIdx ? '#8B5CF6' : '#2a2a3e',
                              borderRadius: 5,
                            }}
                          />
                        </View>
                        <Text style={{
                          fontSize: 14,
                          color: opi === statIdx ? '#A78BFA' : onboardingTextSecondary,
                          fontWeight: opi === statIdx ? "800" : "500",
                          fontFamily: 'SpaceMono-Regular',
                          minWidth: 45
                        }}>
                          {STATS_PER_QUESTION[step][opi]}%
                        </Text>
                      </View>
                    </FadeIn>
                  );
                })}
              </View>
              {!!funFact && (
                <FadeIn delay={360}>
                  <View style={{ marginBottom: 10, backgroundColor: '#0f0f1a', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#2a2a3e' }}>
                    <Text style={[styles.funFactLabel, { fontFamily: 'SpaceMono-Regular', color: '#A78BFA' }]}>Fun fact</Text>
                    <Text style={[styles.funFact, { fontFamily: 'SpaceMono-Regular', color: onboardingTextSecondary }]}>{funFact}</Text>
                  </View>
                </FadeIn>
              )}
              <FadeIn delay={500}>
                <Pressable
                  style={({ pressed }) => [
                    {
                      backgroundColor: '#8B5CF6',
                      paddingHorizontal: 32,
                      paddingVertical: 14,
                      borderRadius: 14,
                      shadowColor: '#8B5CF6',
                      shadowOpacity: 0.4,
                      shadowRadius: 10,
                      elevation: 8,
                      transform: [{ scale: pressed ? 0.95 : 1 }]
                    }
                  ]}
                  onPress={() => {
                    const nextAnswers = [...answers, QUESTIONS[step].options[statIdx].type];
                    setAnswers(nextAnswers);
                    setAnswerIdx(null);
                  if (step + 1 === QUESTIONS.length) {
                    finishQuiz(nextAnswers, userName);
                  } else {
                      setStep(step + 1);
                      setQuizCardKey(prev => prev + 1);
                      setScreen("quiz");
                    }
                  }}
                >
                  <Text style={{ color: onboardingText, fontWeight: "700", fontSize: 16, fontFamily: 'SpaceMono-Regular' }}>
                    {step + 1 === QUESTIONS.length ? 'See Results' : 'Next'}
                  </Text>
                </Pressable>
              </FadeIn>
            </View>
          </FadeIn>
        </SafeAreaView>
      )}

      {/* PAGE: RESULT */}
      {screen === "result" && result && (
        <SafeAreaView style={{ flex: 1, backgroundColor: onboardingBg, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            {confetti1 && (
              <ConfettiCannon
                count={90}
                origin={{ x: SCREEN_WIDTH * 0.5, y: 0 }}
                fallSpeed={2800}
                explosionSpeed={480}
                fadeOut={true}
                autoStart={true}
              />
            )}
            {confetti2 && (
              <ConfettiCannon
                count={120}
                origin={{ x: 30, y: 30 }}
                fallSpeed={3200}
                explosionSpeed={620}
                fadeOut={true}
                autoStart={true}
              />
            )}
            {confetti3 && (
              <ConfettiCannon
                count={150}
                origin={{ x: SCREEN_WIDTH - 30, y: 0 }}
                fallSpeed={3500}
                explosionSpeed={730}
                fadeOut={true}
                autoStart={true}
              />
            )}
            <FadeIn delay={70}>
              <MaskedView
                maskElement={
                  <Text style={[styles.finalTitle, { fontFamily: 'SpaceMono-Regular', textAlign: 'center' }]}>
                    {result.name}
                  </Text>
                }
              >
                <LinearGradient
                  colors={["#0b63ce", "#33e3ff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[styles.finalTitle, { opacity: 0, fontFamily: 'SpaceMono-Regular', textAlign: 'center' }]}>{result.name}</Text>
                </LinearGradient>
              </MaskedView>
            </FadeIn>
            <FadeIn delay={340}>
              <MaskedView
                maskElement={
                  <Text style={[styles.brainTypeText, { fontFamily: 'SpaceMono-Regular', textAlign: 'center' }]}>{result.type}</Text>
                }
              >
                <LinearGradient
                  colors={GRADIENTS[result.type] as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[styles.brainTypeText, { opacity: 0, fontFamily: 'SpaceMono-Regular', textAlign: 'center' }]}>{result.type}</Text>
                </LinearGradient>
              </MaskedView>
            </FadeIn>
            <FadeIn delay={700}>
              <Text style={[styles.finalDesc, { fontFamily: 'SpaceMono-Regular', textAlign: 'center', color: onboardingText }]}>
                {result.desc}
              </Text>
            </FadeIn>
            <FadeIn delay={970}>
              <Text style={[styles.finalMotiv, { fontFamily: 'SpaceMono-Regular', textAlign: 'center', color: onboardingTextSecondary }]}>
                The best investment you'll ever make is in yourself.
                <Text style={{ fontWeight: "bold", color: "#A78BFA", fontFamily: 'SpaceMono-Regular' }}> Your brain, your superpower!</Text>
              </Text>
            </FadeIn>
            <FadeIn delay={1230}>
              <Pressable 
                style={({ pressed }) => [
                  {
                    backgroundColor: '#8B5CF6',
                    paddingHorizontal: 40,
                    paddingVertical: 16,
                    borderRadius: 18,
                    marginTop: 8,
                    shadowColor: '#8B5CF6',
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 8,
                    transform: [{ scale: pressed ? 0.95 : 1 }]
                  }
                ]} 
                onPress={() => {
                  if (onFinish) onFinish();
                  setTimeout(() => {
                    router.replace('/(tabs)');
                  }, 0);
                }}
              >
                <Text style={{ color: onboardingText, fontWeight: "700", fontSize: 18, fontFamily: 'SpaceMono-Regular', textAlign: 'center' }}>
                  Enter the App
                </Text>
              </Pressable>
            </FadeIn>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const safeStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fafbfc",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: "flex-start",
  }
});

const styles = StyleSheet.create({
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    minHeight: 60,
    paddingTop: 8,
    marginBottom: 2,
    backgroundColor: "#fafbfc",
    zIndex: 22,
  },
  exitBtn: {
    marginLeft: -8,
    marginTop: 0,
    backgroundColor: "#f8f8fa",
    borderRadius: 25,
    padding: 7,
    shadowColor: "#aaa", shadowOpacity: 0.09, shadowRadius: 6, elevation: 5,
  },
  nameScreenWrap: {
    paddingTop: 42,
    flex: 1,
    alignItems: "center",
  },
  quizTitle: { fontSize: 30, fontWeight: "900", marginBottom: 10, color: "#131313", letterSpacing: 0.8, textAlign: "center" },
  quizDesc: { fontSize: 18, color: "#232323", marginBottom: 17, textAlign: "center", fontWeight: "600", opacity: 0.88 },
  nameInput: {
    backgroundColor: "#fff", borderRadius: 11, padding: 15, fontSize: 20,
    borderWidth: 1.5, borderColor: "#e3e3e3", width: 270, textAlign: "center", marginBottom: 13, color: "#222", fontWeight: "700"
  },
  startBtn: {
    backgroundColor: "#181818", paddingHorizontal: 32, paddingVertical: 16, borderRadius: 18,
    marginTop: 15, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 5, elevation: 2
  },
  progressBarWrap: {
    width: "92%", height: 11, backgroundColor: "#eaeaea", borderRadius: 7,
    alignSelf: "center", marginTop: 5, marginBottom: 13, overflow: "hidden"
  },
  progressBarFill: {
    height: 11, backgroundColor: "#181818", borderRadius: 7
  },
  statsCard: {
    width: "98%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    marginTop: 35,
    marginBottom: 22,
    shadowColor: "#111", shadowOpacity: 0.09, shadowRadius: 10, elevation: 3,
    alignItems: "center",
  },
  funFactLabel: {
    color: "#20a0fa",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 1,
    marginTop: 6,
  },
  funFact: {
    fontSize: 15,
    color: "#3b3b3b",
    textAlign: "center",
    fontWeight: "600",
    opacity: 0.87,
    marginBottom: 6,
  },
  quizCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 22, width: "100%", alignSelf: "center", padding: 26,
    marginTop: 0, alignItems: "center", shadowColor: "#181818", shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    marginBottom: 12, minHeight: 290, justifyContent: "flex-start"
  },
  questionNo: {
    color: "#bbb", fontSize: 16, marginBottom: 6, fontWeight: "700", letterSpacing: 0.9
  },
  questionText: {
    color: "#131313", fontSize: 22, textAlign: "center", fontWeight: "900", marginBottom: 18, letterSpacing: 0.11
  },
  optionBtn: {
    backgroundColor: "#fafbfc", borderRadius: 13, paddingVertical: 15, paddingHorizontal: 20, marginVertical: 7, width: "100%",
    alignItems: "center", borderWidth: 2.2, borderColor: "#ececec", shadowColor: "#181818", shadowOpacity: 0.06,
    shadowRadius: 8, elevation: 2, minHeight: 56, transitionDuration: "110ms"
  },
  optionText: {
    fontSize: 18, color: "#181818", textAlign: "center", fontWeight: "700", letterSpacing: 0.1
  },
  finalWrap: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 18,
    paddingTop: 60,
  },
  finalTitle: {
    fontSize: 38,
    fontWeight: "900",
    marginBottom: 7,
    textAlign: "center",
    letterSpacing: 1.4
  },
  brainTypeText: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 7,
    marginTop: 2,
    textAlign: "center",
    textTransform: "uppercase",
  },
  finalDesc: {
    fontSize: 22,
    color: "#181818",
    textAlign: "center",
    marginBottom: 17,
    marginTop: 11,
    fontWeight: "700",
    opacity: 0.88
  },
  finalMotiv: {
    fontSize: 18,
    color: "#333",
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
    opacity: 0.92
  },
});
