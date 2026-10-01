import { sessionXp, partialSessionXp, coinsForXp } from '../../../../lib/progression';
import { useGameReward } from '../../../../hooks/useGameReward';
import { WinPulse } from '../../../../components/WinPulse';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GameHeader from '../../../../components/GameHeader';
import { useTheme } from '../../../../components/ThemeContext';
import { useXP } from '../../../../components/XPContext';

const STREAK_TO_WIN = 5;
const XP_PER_CORRECT = 10; // medium games: +10 points per correct answer
const XP_REWARD = 18;
const MAX_XP = 18;
const FULL_WIDTH = Dimensions.get('window').width;

const SEQUENCES = [
  { seq: [2, 4, 6, 8], answer: 10, options: [10, 12, 14, 16], explanation: 'Add 2 each time.' },
  { seq: [1, 4, 9, 16], answer: 25, options: [25, 36, 49, 64], explanation: 'Squares: 1², 2², 3², 4², ...' },
  { seq: [5, 10, 20, 40], answer: 80, options: [60, 80, 100, 120], explanation: 'Multiply by 2.' },
  { seq: [21, 18, 15, 12], answer: 9, options: [6, 7, 8, 9], explanation: 'Subtract 3.' },
  { seq: [3, 6, 12, 24], answer: 48, options: [36, 42, 48, 54], explanation: 'Multiply by 2.' },
  { seq: [13, 11, 9, 7], answer: 5, options: [3, 4, 5, 6], explanation: 'Subtract 2.' },
  { seq: [2, 3, 5, 8], answer: 13, options: [11, 12, 13, 14], explanation: 'Fibonacci: add previous two.' },
  { seq: [10, 20, 30, 40], answer: 50, options: [45, 50, 55, 60], explanation: 'Add 10.' },
  { seq: [100, 90, 80, 70], answer: 60, options: [50, 55, 60, 65], explanation: 'Subtract 10.' },
  { seq: [1, 2, 4, 8], answer: 16, options: [12, 14, 16, 18], explanation: 'Multiply by 2.' },
  { seq: [7, 14, 28, 56], answer: 112, options: [84, 98, 112, 126], explanation: 'Multiply by 2.' },
  { seq: [81, 27, 9, 3], answer: 1, options: [1, 2, 3, 4], explanation: 'Divide by 3.' },
  { seq: [2, 5, 10, 17], answer: 26, options: [24, 25, 26, 27], explanation: 'Add 3, 5, 7, ... (add next odd number).' },
];

function getRandomSequence(usedIds: number[] = []) {
  const pool = SEQUENCES.filter((_, i) => !usedIds.includes(i));
  if (pool.length === 0) return null;
  const idx = Math.floor(Math.random() * pool.length);
  return { ...pool[idx], _id: SEQUENCES.indexOf(pool[idx]) };
}

export default function PatternSequenceGame() {
  const router = useRouter();
  const { plan } = useXP();
  const { award, awardFor, reset: resetReward } = useGameReward();
  const { theme } = useTheme();
  const [currentQ, setCurrentQ] = useState<any>(null);
  const [usedIds, setUsedIds] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [selected, setSelected] = useState(-1);
  const [win, setWin] = useState(false);
  const [feedback, setFeedback] = useState('');
  const cardAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => { startGame(); }, []);

  function startGame() {
    const q = getRandomSequence();
    setCurrentQ(q);
    setUsedIds(q ? [q._id] : ([] as number[]));
    setStreak(0);
    setWrong(false);
    setShowConfetti(false);
    setXpAwarded(false);
    setSelected(-1);
    setWin(false);
    setFeedback('');
    Animated.timing(cardAnim, { toValue: 1, duration: 0, useNativeDriver: true }).start();
  }

  function nextQuestion() {
    const q = getRandomSequence(usedIds);
    if (!q) {
      setUsedIds([] as number[]);
      const fresh = getRandomSequence();
      setCurrentQ(fresh);
      setUsedIds(fresh ? [fresh._id] : ([] as number[]));
    } else {
      setCurrentQ(q);
      setUsedIds((prev: number[]) => ([...prev, q._id] as number[]));
    }
    setSelected(-1);
    setWrong(false);
    setFeedback('');
    Animated.timing(cardAnim, { toValue: 0, duration: 0, useNativeDriver: true }).start(() => {
      Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, friction: 7, tension: 85 }).start();
    });
  }

  function handleAnswer(choice: number, i: number) {
    setSelected(i);
    if (currentQ && choice === currentQ.answer) {
      setFeedback('✔️ Correct!');
      setTimeout(() => {
        setStreak(s => {
          const newStreak = s + 1;
          if (newStreak >= STREAK_TO_WIN) {
            setWin(true);
          } else {
            nextQuestion();
          }
          return newStreak;
        });
      }, 400);
    } else {
      setWrong(true);
      setFeedback('✘ Wrong!');
      setStreak(0);
    }
  }

  useEffect(() => {
    if (win && !xpAwarded) {
      void awardFor('Medium');
      setShowConfetti(true);
      setXpAwarded(true);
    }
  }, [win, xpAwarded]);

  if (!currentQ) return <View style={{ flex: 1, backgroundColor: theme.background }} />;

  if (wrong) {
    return (
      <View style={[styles.container, { justifyContent: 'center', backgroundColor: theme.background }]}> 
        <Text style={[styles.bigText, { color: theme.error, fontSize: 34 }]}>Wrong!</Text>
        <Text style={[styles.explanationWrong, { color: theme.textSecondary }]}>
          The correct answer was:{'\n'}
          <Text style={{ fontWeight: 'bold', color: theme.primary }}>{currentQ.answer}</Text>
        </Text>
        <Text style={[styles.explanationWrong2, { color: theme.textSecondary }]}>{currentQ.explanation}</Text>
        <TouchableOpacity
          style={[styles.tryAgainBtn, { backgroundColor: theme.primary }]}
          onPress={startGame}
        >
          <Text style={[styles.tryAgainBtnText, { color: theme.background }]}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (win) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {showConfetti && <WinPulse active />}
        <GameHeader
          onBack={() => router.back()}
          gameTitle="Pattern Sequence"
          gameDescription="Test your pattern recognition by identifying the next number in a sequence."
          gameInstructions="Look at the sequence and identify the pattern to find the next number. Each correct answer gives you +10 points!"
        />
        <View style={[styles.container, { justifyContent: 'center' }]}>
          <Text style={[styles.bigText, { color: theme.primary }]}>🎉 You Win!</Text>
          <Text style={[styles.explanationWrong, { color: theme.textSecondary }]}>
            You completed {STREAK_TO_WIN} patterns in a row!
          </Text>
          <Text style={[styles.explanationWrong2, { color: theme.textSecondary }]}>
            +{MAX_XP} XP earned!
          </Text>
          <TouchableOpacity
            style={[styles.tryAgainBtn, { backgroundColor: theme.primary }]}
            onPress={startGame}
          >
            <Text style={[styles.tryAgainBtnText, { color: theme.background }]}>Play Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GameHeader
        onBack={() => router.back()}
        gameTitle="Pattern Sequence"
        gameDescription="Test your pattern recognition by identifying the next number in a sequence."
        gameInstructions="Look at the sequence and identify the pattern to find the next number. Each correct answer gives you +10 points!"
      />
      <View style={styles.gameContent}>
        <Animated.View style={[styles.card, { backgroundColor: theme.card, transform: [{ scale: cardAnim }] }]}> 
        <Text style={[styles.streakText, { color: theme.text }]}>Streak: {streak} / {STREAK_TO_WIN}</Text>
        <Text style={[styles.seqText, { color: theme.text }]}>
          {currentQ.seq.map((n: number, i: number) => (
            <Text key={i} style={[styles.seqNum, { color: theme.text }]}>{n}{i < currentQ.seq.length - 1 ? ', ' : ', ?'}</Text>
          ))}
        </Text>
        <View style={styles.optionsRow}>
          {currentQ.options.map((opt: number, i: number) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.optionBtn,
                { backgroundColor: theme.surface, borderColor: theme.border },
                selected === i && opt === currentQ.answer && { backgroundColor: theme.primary },
                selected === i && opt !== currentQ.answer && { backgroundColor: theme.error },
              ]}
              onPress={() => handleAnswer(opt, i)}
              disabled={selected !== -1}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: theme.text }]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {!!feedback && <Text style={[styles.feedbackText, { color: theme.text }]}>{feedback}</Text>}
        <Text style={[styles.explanation, { color: theme.textSecondary }]}>{currentQ.explanation}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  card: {
    width: '98%',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-end',
  },
  seqText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 18,
    fontFamily: 'SpaceMono-Regular',
    textAlign: 'center',
  },
  seqNum: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 22,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
    marginTop: 8,
  },
  optionBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 22,
    marginHorizontal: 8,
    marginBottom: 2,
    minWidth: 54,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  optionText: {
    fontSize: 20,
    fontFamily: 'SpaceMono-Regular',
    fontWeight: '700',
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 2,
    textAlign: 'center',
  },
  explanation: {
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  explanationWrong: {
    fontSize: 18,
    marginTop: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  explanationWrong2: {
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tryAgainBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 28,
    alignItems: 'center',
  },
  tryAgainBtnText: {
    fontSize: 18,
    fontWeight: '700',
  },
  bigText: {
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
}); 