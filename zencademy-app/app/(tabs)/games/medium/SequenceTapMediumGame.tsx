import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import GameHeader from '../../../../components/GameHeader';
import { useTheme } from '../../../../components/ThemeContext';
import { useXP } from '../../../../components/XPContext';

const ROUNDS = 5;
const CIRCLES = 10; // show 10 circles
const XP_PER_CORRECT = 10; // medium games: +10 points per correct answer
const XP_REWARD = 40; // Bonus for completing the game
const FLASH_TIME = 500;

function getRandomSequence(length: number, max: number) {
  const arr: number[] = [];
  while (arr.length < length) {
    const n = Math.floor(Math.random() * max);
    if (!arr.includes(n)) arr.push(n);
  }
  return arr;
}

export default function SequenceTapMediumGame() {
  const { addXp, incrementCompletedGame } = useXP();
  const router = useRouter();
  const { theme } = useTheme();
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<'show' | 'input' | 'success' | 'fail'>('show');
  const [sequence, setSequence] = useState<number[]>([]);
  const [flashIndex, setFlashIndex] = useState(-1);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [key, setKey] = useState(0); // for full reset
  const [feedback, setFeedback] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase === 'show') {
      const len = 4 + Math.floor(Math.random() * 3); // 4-6
      const seq = getRandomSequence(len, CIRCLES);
      setSequence(seq);
      setUserInput([]);
      setFlashIndex(-1);
      setTimeout(() => playSequence(seq), 400);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [round, phase, key]);

  function playSequence(seq: number[]) {
    let i = 0;
    function flashNext() {
      setFlashIndex(seq[i]);
      timeoutRef.current = window.setTimeout(() => {
        setFlashIndex(-1);
        if (i < seq.length - 1) {
          i++;
          timeoutRef.current = window.setTimeout(flashNext, 120);
        } else {
          setTimeout(() => setPhase('input'), 200);
        }
      }, FLASH_TIME);
    }
    flashNext();
  }

  useEffect(() => {
    if (phase === 'success') {
      setShowConfetti(true);
      addXp(XP_REWARD);
      incrementCompletedGame({ category: 'focus', difficulty: 'medium' });
    }
    // eslint-disable-next-line
  }, [phase, key]);

  function handleCircleTap(idx: number) {
    if (phase !== 'input') return;
    const nextInput = [...userInput, idx];
    setUserInput(nextInput);
    if (sequence[nextInput.length - 1] !== idx) {
      setFeedback('✘ Wrong order! Try again.');
      setPhase('fail');
      return;
    }
    if (nextInput.length === sequence.length) {
      if (round + 1 === ROUNDS) {
        setPhase('success');
      } else {
        setRound(r => r + 1);
        setPhase('show');
      }
    }
  }

  function handleRestart() {
    setRound(0);
    setPhase('show');
    setShowConfetti(false);
    setKey(k => k + 1);
    setFeedback(null);
    setUserInput([]);
  }

  function handleExit() {
    router.replace('/games/AttentionTrainingScreen');
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]} key={key}>
      <GameHeader
        onBack={() => router.replace('/games/AttentionTrainingScreen')}
        gameTitle="Sequence Tap"
        gameDescription="Test your memory by watching a sequence of circles and then tapping them in the same order."
        gameInstructions="Watch the sequence of circles, then tap them in the same order. Be accurate—one mistake ends the run!"
      />
      <View style={styles.gameContent}>
        {showConfetti && <ConfettiCannon count={100} origin={{ x: 200, y: 0 }} fadeOut autoStart explosionSpeed={400} fallSpeed={1800} />}
        <Text style={[styles.title, { color: theme.text }]}>Sequence Tap</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Watch the sequence, then tap the circles in the same order. {round + 1} / {ROUNDS}</Text>
      <View style={styles.circlesGrid}>
        <View style={styles.circlesRow}>
          {Array.from({ length: CIRCLES }).map((_, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.circle,
                { borderColor: theme.border },
                flashIndex === idx
                  ? { backgroundColor: theme.primary }
                  : userInput.includes(idx)
                    ? { backgroundColor: theme.accent }
                    : { backgroundColor: theme.card }
              ]}
              onPress={() => handleCircleTap(idx)}
              activeOpacity={0.7}
              disabled={phase !== 'input' || userInput.includes(idx)}
            >
              <Text style={[styles.circleText, { color: theme.text }]}>{idx + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {phase === 'success' && (
        <View style={[styles.resultCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.successText, { color: theme.text }]}>✔️ Great memory! You completed the sequence.</Text>
          <Text style={[styles.xpText, { color: theme.text }]}>+{XP_REWARD} XP</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.primary }]} onPress={handleRestart}>
              <Text style={[styles.retryText, { color: theme.buttonText }]}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuBtn, { borderColor: theme.border }]} onPress={handleExit}>
              <Text style={[styles.menuText, { color: theme.text }]}>Main Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {phase === 'fail' && (
        <View style={[styles.resultCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.failText, { color: theme.error }]}>{feedback || '✘ Game Over!'}</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.primary }]} onPress={handleRestart}>
              <Text style={[styles.retryText, { color: theme.buttonText }]}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuBtn, { borderColor: theme.border }]} onPress={handleExit}>
              <Text style={[styles.menuText, { color: theme.text }]}>Main Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  circlesGrid: {
    marginBottom: 30,
    marginTop: 10,
  },
  circlesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  circle: {
    width: width / 9.6,
    height: width / 9.6,
    borderRadius: 999,
    marginHorizontal: 7,
    marginVertical: 7,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveCircle: {},
  circleText: {
    fontWeight: '800',
    fontSize: 20,
  },
  resultCard: {
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    marginTop: 18,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  successText: {
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  failText: {
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  xpText: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 10,
  },
  retryBtn: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 28,
    marginTop: 10,
  },
  menuBtn: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginTop: 10,
    borderWidth: 1,
  },
  retryText: {
    fontWeight: '700',
    fontSize: 16,
  },
  menuText: {
    fontWeight: '700',
    fontSize: 16,
  },
}); 