import { sessionXp, partialSessionXp, coinsForXp } from '../../../../lib/progression';
import { useGameReward } from '../../../../hooks/useGameReward';
import { WinPulse } from '../../../../components/WinPulse';
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import GameHeader from '../../../../components/GameHeader';
import { useTheme } from '../../../../components/ThemeContext';
import { useXP } from '../../../../components/XPContext';

// Verbal "Find the Synonym" Questions (Easy)
const QUESTIONS = [
  { word: "Begin", choices: ["Start", "Cry", "Wait"], answer: "Start", explanation: "Begin and start are synonyms." },
  { word: "Happy", choices: ["Joyful", "Sad", "Strong"], answer: "Joyful", explanation: "Happy means joyful." },
  { word: "Quiet", choices: ["Loud", "Silent", "Tall"], answer: "Silent", explanation: "Quiet and silent mean the same." },
  { word: "Cold", choices: ["Hot", "Chilly", "Dry"], answer: "Chilly", explanation: "Cold and chilly mean the same." },
  { word: "Fast", choices: ["Quick", "Lazy", "Old"], answer: "Quick", explanation: "Fast and quick are synonyms." },
  { word: "Smart", choices: ["Clever", "Thirsty", "Lost"], answer: "Clever", explanation: "Smart and clever mean the same." },
  { word: "Big", choices: ["Huge", "Small", "Young"], answer: "Huge", explanation: "Big and huge are synonyms." },
  { word: "End", choices: ["Finish", "Build", "Play"], answer: "Finish", explanation: "End and finish are synonyms." },
  { word: "Help", choices: ["Assist", "Wait", "Leave"], answer: "Assist", explanation: "To help is to assist." },
  { word: "Funny", choices: ["Silly", "Sad", "Quick"], answer: "Silly", explanation: "Funny and silly are similar." },
  { word: "Answer", choices: ["Reply", "Question", "Talk"], answer: "Reply", explanation: "Answer and reply are synonyms." },
  { word: "Tired", choices: ["Sleepy", "Angry", "Strong"], answer: "Sleepy", explanation: "Tired and sleepy go together." },
  { word: "Clean", choices: ["Dirty", "Clear", "Wash"], answer: "Clear", explanation: "Clean and clear are similar in some contexts." },
  { word: "Beautiful", choices: ["Pretty", "Rough", "Strong"], answer: "Pretty", explanation: "Beautiful and pretty are synonyms." },
  { word: "Idea", choices: ["Thought", "Drink", "Run"], answer: "Thought", explanation: "Idea and thought are close in meaning." },
  { word: "Child", choices: ["Kid", "Parent", "Tall"], answer: "Kid", explanation: "Child and kid are synonyms." },
  { word: "Easy", choices: ["Simple", "Hard", "Short"], answer: "Simple", explanation: "Easy and simple mean the same." },
  { word: "Job", choices: ["Work", "Fun", "Game"], answer: "Work", explanation: "Job and work are synonyms." },
  { word: "Speak", choices: ["Talk", "Draw", "Lift"], answer: "Talk", explanation: "Speak and talk are synonyms." },
  { word: "Strong", choices: ["Weak", "Powerful", "Young"], answer: "Powerful", explanation: "Strong and powerful mean the same." }
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

export default function VerbalEasyGame() {
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
      setChoiceOrder(shuffleArray(questions[idx].choices));
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

  // SAFE GUARD
  if (!questions.length || !questions[idx] || !choiceOrder.length) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  // WRONG SCREEN
  if (wrong) {
    const question = questions[idx];
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <GameHeader
          onBack={() => router.replace('/games/VerbalTrainingScreen')}
          gameTitle="Verbal Easy"
          gameDescription="Test your verbal skills and word knowledge."
          gameInstructions="Complete the verbal tasks and word puzzles. Each correct answer gives you +5 points!"
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

  // FINAL SCREEN
  if (showExplanation && idx === questions.length - 1) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <GameHeader
          onBack={() => router.replace('/games/VerbalTrainingScreen')}
          gameTitle="Verbal Easy"
          gameDescription="Test your verbal skills and word knowledge."
          gameInstructions="Complete the verbal tasks and word puzzles. Each correct answer gives you +5 points!"
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

  // GAME CARD
  const question = questions[idx];
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GameHeader
        onBack={() => router.replace('/games/VerbalTrainingScreen')}
        gameTitle="Verbal Easy"
        gameDescription="Test your verbal skills and word knowledge."
        gameInstructions="Complete the verbal tasks and word puzzles. Each correct answer gives you +5 points!"
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
            <Text style={[styles.wordLabel, { color: theme.textSecondary }]}>Find the synonym for:</Text>
            <Text style={[styles.wordText, { color: theme.text }]}>{question.word}</Text>
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
    alignItems: "center"
  },
  wordLabel: {
    fontSize: 15,
    marginBottom: 5,
    textAlign: "center"
  },
  wordText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 18,
    textAlign: "center"
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
