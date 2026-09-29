import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GameHeader from '../../../../components/GameHeader';
import { useTheme } from '../../../../components/ThemeContext';
import { useXP } from '../../../../components/XPContext';

const { width } = Dimensions.get('window');
// Medium: flat +15 on success; plan bonuses (Lite +10, Elite +25)
const BASE_REWARD_MEDIUM = 15;
const GRID_ROWS = 4;
const GRID_COLS = 6;
const TOTAL_CELLS = GRID_ROWS * GRID_COLS;
const PATTERN_COUNT = 8;
const SHOW_TIME = 2000;

function getRandomPattern(count: number, total: number) {
  const arr = Array.from({ length: total }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

export default function GridPatternMemoryGame() {
  const { addXP, incrementCompletedGame, plan } = useXP();
  const router = useRouter();
  const { theme } = useTheme();
  const [pattern, setPattern] = useState(getRandomPattern(PATTERN_COUNT, TOTAL_CELLS));
  const [showPattern, setShowPattern] = useState(true);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [failed, setFailed] = useState(false);
  const [streak, setStreak] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    setShowPattern(true);
    setUserInput([]);
    setGameOver(false);
    setFailed(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowPattern(false);
    }, SHOW_TIME);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pattern]);

  const handleCellPress = (idx: number) => {
    if (showPattern || gameOver) return;
    let nextInput;
    if (userInput.includes(idx)) {
      nextInput = userInput.filter(i => i !== idx);
    } else {
      nextInput = [...userInput, idx];
    }
    setUserInput(nextInput);
    if (nextInput.length === PATTERN_COUNT) {
      // Check if userInput matches pattern (order doesn't matter)
      const correct = nextInput.every(i => pattern.includes(i)) && pattern.every(i => nextInput.includes(i));
      setGameOver(true);
      setFailed(!correct);
      if (correct) {
        const planBonus = plan === 'elite' ? 25 : (plan === 'lite' ? 10 : 0);
        addXP(BASE_REWARD_MEDIUM + planBonus);
        incrementCompletedGame({ category: 'memory', difficulty: 'medium' });
        setStreak(streak + 1);
      } else {
        setStreak(0);
      }
    }
  };

  const handleRestart = () => {
    setPattern(getRandomPattern(PATTERN_COUNT, TOTAL_CELLS));
    setShowPattern(true);
    setUserInput([]);
    setGameOver(false);
    setFailed(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GameHeader
        onBack={() => router.replace('/games/MemoryTrainingScreen')}
        gameTitle="Grid Pattern Memory"
        gameDescription="Test your memory by memorizing patterns on a grid and reproducing them."
        gameInstructions="Memorize the pattern shown on the grid, then tap the cells to reproduce it. Win to earn +15 XP (Lite +10, Elite +25)."
      />
      <View style={styles.gameContent}>
        <Text style={[styles.header, { color: theme.text }]}>Grid Pattern Memory</Text>
      <Text style={[styles.subheader, { color: theme.textSecondary }]}>Memorize the pattern. Tap the correct cells.</Text>
      <Text style={{ color: theme.textTertiary, fontSize: 15, marginBottom: 6 }}>Attempts: {streak}</Text>
      <View style={styles.gridWrap}>
        <View style={styles.grid}>
          {Array.from({ length: TOTAL_CELLS }).map((_, idx) => {
            let highlight = false;
            if (showPattern && pattern.includes(idx)) highlight = true;
            if (!showPattern && userInput.includes(idx)) highlight = true;
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.cell,
                  { borderColor: theme.border },
                  showPattern && pattern.includes(idx)
                    ? { backgroundColor: theme.primary }
                    : highlight
                      ? { backgroundColor: theme.accent }
                      : { backgroundColor: theme.card }
                ]}
                onPress={() => handleCellPress(idx)}
                activeOpacity={showPattern || gameOver ? 1 : 0.7}
              >
                <Text style={[styles.cellText, { color: theme.text }]}>{''}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      {gameOver && (
        <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
          <Text style={[styles.resultTitle, { color: theme.text }]}>{failed ? '✘ Game Over!' : '✔️ Great memory!'}</Text>
          <Text style={[styles.resultScore, { color: theme.textSecondary }]}>Pattern: {pattern.map(i => i + 1).join(', ')}</Text>
          {!failed && (
            <>
              <Text style={[styles.xpText, { color: theme.text }]}>+{BASE_REWARD_MEDIUM} XP (game)</Text>
              {plan === 'elite' && <Text style={[styles.xpText, { color: theme.text }]}>+25 XP (Elite bonus)</Text>}
              {plan === 'lite' && <Text style={[styles.xpText, { color: theme.text }]}>+10 XP (Lite bonus)</Text>}
            </>
          )}
          <TouchableOpacity style={[styles.restartBtn, { backgroundColor: theme.primary }]} onPress={handleRestart}>
            <Text style={[styles.restartText, { color: theme.buttonText }]}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => router.replace('/games/MemoryTrainingScreen')}>
            <Text style={[styles.menuText, { color: theme.text }]}>Main Menu</Text>
          </TouchableOpacity>
        </View>
      )}
      </View>
    </View>
  );
}

const CIRCLE_SIZE = Math.floor((width - 80) / GRID_COLS) - 8;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  subheader: {
    fontSize: 16,
    marginBottom: 18,
    textAlign: 'center',
    maxWidth: 320,
  },
  gridWrap: {
    marginTop: 32,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    width: '90%',
    maxWidth: CIRCLE_SIZE * GRID_COLS + 16,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 8,
    marginBottom: 24,
  },
  cell: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  cellText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 20,
    marginBottom: 8,
  },
  xpText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 18,
  },
  restartBtn: {
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginBottom: 12,
  },
  restartText: {
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1.1,
  },
  menuBtn: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  menuText: {
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1.1,
  },
}); 