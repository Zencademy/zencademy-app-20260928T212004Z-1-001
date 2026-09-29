import { sessionXp, partialSessionXp, coinsForXp } from '../../../../lib/progression';
import { useGameReward } from '../../../../hooks/useGameReward';
import { WinPulse } from '../../../../components/WinPulse';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GameHeader from '../../../../components/GameHeader';
import { useTheme } from '../../../../components/ThemeContext';
import { useXP } from '../../../../components/XPContext';
import { playSfx } from '../../../../lib/sound/SoundPack';

const ROUNDS = 8;
const CIRCLES = 16;
// Medium: flat +15 on success (no per-correct), with plan bonuses
const BASE_REWARD_MEDIUM = 18;
const FLASH_TIME = 1000;
const DISTRACTOR_MIN = 1;
const DISTRACTOR_MAX = 2;

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomIndices(count: number, max: number, exclude: number[] = []) {
  const indices = new Set<number>(exclude);
  while (indices.size < count + exclude.length) {
    const idx = getRandomInt(0, max - 1);
    if (!indices.has(idx)) indices.add(idx);
  }
  return Array.from(indices).filter(i => !exclude.includes(i));
}

export default function ColorCountFocus() {
  const { incrementCompletedGame, plan } = useXP();
  const { award, awardFor, reset: resetReward } = useGameReward();
  const router = useRouter();
  const { theme } = useTheme();
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<'show' | 'guess' | 'success' | 'fail'>('show');
  const [flashIndices, setFlashIndices] = useState<number[]>([]);
  const [distractorIndices, setDistractorIndices] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [key, setKey] = useState(0); // for full reset
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [choices, setChoices] = useState<number[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const [targetColor, setTargetColor] = useState<'red' | 'blue'>('red');

  useEffect(() => {
    if (phase === 'show') {
      // Alternate target color randomly each round
      const nextTarget: 'red' | 'blue' = Math.random() < 0.5 ? 'red' : 'blue';
      setTargetColor(nextTarget);
      const targetCount = getRandomInt(3, 5);
      const distractorCount = getRandomInt(DISTRACTOR_MIN, DISTRACTOR_MAX + Math.min(2, Math.floor(correctCount / 2))); // more distractors as you progress
      const targetIdx = getRandomIndices(targetCount, CIRCLES);
      // Build distractor pool with increasing colors (green, yellow, purple etc.)
      const distractorIdx = getRandomIndices(distractorCount, CIRCLES, targetIdx);
      setFlashIndices(targetIdx);
      setDistractorIndices(distractorIdx);
      setChoices(shuffle([targetCount, ...getRandomChoices(targetCount)]));
      timeoutRef.current = window.setTimeout(() => {
        setPhase('guess');
      }, FLASH_TIME);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [round, phase, key]);

  useEffect(() => {
    if (phase === 'success') {
      setShowConfetti(true);
      void awardFor('Medium');
      incrementCompletedGame({ category: 'focus', difficulty: 'medium' });
    }
    // eslint-disable-next-line
  }, [phase, key]);

  function shuffle(arr: number[]) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getRandomChoices(correct: number) {
    const pool = [3, 4, 5].filter(x => x !== correct);
    while (pool.length < 2) pool.push(getRandomInt(3, 5));
    return pool.slice(0, 2);
  }

  function handleGuess(val: number) {
    if (phase !== 'guess') return;
    if (val === flashIndices.length) {
      if (round + 1 === ROUNDS) {
        playSfx('correct'); setPhase('success');
      } else {
        setCorrectCount(c => c + 1);
        setRound(r => r + 1);
        setPhase('show');
      }
    } else {
      setFeedback(`✘ Wrong! ${flashIndices.length} ${targetColor} circles flashed.`);
      playSfx('wrong'); setPhase('fail');
    }
  }

  function handleRestart() {
    setRound(0);
    setCorrectCount(0);
    setPhase('show');
    setShowConfetti(false);
    setKey(k => k + 1);
    setFeedback(null);
  }

  function handleExit() {
    router.replace('/games/AttentionTrainingScreen');
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]} key={key}>
      <GameHeader
        onBack={() => router.replace('/games/AttentionTrainingScreen')}
        gameTitle="Color Count Focus"
        gameDescription="Circles of multiple colors flash briefly. Count how many target-colored circles appeared while ignoring distractors."
        gameInstructions="Watch carefully! Sometimes target is red, other times blue. As you progress, more distractor colors appear. Guess the exact number to win (+15 XP, bonuses: Lite +10, Elite +25)."
      />
      <View style={styles.gameContent}>
        {showConfetti && <WinPulse active />}
        <Text style={[styles.title, { color: theme.text }]}>Count the {targetColor === 'red' ? 'Red' : 'Blue'}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Watch carefully! Target color now: <Text style={{color: targetColor==='red'? '#d44' : '#3a86ff', fontWeight:'bold'}}>{targetColor.toUpperCase()}</Text>.</Text>
      <Text style={[styles.progress, { color: theme.text }]}>{round + 1} / {ROUNDS}</Text>
      <View style={styles.circlesGrid}>
        {[...Array(4)].map((_, rowIdx) => (
          <View key={rowIdx} style={styles.circlesRow}>
            {Array.from({ length: 4 }).map((_, colIdx) => {
              const idx = rowIdx * 4 + colIdx;
              const isTarget = phase === 'show' && flashIndices.includes(idx);
              const isDistractor = phase === 'show' && distractorIndices.includes(idx);
              return (
                <View
                  key={idx}
                  style={[
                    styles.circle,
                    isTarget ? (targetColor==='red'? styles.flashRed : styles.flashBlue)
                             : isDistractor ? styles.distractorCircle : styles.inactiveCircle
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
      {phase === 'guess' && (
        <View style={styles.choicesRow}>
          {choices.map((choice, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.choiceBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => handleGuess(choice)}
            >
              <Text style={[styles.choiceText, { color: theme.text }]}>{choice}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {phase === 'success' && (
        <View style={[styles.resultCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.successText, { color: theme.text }]}>✔️ Great focus! You completed the challenge.</Text>
          <Text style={[styles.xpText, { color: theme.text }]}>+{sessionXp('Medium', plan)} XP</Text>
          <Text style={[styles.xpText, { color: theme.coin, marginTop: 4 }]}>+{coinsForXp(sessionXp('Medium', plan))} coins</Text>
          {plan === 'elite' && (<Text style={[styles.xpText, { color: theme.text }]}>+25 XP (Elite bonus)</Text>)}
          {plan === 'lite' && (<Text style={[styles.xpText, { color: theme.text }]}>+10 XP (Lite bonus)</Text>)}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.primary }]} onPress={handleRestart}>
              <Text style={[styles.retryText, { color: theme.buttonText }]}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuBtn, { borderColor: theme.border }]} onPress={() => router.replace('/games/AttentionTrainingScreen')}>
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
              <Text style={[styles.retryText, { color: theme.buttonText }]}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuBtn, { borderColor: theme.border }]} onPress={() => router.replace('/games/AttentionTrainingScreen')}>
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
    paddingHorizontal: 10,
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
  progress: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
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
  },
  circle: {
    width: width / 11.5,
    height: width / 11.5,
    borderRadius: 999,
    marginHorizontal: 5,
    borderWidth: 2.5,
  },
  flashRed: { backgroundColor: '#d44' },
  flashBlue: { backgroundColor: '#3a86ff' },
  distractorCircle: { backgroundColor: '#10B981' },
  inactiveCircle: {
    backgroundColor: '#fff',
  },
  choicesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  choiceBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginHorizontal: 10,
    borderWidth: 1,
  },
  choiceText: {
    fontWeight: '700',
    fontSize: 18,
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