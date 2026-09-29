import { sessionXp, partialSessionXp, coinsForXp } from '../../../../lib/progression';
import { useGameReward } from '../../../../hooks/useGameReward';
import { WinPulse } from '../../../../components/WinPulse';
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import GameHeader from '../../../../components/GameHeader';
import { useTheme } from '../../../../components/ThemeContext';
import { useXP } from '../../../../components/XPContext';

// Întrebări cu elemente vizuale (forme, culori, poziții, proporții)
const QUESTIONS = [
  // Diferență de culoare, toate CERCURI
  { items: ["🔵", "🔵", "🟢", "🔵"], answer: "🟢", explanation: "🟢 is the only green circle, rest are blue circles." },
  { items: ["🔴", "🟡", "🔴", "🔴"], answer: "🟡", explanation: "🟡 is yellow, rest are red circles." },
  { items: ["🟣", "🟣", "🟣", "🔵"], answer: "🔵", explanation: "🔵 is blue, rest are purple circles." },
  { items: ["🟢", "🟢", "🟢", "🔴"], answer: "🔴", explanation: "🔴 is red, rest are green circles." },

  // Diferență de culoare, toate PĂTRATE
  { items: ["🟩", "🟦", "🟩", "🟩"], answer: "🟦", explanation: "🟦 is the only blue square, rest are green squares." },
  { items: ["🟪", "🟪", "🟧", "🟪"], answer: "🟧", explanation: "🟧 is orange, rest are purple squares." },
  { items: ["🟫", "🟫", "🟨", "🟫"], answer: "🟨", explanation: "🟨 is yellow, rest are brown squares." },

  // Diferență de culoare, toate TRIUNGHIURI
  { items: ["🔺", "🔺", "🔺", "🔻"], answer: "🔻", explanation: "🔻 is the only down-pointing triangle, rest are up-pointing." },
  { items: ["🔺", "🔺", "🔺", "🟥"], answer: "🟥", explanation: "🟥 is a square, rest are triangles (dar vezi mai jos nota*)." },

  // Diferență de formă, toate aceeasi culoare (RED)
 { items: ["🟢", "🟩", "🟢", "🔺"], answer: "🔺", explanation: "🔺 is a triangle, rest are green circles/squares." },
  { items: ["🟣", "🟣", "🟪", "🟣"], answer: "🟪", explanation: "🟪 is a purple square, rest are purple circles." },
  { items: ["🟠", "🟠", "🔸", "🟠"], answer: "🔸", explanation: "🔸 is a diamond, rest are orange circles." },

  // Diferență de mărime, toate cercuri
  { items: ["🔴", "🔴", "🔴", "🔘"], answer: "🔘", explanation: "🔘 is a small red circle, rest are big red circles." },
 
  // Diferență de mărime, toate pătrate
  { items: ["🟩", "🟩", "🟩", "▪️"], answer: "▪️", explanation: "▪️ is a small green square, rest are big green squares." },
 
  // Diferență de orientare (special pentru triunghiuri)
  { items: ["🔺", "🔺", "🔺", "🔻"], answer: "🔻", explanation: "🔻 points down, rest point up." }
];

const XP_PER_CORRECT = 5; // easy games: +5 points per correct answer
const XP_REWARD = 12;
const QUESTIONS_PER_GAME = 5;
const MAX_XP = 12;
const FULL_WIDTH = Dimensions.get('window').width;

function getGameQuestions() {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, QUESTIONS_PER_GAME);
}
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function VisualEasyGame() {
  const router = useRouter();
  const { plan } = useXP();
  const { award, awardFor, reset: resetReward } = useGameReward();
  const { theme } = useTheme();

  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [choiceOrder, setChoiceOrder] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selected, setSelected] = useState(-1);

  const greenBg = useRef(new Animated.Value(0)).current;
  const correctAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const correctScale = useRef(new Animated.Value(1)).current;

  useEffect(() => { startGame(); }, []);

  useEffect(() => {
    if (questions.length && idx < questions.length) {
      setChoiceOrder(shuffleArray(questions[idx].items));
      Animated.timing(cardAnim, { toValue: 0, duration: 0, useNativeDriver: true }).start(() => {
        Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, friction: 7, tension: 85 }).start();
      });
      setSelected(-1);
    }
  }, [questions, idx]);

  function startGame() {
    setQuestions(getGameQuestions());
    setIdx(0);
    setScore(0);
    setWrong(false);
    setShowExplanation(false);
    setShowConfetti(false);
    setXpAwarded(false);
    setIsAnimating(false);
    setSelected(-1);
    Animated.timing(cardAnim, { toValue: 1, duration: 0, useNativeDriver: true }).start();
  }

  function handleAnswer(choice, i) {
    if (isAnimating) return;
    setSelected(i);
    if (choice === questions[idx].answer) {
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
      setScore(s => s + 1);
      setTimeout(() => {
        setIsAnimating(false);
        setSelected(-1);
        if (idx + 1 < questions.length) setIdx(idx + 1);
        else setShowExplanation(true);
      }, 600);
    } else {
      setWrong(true);
    }
  }

  const xpThisGame = partialSessionXp('Easy', Math.min(score, QUESTIONS_PER_GAME) / QUESTIONS_PER_GAME, plan);

  useEffect(() => {
    if (
      showExplanation &&
      questions.length &&
      idx === questions.length - 1 &&
      xpThisGame > 0 &&
      !xpAwarded
    ) {
      void award(xpThisGame);
      setShowConfetti(true);
      setXpAwarded(true);
    }
    // eslint-disable-next-line
  }, [showExplanation, idx, questions.length, xpThisGame, xpAwarded]);

  if (!questions.length || !questions[idx] || !choiceOrder.length) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  if (wrong) {
    const question = questions[idx];
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
            <GameHeader
              onBack={() => router.replace('/games/VisualTrainingScreen')}
          gameTitle="Visual Easy"
          gameDescription="Test your visual processing and pattern recognition skills."
          gameInstructions="Complete the visual tasks and pattern recognition challenges. Each correct answer gives you +5 points!"
        />
        <View style={[styles.gameContent, { justifyContent: "center" }]}>
          <Text style={[styles.bigText, { color: theme.error, fontSize: 34 }]}>Wrong!</Text>
          <Text style={[styles.explanationWrong, { color: theme.textSecondary }]}>
            The correct answer was:{"\n"}
            <Text style={{ fontWeight: "bold", color: theme.primary }}>
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

  if (showExplanation && idx === questions.length - 1) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
            <GameHeader
              onBack={() => router.replace('/games/VisualTrainingScreen')}
          gameTitle="Visual Easy"
          gameDescription="Test your visual processing and pattern recognition skills."
          gameInstructions="Complete the visual tasks and pattern recognition challenges. Each correct answer gives you +5 points!"
        />
        <View style={styles.gameContent}>
          {showConfetti && (
            <WinPulse active />
          )}
          <Text style={[styles.bigText, { color: theme.text }]}>🎉 Game Completed!</Text>
          <Text style={[styles.xpResult, { color: theme.text }]}>
            Correct: <Text style={{ color: theme.primary }}>{score}/{questions.length}</Text>
          </Text>
          <Text style={[styles.xpResult, { color: theme.text }]}>
            XP gained: <Text style={{ color: theme.primary }}>{xpThisGame}</Text>
          </Text>
          <TouchableOpacity style={[styles.tryAgainBtn, { backgroundColor: theme.primary }]} onPress={startGame}>
            <Text style={[styles.tryAgainBtnText, { color: theme.buttonText }]}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exitBtn, { backgroundColor: theme.surface }]} onPress={() => router.back()}>
            <Text style={[styles.exitBtnText, { color: theme.text }]}>← Back to category</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const question = questions[idx];
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
            <GameHeader
              onBack={() => router.replace('/games/VisualTrainingScreen')}
        gameTitle="Visual Easy"
        gameDescription="Test your visual processing and pattern recognition skills."
        gameInstructions="Complete the visual tasks and pattern recognition challenges. Each correct answer gives you +5 points!"
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
      <Animated.View
        style={[
          styles.centralCard,
          { opacity: cardAnim, transform: [{ scale: cardAnim }] },
        ]}
      >
        <Text style={[styles.progress, { color: theme.text }]}>
          Question {idx + 1} of {questions.length}
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
                    fontWeight: "bold",
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
