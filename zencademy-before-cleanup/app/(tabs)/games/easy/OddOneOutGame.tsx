import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ConfettiCannon from 'react-native-confetti-cannon';
import GameHeader from '../../../../components/GameHeader';
import { useTheme } from '../../../../components/ThemeContext';
import { useXP } from '../../../../components/XPContext';

// Dynamic pools for randomized questions (monochrome uppercase)
const POOLS: Record<string, string[]> = {
  ANIMALS: ["DOG", "CAT", "RABBIT", "LION", "TIGER", "BEAR", "FOX", "ZEBRA", "MONKEY"],
  FRUITS: ["APPLE", "PEAR", "PEACH", "GRAPE", "PLUM", "MANGO", "ORANGE", "BANANA"],
  SHAPES: ["CIRCLE", "SQUARE", "TRIANGLE", "DIAMOND", "HEXAGON"],
  COLORS: ["RED", "BLUE", "GREEN", "BLACK", "WHITE", "GRAY"],
  VEHICLES: ["CAR", "BUS", "TRAIN", "BOAT", "PLANE", "BIKE"],
  CITIES: ["PARIS", "LONDON", "BERLIN", "MADRID", "ROME"],
  TOOLS: ["HAMMER", "WRENCH", "SCREWDRIVER", "PLIERS"],
  METALS: ["GOLD", "SILVER", "BRONZE", "IRON"],
  FURNITURE: ["TABLE", "CHAIR", "SOFA", "DESK"],
  CLOTHES: ["SHIRT", "PANTS", "COAT", "HAT"],
};

const XP_PER_CORRECT = 5; // easy games: +5 points per correct answer
const XP_REWARD = 25; // Bonus for completing the game
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

const ALL_WORDS: string[] = Object.values(POOLS).flat();

function generateOddOneOutQuestion() {
  // Simplified, easy-to-understand rule: category only
  const SIMPLE_CATS = ['ANIMALS', 'FRUITS', 'SHAPES', 'COLORS', 'VEHICLES', 'FURNITURE', 'CLOTHES'];
  const categories = SIMPLE_CATS;
  const mainIdx = Math.floor(Math.random() * categories.length);
  let oddIdx = Math.floor(Math.random() * categories.length);
  if (oddIdx === mainIdx) oddIdx = (oddIdx + 1) % categories.length;
  const mainCat = categories[mainIdx];
  const oddCat = categories[oddIdx];
  const mainItems = pickN(POOLS[mainCat], 3);
  const oddItem = pickN(POOLS[oddCat], 1)[0];
  const items = shuffleArray([...mainItems, oddItem]);
  return {
    _id: Date.now(),
    items,
    answer: oddItem,
    explanation: `${oddCat} vs ${mainCat}`,
  };
}

const STREAK_TO_WIN = 5;
const MAX_XP = 15;
const FULL_WIDTH = Dimensions.get('window').width;

function getRandomQuestion() {
  return generateOddOneOutQuestion();
}

type OddQ = { _id: number; items: string[]; answer: string; explanation: string } | null;
export default function OddOneOutGame() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addXp } = useXP();
  const { theme } = useTheme();

  const [currentQ, setCurrentQ] = useState<OddQ>(null);
  const [usedIds, setUsedIds] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [choiceOrder, setChoiceOrder] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selected, setSelected] = useState(-1);
  const [win, setWin] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const difficulty = 'easy';
  const [showWin, setShowWin] = useState(false);
  useFocusEffect(React.useCallback(() => {
    startGame();
    return () => {};
  }, []));

  const greenBg = useRef(new Animated.Value(0)).current;
  const correctAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const correctScale = useRef(new Animated.Value(1)).current;

  useEffect(() => { startGame(); }, []);

  // Ensure random option order every time a new question is set
  useEffect(() => {
    if (currentQ) {
      setChoiceOrder(shuffleArray(currentQ.items));
    }
  }, [currentQ]);

  function startGame() {
    const q = getRandomQuestion();
    setCurrentQ(q);
    setUsedIds(q ? [q._id] : ([] as number[]));
    setStreak(0);
    setWrong(false);
    setShowExplanation(false);
    setShowConfetti(false);
    setXpAwarded(false);
    setIsAnimating(false);
    setSelected(-1);
    setWin(false);
    setChoiceOrder(q ? shuffleArray(q.items) : []);
    Animated.timing(cardAnim, { toValue: 1, duration: 0, useNativeDriver: true }).start();
  }

  function nextQuestion() {
    const q = getRandomQuestion();
    setCurrentQ(q);
    setUsedIds((prev: number[]) => ([...prev, q._id] as number[]));
    setChoiceOrder(shuffleArray(q.items));
    setSelected(-1);
    setShowExplanation(false);
    setWrong(false);
    setIsAnimating(false);
    Animated.timing(cardAnim, { toValue: 0, duration: 0, useNativeDriver: true }).start(() => {
      Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, friction: 7, tension: 85 }).start();
    });
  }

  function handleAnswer(choice: string, i: number) {
    if (isAnimating) return;
    setSelected(i);
    if (currentQ && choice === currentQ.answer) {
      setIsAnimating(true);
      Animated.sequence([
        Animated.timing(correctScale, { toValue: 1.08, duration: 110, useNativeDriver: true }),
        Animated.timing(correctScale, { toValue: 1, duration: 160, useNativeDriver: true })
      ]).start();
      Animated.sequence([
        Animated.timing(greenBg, { toValue: 1, duration: 120, useNativeDriver: false }),
        Animated.timing(greenBg, { toValue: 0, duration: 440, useNativeDriver: false }),
      ]).start();
      Animated.sequence([
        Animated.spring(cardAnim, { toValue: 1.06, useNativeDriver: true, friction: 5 }),
        Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, friction: 7 })
      ]).start();
      setTimeout(() => {
        setIsAnimating(false);
        setSelected(-1);
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak >= STREAK_TO_WIN) {
          setWin(true);
          setShowExplanation(false);
          setShowWin(true);
        } else {
          setShowExplanation(false);
          // advance to a new randomized question
          nextQuestion();
        }
      }, 600);
    } else {
      setWrong(true);
      setStreak(0);
    }
  }

  const xpThisGame = win ? MAX_XP : 0;

  useEffect(() => {
    if (win && xpThisGame > 0 && !xpAwarded) {
      addXp(xpThisGame);
      setShowConfetti(true);
      setXpAwarded(true);
    }
  }, [win, xpThisGame, xpAwarded]);

  if (!currentQ || !choiceOrder.length) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  if (wrong && currentQ) {
    const question = currentQ;
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}> 
        <GameHeader
          onBack={() => router.replace('/(tabs)/games/LogicTrainingScreen')}
          gameTitle="Odd One Out Easy"
          gameDescription="Test your pattern recognition by finding the item that doesn't belong."
          gameInstructions="Look at the items and find the one that doesn't belong with the others. Each correct answer gives you +5 points!"
        />
        <View style={[styles.gameContent, { justifyContent: "center" }]}>
          <Text style={[styles.bigText, { color: theme.error, fontSize: 34 }]}>Wrong!</Text>
          <Text style={[styles.explanationWrong, { color: theme.textSecondary }]}>
            The correct answer was:{"\n"}
            <Text style={{ fontWeight: "bold", color: theme.text }}>
              {question.answer}
            </Text>
          </Text>
          <Text style={[styles.explanationWrong2, { color: theme.textSecondary }]}>{question.explanation}</Text>
          <TouchableOpacity style={[styles.tryAgainBtn, { backgroundColor: theme.primary }]} onPress={startGame}>
            <Text style={[styles.tryAgainBtnText, { color: theme.buttonText }]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Win modal (popup)
  const WinModal = (
    <Modal visible={showWin} transparent animationType="fade" onRequestClose={() => setShowWin(false)}>
      <View style={{ flex:1, backgroundColor: theme.overlay, alignItems:'center', justifyContent:'center' }}>
        <View style={{ backgroundColor: theme.card, padding:18, borderRadius:14, width:'86%', alignItems:'center' }}>
          <ConfettiCannon count={140} origin={{ x: FULL_WIDTH / 2, y: 0 }} fadeOut autoStart explosionSpeed={420} fallSpeed={2100} />
          <Text style={[styles.bigText, { color: theme.text, fontSize: 30, marginBottom: 12 }]}>Congratulations!</Text>
          <Text style={{ color: theme.text, fontSize:16, marginBottom:12, textAlign:'center' }}>Streak: {STREAK_TO_WIN} correct • +{MAX_XP} XP</Text>
          <TouchableOpacity style={[styles.tryAgainBtn, { backgroundColor: theme.primary }]} onPress={() => { setShowWin(false); startGame(); }}>
            <Text style={[styles.tryAgainBtnText, { color: theme.buttonText }]}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tryAgainBtn, { backgroundColor: 'transparent', borderWidth: 0, marginTop: 8 }]} onPress={() => { setShowWin(false); router.replace('/(tabs)/games/LogicTrainingScreen'); }}>
            <Text style={[styles.tryAgainBtnText, { color: theme.textTertiary, fontWeight: '400' }]}>Go to Main Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const question = currentQ;
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GameHeader
        onBack={() => router.replace('/(tabs)/games/LogicTrainingScreen')}
        gameTitle="Odd One Out Easy"
        gameDescription="Test your pattern recognition by finding the item that doesn't belong."
        gameInstructions="Look at the items and find the one that doesn't belong with the others. Each correct answer gives you +5 points!"
      />
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            zIndex: 0,
            opacity: greenBg,
            backgroundColor: theme.overlay
          },
        ]}
      />
      {WinModal}
      <Animated.View
        style={[
          styles.centralCard,
          { opacity: cardAnim, transform: [{ scale: cardAnim }] },
        ]}
      >
        <Text style={[styles.progress, { color: theme.text }]}>
          Streak: {streak} / {STREAK_TO_WIN}
        </Text>
        <View style={styles.cardWrap}>
          <Animated.View style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: 23,
              backgroundColor: theme.surface,
              opacity: correctAnim,
              zIndex: 1,
            }
          ]} pointerEvents="none" />
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {choiceOrder.map((item, i) => (
              <Pressable
                key={i}
                style={[
                  styles.choice,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  selected === i && !wrong && isAnimating && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => handleAnswer(item, i)}
                disabled={isAnimating}
              >
                <Animated.Text style={[
                  styles.choiceText,
                  { color: theme.text },
                  selected === i && !wrong && isAnimating && {
                    color: theme.buttonText,
                    fontWeight: "900",
                    transform: [{ scale: selected === i ? correctScale : 1 }]
                  }
                ]}>
                  {item}
                </Animated.Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Text style={[styles.xpBar, { color: theme.text }]}>XP: {xpThisGame}</Text>
      </Animated.View>
      <Modal visible={showHelp} transparent animationType="fade" onRequestClose={() => setShowHelp(false)}>
        <View style={{ flex:1, backgroundColor: theme.overlay, alignItems:'center', justifyContent:'center' }}>
          <View style={{ backgroundColor: theme.card, padding:18, borderRadius:14, width:'86%' }}>
            <Text style={{ fontSize:18, fontWeight:'900', color: theme.text, marginBottom:8 }}>How to Play</Text>
            <Text style={{ fontSize:14, color: theme.textSecondary, lineHeight:20 }}>
              Pick the item that does not belong to the group based on a hidden rule. Read the brief explanation after each round.
            </Text>
            <TouchableOpacity style={[styles.tryAgainBtn, { backgroundColor: theme.primary }]} onPress={() => setShowHelp(false)}>
              <Text style={[styles.tryAgainBtnText, { color: theme.buttonText }]}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, width: "100%"
  },
  gameContent: {
    flex: 1, alignItems: "center", justifyContent: "center"
  },
  centralCard: {
    width: "98%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginTop: -20,
  },
  cardWrap: {
    width: 370,
    maxWidth: "96%",
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#49d6c7",
    shadowOpacity: 0.08,
    shadowRadius: 17,
    elevation: 6,
  },
  exitAbs: {
    position: "absolute",
    top: Platform.OS === 'ios' ? 34 : 16,
    right: 18,
    zIndex: 10,
    borderRadius: 20,
    width: 40, height: 40,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  exitAbsText: {
    fontSize: 26, fontWeight: "900", lineHeight: 32,
  },
  progress: {
    fontSize: 19, fontWeight: "900", marginBottom: 17,
    letterSpacing: 1.2, marginTop: 13,
  },
  card: {
    borderRadius: 23,
    padding: 30,
    width: "100%",
    minHeight: 182,
    shadowColor: "#1e2e44",
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 7,
    zIndex: 2,
  },
  choice: {
    borderRadius: 18,
    paddingVertical: 18,
    marginVertical: 13,
    alignItems: "center",
    borderWidth: 1.4,
    elevation: 1,
    minWidth: 160,
    shadowColor: "#a8e2d0",
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  choiceText: {
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  xpBar: {
    marginTop: 12,
    fontSize: 18.5,
    fontWeight: "900",
    letterSpacing: 1,
  },
  bigText: {
    fontSize: 34, fontWeight: "bold", marginBottom: 13, textAlign: "center",
  },
  xpResult: {
    fontSize: 18, fontWeight: "700", marginBottom: 8, textAlign: "center",
  },
  explanationWrong: {
    fontSize: 18, fontWeight: "600", textAlign: "center", marginBottom: 8,
  },
  explanationWrong2: {
    fontSize: 15, fontStyle: "italic", textAlign: "center", marginBottom: 24,
  },
  tryAgainBtn: {
    paddingVertical: 13,
    paddingHorizontal: 46,
    borderRadius: 15,
    marginBottom: 13,
    marginTop: 7,
    elevation: 2,
  },
  tryAgainBtnText: {
    fontWeight: "900", fontSize: 17, letterSpacing: 0.9,
  },
  exitBtnText: {
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 0.8,
  },
});
