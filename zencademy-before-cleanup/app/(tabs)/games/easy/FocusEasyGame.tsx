import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import GameHeader from '../../../../components/GameHeader';
import { useTheme } from '../../../../components/ThemeContext';
import { useXP } from '../../../../components/XPContext';

const ROUNDS = 15;
// Larger grid for more variety
const ROWS = 3;
const CIRCLES_PER_ROW = 7;
const CIRCLES = ROWS * CIRCLES_PER_ROW;
// New scoring: Easy game awards a flat 10 points on success
const BASE_REWARD_EASY = 10;

export default function FocusEasyGame() {
  const { addXp, incrementCompletedGame, plan } = useXP();
  const router = useRouter();
  const { theme } = useTheme();
  const [round, setRound] = useState(0);
  // Multiple actives per round, one is the correct (purple)
  const [activeSet, setActiveSet] = useState<number[]>([]);
  const [correctIdx, setCorrectIdx] = useState<number>(-1);
  const [phase, setPhase] = useState<'playing' | 'success' | 'fail'>('playing');
  const [showConfetti, setShowConfetti] = useState(false);
  const [key, setKey] = useState(0); // for full reset
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (phase === 'success') {
      setShowConfetti(true);
      const planBonus = plan === 'elite' ? 25 : (plan === 'lite' ? 10 : 0);
      addXp(BASE_REWARD_EASY + planBonus);
      incrementCompletedGame({ category: 'focus', difficulty: 'easy' });
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    // eslint-disable-next-line
  }, [phase, key]);

  function getNumActives(currentRound: number) {
    if (currentRound < 5) return 1;
    if (currentRound < 10) return 2;
    return 3;
  }

  function regenerateTargets(nextRound: number) {
    const numActives = getNumActives(nextRound);
    const newCorrect = Math.floor(Math.random() * CIRCLES);
    const set = new Set<number>();
    set.add(newCorrect);
    while (set.size < numActives) {
      const candidate = Math.floor(Math.random() * CIRCLES);
      if (!set.has(candidate)) set.add(candidate);
    }
    setActiveSet(Array.from(set));
    setCorrectIdx(newCorrect);
  }

  useEffect(() => {
    // Initialize first targets
    if (phase === 'playing' && activeSet.length === 0) {
      regenerateTargets(0);
    }
    // eslint-disable-next-line
  }, [phase, key]);

  function handleCircleTap(idx: number) {
    if (phase !== 'playing') return;
    if (idx === correctIdx) {
      if (round + 1 === ROUNDS) {
        setPhase('success');
      } else {
        const next = round + 1;
        setRound(next);
        regenerateTargets(next);
      }
    } else {
      setPhase('fail');
    }
  }

  function handleRestart() {
    setRound(0);
    setActiveSet([]);
    setCorrectIdx(-1);
    setPhase('playing');
    setShowConfetti(false);
    setKey(k => k + 1);
  }

  function handleExit() {
    router.replace('/MentalTrainingScreen');
  }

  // Pick a consistent distractor color palette based on theme
  function themeModeColor(theme: any, seed: number) {
    const paletteLight = ['#F43F5E', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6'];
    const paletteDark = ['#EF4444', '#F59E0B', '#34D399', '#22D3EE', '#60A5FA'];
    const palette = paletteDark; // both palettes are vibrant and readable on both themes
    return palette[seed % palette.length];
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]} key={key}>
      <GameHeader
        onBack={() => router.replace('/games/AttentionTrainingScreen')}
        gameTitle="Focus Easy"
        gameDescription="Test your focus and attention by tapping only the highlighted circle while avoiding distractors."
        gameInstructions="Tap ONLY the highlighted circle. Avoid any other circles. Win to earn +10 points (Lite +10, Elite +25 bonus). Tapping a wrong circle ends the game."
      />
      <View style={styles.gameContent}>
        {showConfetti && <ConfettiCannon count={90} origin={{ x: 200, y: 0 }} fadeOut autoStart explosionSpeed={350} fallSpeed={1700} />}
        <Text style={[styles.title, { color: theme.text }]}>Don't Tap the Distractors</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Tap ONLY the purple circle. {ROUNDS - round} to go!</Text>
      <View style={styles.circlesGrid}>
        {[...Array(ROWS)].map((_, rowIdx) => (
          <View key={rowIdx} style={styles.circlesRow}>
            {Array.from({ length: CIRCLES_PER_ROW }).map((_, colIdx) => {
              const idx = rowIdx * CIRCLES_PER_ROW + colIdx;
              const isActive = activeSet.includes(idx);
              const isCorrect = idx === correctIdx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.circle, 
                    { borderColor: theme.border },
                    isActive
                      ? [styles.activeCircle, { backgroundColor: isCorrect ? theme.primary : (themeModeColor(theme, idx)) }]
                      : [styles.inactiveCircle, { backgroundColor: theme.card }]
                  ]}
                  onPress={() => handleCircleTap(idx)}
                  activeOpacity={0.7}
                  disabled={phase !== 'playing'}
                />
              );
            })}
          </View>
        ))}
      </View>
      {phase === 'success' && (
        <View style={[styles.resultCard, { backgroundColor: theme.card }]}>
          <Text style={styles.successText}>✔️ Great focus! You avoided all distractors.</Text>
          <Text style={[styles.xpText, { color: theme.text }]}>+{BASE_REWARD_EASY} XP (game)</Text>
          {plan === 'elite' && (
            <Text style={[styles.xpText, { color: theme.text }]}>+25 XP (Elite bonus)</Text>
          )}
          {plan === 'lite' && (
            <Text style={[styles.xpText, { color: theme.text }]}>+10 XP (Lite bonus)</Text>
          )}
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
          <Text style={styles.failText}>✘ Game Over! You tapped a distractor.</Text>
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
    paddingHorizontal: 16,
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
    marginBottom: 12,
    textAlign: 'center',
  },
  circlesGrid: {
    marginBottom: 18,
    marginTop: 4,
  },
  circlesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  circle: {
    width: width / 9.5,
    height: width / 9.5,
    borderRadius: 999,
    marginHorizontal: 7,
    borderWidth: 2.5,
  },
  activeCircle: {
    // Colors will be set dynamically
  },
  inactiveCircle: {
    // Colors will be set dynamically
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
    color: '#32cf66',
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  failText: {
    color: '#d44',
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
    paddingHorizontal: 18,
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