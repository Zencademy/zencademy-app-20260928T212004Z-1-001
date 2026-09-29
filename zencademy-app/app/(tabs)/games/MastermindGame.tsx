import { sessionXp, partialSessionXp, coinsForXp } from '../../../lib/progression';
import { useGameReward } from '../../../hooks/useGameReward';
import { WinPulse } from '../../../components/WinPulse';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GameHeader from '../../../components/GameHeader';
import { useTheme } from '../../../components/ThemeContext';
import { useXP } from '../../../components/XPContext';

const { width } = Dimensions.get('window');

// Colors will be dynamically set based on theme
const PEGS = 4;
const MAX_ATTEMPTS = 12;
function xpForDifficulty(level: string) {
  if (level === 'hard') return sessionXp('Hard');
  if (level === 'medium') return sessionXp('Medium');
  return sessionXp('Easy');
}

function generateSecret(paletteSize: number): number[] {
  return Array.from({ length: PEGS }, () => Math.floor(Math.random() * paletteSize));
}

function scoreGuess(secret: number[], guess: number[]): { exact: number; colorOnly: number } {
  let exact = 0;
  const secretCounts: Record<number, number> = {};
  const guessCounts: Record<number, number> = {};
  for (let i = 0; i < PEGS; i++) {
    if (guess[i] === secret[i]) exact++;
    else {
      secretCounts[secret[i]] = (secretCounts[secret[i]] || 0) + 1;
      guessCounts[guess[i]] = (guessCounts[guess[i]] || 0) + 1;
    }
  }
  let colorOnly = 0;
  Object.keys(guessCounts).forEach(k => {
    const color = parseInt(k, 10);
    colorOnly += Math.min(guessCounts[color] || 0, secretCounts[color] || 0);
  });
  return { exact, colorOnly };
}

export default function MastermindGame() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { plan } = useXP();
  const { award, awardFor, reset: resetReward } = useGameReward();
  const { theme } = useTheme();
  const [secret, setSecret] = useState<number[]>(generateSecret());
  const [attempts, setAttempts] = useState<number[][]>([]);
  const [feedbacks, setFeedbacks] = useState<{ exact: number; colorOnly: number }[]>([]);
  const [current, setCurrent] = useState<number[]>(Array.from({ length: PEGS }, () => 0));
  const [win, setWin] = useState(false);
  const [lose, setLose] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const [showHelp, setShowHelp] = useState(false);
  const [showWin, setShowWin] = useState(false);

  // Hard-only for Mastermind
  const difficulty = 'hard';
  const maxAttempts = difficulty === 'hard' ? 6 : difficulty === 'medium' ? 8 : 10;
  // Dynamic colors based on theme
  const { themeMode } = useTheme();
  const palette = (themeMode === 'dark') ? ['#ffffff', '#000000'] : ['#000000', '#ffffff'];

  const canSubmit = useMemo(() => current.length === PEGS, [current]);

  const submit = () => {
    if (!canSubmit || win || lose) return;
    const s = scoreGuess(secret, current);
    const nextAttempts = [...attempts, current];
    const nextFeedbacks = [...feedbacks, s];
    setAttempts(nextAttempts);
    setFeedbacks(nextFeedbacks);
    if (s.exact === PEGS) {
      setWin(true);
      void award(xpForDifficulty(difficulty));
      setShowWin(true);
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 140, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start();
      return;
    }
    if (nextAttempts.length >= maxAttempts) {
      setLose(true);
      return;
    }
    setCurrent(Array.from({ length: PEGS }, () => 0));
  };

  const cycleColor = (i: number) => {
    if (win || lose) return;
    setCurrent(prev => {
      const next = [...prev];
      next[i] = (next[i] + 1) % palette.length;
      return next;
    });
  };

  const reset = () => {
    setSecret(generateSecret(palette.length));
    setAttempts([]);
    setFeedbacks([]);
    setCurrent(Array.from({ length: PEGS }, () => 0));
    setWin(false);
    setLose(false);
    setShowWin(false);
  };

  // Reset when re-entering the screen
  useFocusEffect(React.useCallback(() => {
    reset();
    return () => {};
  }, []));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GameHeader
        onBack={() => router.replace('/(tabs)/games/LogicTrainingScreen')}
        gameTitle="Mastermind"
        gameDescription="Guess the hidden code by deduction. Use feedback to narrow down possibilities."
        gameInstructions="Create a 4-peg code using the available colors. Black dots = correct color and position, white dots = correct color only."
      />
      <View style={styles.gameContent}>
        <Text style={[styles.title, { color: theme.text }]}>Mastermind</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Guess the {PEGS}-peg code in {maxAttempts} attempts</Text>

        <View style={styles.board}>
          {attempts.map((g, idx) => (
            <View key={idx} style={styles.row}>
              <View style={styles.pegs}>
                {g.map((c, i) => (
                  <View key={i} style={[styles.peg, { backgroundColor: palette[c] }]} />
                ))}
              </View>
              <View style={styles.feedback}>
                <Text style={[styles.feedbackText, { color: theme.text }]}>● {feedbacks[idx].exact}</Text>
                <Text style={[styles.feedbackText, { color: theme.text }]}>○ {feedbacks[idx].colorOnly}</Text>
              </View>
            </View>
          ))}

          {!win && !lose && (
            <View style={styles.row}>
              <View style={styles.pegs}>
                {current.map((c, i) => (
                  <TouchableOpacity key={i} style={[styles.peg, { backgroundColor: palette[c] }]} onPress={() => cycleColor(i)} />
                ))}
              </View>
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={submit}>
                <Text style={[styles.submitText, { color: theme.buttonText }]}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <Modal visible={lose} transparent animationType="fade" onRequestClose={() => setLose(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, alignItems: 'center' }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Failed</Text>
            <Text style={styles.modalText}>Out of attempts. Secret code was:</Text>
            <View style={[styles.pegs, { marginTop: 10, marginBottom: 10 }]}>
              {secret.map((c, i) => (<View key={i} style={[styles.peg, { backgroundColor: palette[c] }]} />))}
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => { setLose(false); reset(); }}>
              <Text style={styles.primaryText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#fff', marginTop: 8 }]} onPress={() => router.replace('/(tabs)/games/LogicTrainingScreen')}>
              <Text style={[styles.primaryText, { color: '#111' }]}>Go to Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showWin} transparent animationType="fade" onRequestClose={() => setShowWin(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, alignItems: 'center' }]}>
            <WinPulse active />
            <Text style={[styles.resultTitle, { color: theme.text }]}>Congratulations!</Text>
            <Text style={[styles.resultText, { color: theme.textSecondary }]}>You cracked the code • +{xpForDifficulty(difficulty)} XP</Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={() => { setShowWin(false); reset(); }}>
              <Text style={[styles.primaryText, { color: theme.buttonText }]}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.surface, marginTop: 8 }]} onPress={() => { setShowWin(false); router.replace('/(tabs)/games/LogicTrainingScreen'); }}>
              <Text style={[styles.primaryText, { color: theme.text }]}>Go to Main Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showHelp} transparent animationType="fade" onRequestClose={() => setShowHelp(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>How to Play</Text>
            <Text style={[styles.modalText, { color: theme.textSecondary }]}>
              Tap each peg to cycle through colors. Submit to receive feedback: ● exact matches (right color, right position),
              ○ color-only matches (right color, wrong position). Use feedback to deduce the hidden code within {maxAttempts} attempts.
            </Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={() => setShowHelp(false)}>
              <Text style={[styles.primaryText, { color: theme.buttonText }]}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameContent: {
    flex: 1,
    paddingTop: 20,
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: '900', marginTop: 24 },
  subtitle: { fontSize: 14, marginTop: 6 },
  board: { width: Math.min(420, width - 24), marginTop: 18 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  pegs: { flexDirection: 'row', gap: 10, alignItems: 'center', flex: 1 },
  peg: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.2)' },
  feedback: { flexDirection: 'row', gap: 12, },
  feedbackText: { fontWeight: '800' },
  submitBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  submitText: { fontWeight: '800' },
  resultBox: { marginTop: 10, alignItems: 'center' },
  resultTitle: { fontSize: 20, fontWeight: '900', marginBottom: 6 },
  resultText: { fontSize: 16, fontWeight: '900', marginBottom: 10 },
  primaryBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  primaryText: { fontWeight: '800' },
  secretLabel: { marginTop: 8 },
  modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalCard: { padding: 18, borderRadius: 14, width: '86%' },
  modalTitle: { fontSize: 18, fontWeight: '900', marginBottom: 8 },
  modalText: { fontSize: 14, lineHeight: 20 }
});


