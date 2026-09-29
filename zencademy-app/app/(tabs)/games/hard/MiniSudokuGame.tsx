import { sessionXp, partialSessionXp, coinsForXp } from '../../../../lib/progression';
import { useGameReward } from '../../../../hooks/useGameReward';
import { WinPulse } from '../../../../components/WinPulse';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GameHeader from '../../../../components/GameHeader';
import { useTheme } from '../../../../components/ThemeContext';
import { useXP } from '../../../../components/XPContext';

const STREAK_TO_WIN = 5;
const XP_PER_CORRECT = 15; // hard games: +15 points per correct answer
const XP_REWARD = 28;
const MAX_XP = 28;
const FULL_WIDTH = Dimensions.get('window').width;

// Each puzzle: { board: 4x4 array (0=empty), solution: 4x4 array }
const PUZZLES = [
  {
    board: [
      [0, 0, 2, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [3, 4, 0, 0],
    ],
    solution: [
      [4, 3, 2, 1],
      [2, 1, 4, 3],
      [1, 2, 3, 4],
      [3, 4, 1, 2],
    ],
  },
  {
    board: [
      [0, 0, 0, 0],
      [0, 0, 0, 2],
      [0, 0, 0, 0],
      [0, 3, 4, 0],
    ],
    solution: [
      [2, 4, 3, 1],
      [4, 1, 2, 3],
      [3, 2, 1, 4],
      [1, 3, 4, 2],
    ],
  },
  {
    board: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    solution: [
      [1, 2, 3, 4],
      [2, 3, 4, 1],
      [3, 4, 1, 2],
      [4, 1, 2, 3],
    ],
  },
  {
    board: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    solution: [
      [4, 1, 2, 3],
      [3, 2, 1, 4],
      [2, 3, 4, 1],
      [1, 4, 3, 2],
    ],
  },
  {
    board: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    solution: [
      [2, 3, 4, 1],
      [1, 4, 3, 2],
      [4, 1, 2, 3],
      [3, 2, 1, 4],
    ],
  },
];

function getRandomPuzzle(usedIds: number[] = []) {
  const pool = PUZZLES.filter((_, i) => !usedIds.includes(i));
  if (pool.length === 0) return null;
  const idx = Math.floor(Math.random() * pool.length);
  return { ...pool[idx], _id: PUZZLES.indexOf(pool[idx]) };
}

export default function MiniSudokuGame() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { plan } = useXP();
  const { award, awardFor, reset: resetReward } = useGameReward();
  const { theme } = useTheme();
  const [currentP, setCurrentP] = useState<any>(null);
  const [usedIds, setUsedIds] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [userBoard, setUserBoard] = useState<number[][]>([]);
  const [win, setWin] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const difficulty = (params.difficulty as string) || 'easy';
  function xpForDifficulty(level: string) {
    if (level === 'hard') return sessionXp('Hard');
    if (level === 'medium') return sessionXp('Medium');
    return sessionXp('Easy');
  }
  const cardAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => { startGame(); }, []);

  function startGame() {
    const p = getRandomPuzzle();
    setCurrentP(p);
    setUsedIds(p ? [p._id] : ([] as number[]));
    setStreak(0);
    setWrong(false);
    setShowConfetti(false);
    setXpAwarded(false);
    setSelectedCell(null);
    setWin(false);
    setFeedback('');
    setUserBoard(p ? p.board.map((row: number[]) => [...row]) : []);
    Animated.timing(cardAnim, { toValue: 1, duration: 0, useNativeDriver: true }).start();
  }

  function nextPuzzle() {
    const p = getRandomPuzzle(usedIds);
    if (!p) {
      setUsedIds([] as number[]);
      const fresh = getRandomPuzzle();
      setCurrentP(fresh);
      setUsedIds(fresh ? [fresh._id] : ([] as number[]));
      setUserBoard(fresh ? fresh.board.map((row: number[]) => [...row]) : []);
    } else {
      setCurrentP(p);
      setUsedIds((prev: number[]) => ([...prev, p._id] as number[]));
      setUserBoard(p.board.map((row: number[]) => [...row]));
    }
    setSelectedCell(null);
    setWrong(false);
    setFeedback('');
    Animated.timing(cardAnim, { toValue: 0, duration: 0, useNativeDriver: true }).start(() => {
      Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, friction: 7, tension: 85 }).start();
    });
  }

  function handleCellPress(row: number, col: number) {
    if (currentP && currentP.board[row][col] !== 0) return; // can't edit prefilled
    setSelectedCell([row, col]);
  }

  function handleNumberInput(n: number) {
    if (!selectedCell) return;
    const [row, col] = selectedCell;
    setUserBoard(prev => {
      const newBoard = prev.map(r => [...r]);
      newBoard[row][col] = n;
      return newBoard;
    });
  }

  function handleErase() {
    if (!selectedCell) return;
    const [row, col] = selectedCell;
    setUserBoard(prev => {
      const newBoard = prev.map(r => [...r]);
      newBoard[row][col] = 0;
      return newBoard;
    });
  }

  function isBoardFull(board: number[][]) {
    return board.every(row => row.every(cell => cell !== 0));
  }

  function handleSubmit() {
    if (!currentP) return;
    if (!isBoardFull(userBoard)) {
      setFeedback('Fill all cells!');
      return;
    }
    // check solution
    const correct = userBoard.every((row, r) => row.every((cell, c) => cell === currentP.solution[r][c]));
    if (correct) {
      setFeedback('✔️ Correct!');
      setTimeout(() => {
        setStreak(s => {
          const newStreak = s + 1;
          if (newStreak >= STREAK_TO_WIN) {
            setWin(true);
          } else {
            nextPuzzle();
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
      void award(xpForDifficulty(difficulty));
      setShowConfetti(true);
      setXpAwarded(true);
    }
  }, [win, xpAwarded]);

  if (!currentP) return <View style={{ flex: 1, backgroundColor: theme.background }} />;

  if (wrong) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}> 
                <GameHeader
                  onBack={() => router.replace('/(tabs)/games/LogicTrainingScreen')}
          gameTitle="Mini Sudoku"
          gameDescription="Test your logic and problem-solving skills with a mini Sudoku puzzle."
          gameInstructions="Fill in the missing numbers following Sudoku rules. Each correct number gives you +15 points!"
        />
        <View style={[styles.gameContent, { justifyContent: 'center' }]}>
          <Text style={[styles.bigText, { color: theme.error, fontSize: 34 }]}>Wrong!</Text>
          <Text style={[styles.explanationWrong, { color: theme.textSecondary }]}>Check your solution and try again.</Text>
          <TouchableOpacity style={[styles.tryAgainBtn, { backgroundColor: theme.primary }]} onPress={startGame}>
            <Text style={[styles.tryAgainBtnText, { color: theme.buttonText }]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (win) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}> 
                <GameHeader
                  onBack={() => router.replace('/(tabs)/games/LogicTrainingScreen')}
          gameTitle="Mini Sudoku"
          gameDescription="Test your logic and problem-solving skills with a mini Sudoku puzzle."
          gameInstructions="Fill in the missing numbers following Sudoku rules. Each correct number gives you +15 points!"
        />
        <View style={[styles.gameContent, { justifyContent: 'center', alignItems: 'center' }]}>
          {showConfetti && (
            <WinPulse active />
          )}
          <Text style={[styles.bigText, { color: theme.text, fontSize: 34, marginBottom: 18 }]}>You Win!</Text>
          <Text style={[styles.winText, { color: theme.textSecondary, fontSize: 18, marginBottom: 18, textAlign: 'center' }]}>Streak: {STREAK_TO_WIN} correct in a row</Text>
          <Text style={[styles.xpText, { color: theme.primary, fontSize: 18, fontWeight: '700', marginBottom: 18 }]}>+{xpForDifficulty(difficulty)} XP</Text>
          <TouchableOpacity style={[styles.tryAgainBtn, { backgroundColor: theme.primary }]} onPress={startGame}>
            <Text style={[styles.tryAgainBtnText, { color: theme.buttonText }]}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tryAgainBtn, { backgroundColor: 'transparent', borderWidth: 0, marginTop: 8 }]} onPress={() => router.replace('/(tabs)/games/LogicTrainingScreen')}>
            <Text style={[styles.tryAgainBtnText, { color: theme.textTertiary, fontWeight: '400' }]}>Back to Logic</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
              <GameHeader
                onBack={() => router.replace('/(tabs)/games/LogicTrainingScreen')}
        gameTitle="Mini Sudoku"
        gameDescription="Test your logic and problem-solving skills with a mini Sudoku puzzle."
        gameInstructions="Fill in the missing numbers following Sudoku rules. Each correct number gives you +15 points!"
      />
      <View style={styles.gameContent}>
        <Animated.View style={[styles.card, { backgroundColor: theme.card, transform: [{ scale: cardAnim }] }]}> 
        <Text style={[styles.streakText, { color: theme.textSecondary }]}>Streak: {streak} / {STREAK_TO_WIN}</Text>
        <View style={styles.grid}>
          {userBoard.map((row, r) => (
            <View key={r} style={styles.gridRow}>
              {row.map((cell, c) => {
                const isPrefilled = currentP.board[r][c] !== 0;
                const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
                return (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.cell,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      isPrefilled && { backgroundColor: theme.surface },
                      isSelected && { borderColor: theme.primary, borderWidth: 2.5 },
                    ]}
                    onPress={() => handleCellPress(r, c)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.cellText, { color: theme.text }, isPrefilled && { color: theme.textTertiary, fontWeight: '400' }]}>{cell !== 0 ? cell : ''}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
        <View style={styles.numpad}>
          {[1, 2, 3, 4].map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.numpadBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => handleNumberInput(n)}
              activeOpacity={0.7}
            >
              <Text style={[styles.numpadText, { color: theme.text }]}>{n}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.numpadBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={handleErase} activeOpacity={0.7}>
            <Text style={[styles.numpadText, { color: theme.textTertiary }]}>Erase</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleSubmit}>
          <Text style={[styles.submitText, { color: theme.buttonText }]}>Submit</Text>
        </TouchableOpacity>
        {!!feedback && <Text style={[styles.feedbackText, { color: theme.primary }]}>{feedback}</Text>}
        </Animated.View>
      </View>
      {/* Help Modal */}
      <Modal visible={showHelp} transparent animationType="fade" onRequestClose={() => setShowHelp(false)}>
        <View style={{ flex: 1, backgroundColor: theme.overlay, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: theme.card, padding: 18, borderRadius: 14, width: '86%' }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: theme.text, marginBottom: 8 }}>How to Play</Text>
            <Text style={{ fontSize: 14, color: theme.textSecondary, lineHeight: 20 }}>
              Fill the 4x4 grid so each row and column contains the numbers 1–4 without repetition. Tap a cell, then tap a number
              in the pad to place it. Submit when the board is complete.
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
  grid: {
    marginVertical: 18,
    borderRadius: 10,
    padding: 8,
    borderWidth: 1.5,
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    width: 48,
    height: 48,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    borderRadius: 8,
  },
  cellText: {
    fontSize: 22,
    fontFamily: 'SpaceMono-Regular',
    fontWeight: '700',
  },
  numpad: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  numpadBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  numpadText: {
    fontSize: 20,
    fontFamily: 'SpaceMono-Regular',
    fontWeight: '700',
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 18,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 18,
    fontWeight: '700',
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 2,
    textAlign: 'center',
  },
  explanationWrong: {
    fontSize: 18,
    marginTop: 18,
    textAlign: 'center',
    fontWeight: '600',
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