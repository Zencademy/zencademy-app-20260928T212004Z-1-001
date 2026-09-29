import { sessionXp, partialSessionXp, coinsForXp } from '../../../../lib/progression';
import { useGameReward } from '../../../../hooks/useGameReward';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GameHeader from '../../../../components/GameHeader';
import { useTheme } from '../../../../components/ThemeContext';
import { useXP } from '../../../../components/XPContext';

const { width } = Dimensions.get('window');
// Hard: flat +20 on success; plan bonuses (Lite +10, Elite +25)
const BASE_REWARD_HARD = 28;
const GRID_ROWS = 4;
const GRID_COLS = 6;
const TOTAL_CELLS = GRID_ROWS * GRID_COLS;
const INIT_SEQ = 3;
const MAX_SEQ = 8;
const SHOW_TIME = 700;

function getRandomSequence(len: number) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * TOTAL_CELLS));
}

export default function SequenceRecallGame() {
  const { incrementCompletedGame, plan } = useXP();
  const { award, awardFor, reset: resetReward } = useGameReward();
  const router = useRouter();
  const { theme } = useTheme();
  const [seqLen, setSeqLen] = useState(INIT_SEQ);
  const [sequence, setSequence] = useState(getRandomSequence(INIT_SEQ));
  const [showSequence, setShowSequence] = useState(true);
  const [sequenceStep, setSequenceStep] = useState(-1);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [failed, setFailed] = useState(false);
  const [score, setScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (showSequence) {
      setUserInput([]);
      setSequenceStep(0);
      if (timerRef.current) clearTimeout(timerRef.current);
      let step = 0;
      const showNext = () => {
        setSequenceStep(step);
        step++;
        if (step < sequence.length) {
          timerRef.current = setTimeout(showNext, SHOW_TIME);
        } else {
          timerRef.current = setTimeout(() => {
            setShowSequence(false);
            setSequenceStep(-1);
          }, SHOW_TIME);
        }
      };
      timerRef.current = setTimeout(showNext, SHOW_TIME);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showSequence, sequence]);

  const handleCellPress = (idx: number) => {
    if (showSequence || sequenceStep !== -1 || gameOver) return;
    const currentStep = userInput.length;
    if (idx !== sequence[currentStep]) {
      setFailed(true);
      setGameOver(true);
      return;
    }
    const nextInput = [...userInput, idx];
    setUserInput(nextInput);
    if (nextInput.length === sequence.length) {
      if (seqLen < MAX_SEQ) {
        setTimeout(() => {
          setSeqLen(seqLen + 1);
          setSequence(getRandomSequence(seqLen + 1));
          setShowSequence(true);
          setScore(score + 1);
        }, 800);
      } else {
        setGameOver(true);
        setFailed(false);
        setScore(score + 1);
        const planBonus = plan === 'elite' ? 25 : (plan === 'lite' ? 10 : 0);
        void awardFor('Hard');
        incrementCompletedGame({ category: 'memory', difficulty: 'hard' });
      }
    }
  };

  const handleRestart = () => {
    setSeqLen(INIT_SEQ);
    setSequence(getRandomSequence(INIT_SEQ));
    setShowSequence(true);
    setSequenceStep(0);
    setUserInput([]);
    setGameOver(false);
    setFailed(false);
    setScore(0);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GameHeader
        onBack={() => router.replace('/games/MemoryTrainingScreen')}
        gameTitle="Sequence Recall"
        gameDescription="Memorize the sequence and repeat it in order."
        gameInstructions="Watch the flashing circles, then tap them in the same order. Win to earn +20 XP (Lite +10, Elite +25)."
      />
      <View style={styles.gameContent}>
        <Text style={[styles.header, { color: theme.text }]}>Sequence Recall</Text>
        <Text style={[styles.subheader, { color: theme.textSecondary }]}>Memorize the sequence. Tap the circles in order.</Text>
        <View style={styles.gridWrap}>
          <View style={styles.grid}>
            {Array.from({ length: TOTAL_CELLS }).map((_, idx) => {
              let highlight = false;
              const sequenceHighlight = showSequence && sequenceStep >= 0 && sequence[sequenceStep] === idx;
              if (sequenceHighlight) highlight = true;
              if (!showSequence && userInput.includes(idx)) highlight = true;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.cell,
                    { borderColor: theme.border },
                    sequenceHighlight
                      ? { backgroundColor: theme.primary }
                      : highlight
                        ? { backgroundColor: theme.accent }
                        : { backgroundColor: theme.card }
                  ]}
                  onPress={() => handleCellPress(idx)}
                  activeOpacity={showSequence || gameOver ? 1 : 0.7}
                >
                  <Text style={[styles.cellText, { color: theme.text }]}>{''}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <Text style={[styles.progress, { color: theme.text }]}>Level: {seqLen - INIT_SEQ + (gameOver && !failed ? 1 : 0)} / {MAX_SEQ - INIT_SEQ + 1} | Score: {score}</Text>
        {gameOver && (
          <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
            <Text style={[styles.resultTitle, { color: theme.text }]}>{failed ? '✘ Game Over!' : '✔️ Great memory!'}</Text>
            <Text style={[styles.resultScore, { color: theme.textSecondary }]}>Max Level: {seqLen - INIT_SEQ + (failed ? 0 : 1)}</Text>
            {!failed && (
              <>
                <Text style={[styles.xpText, { color: theme.text }]}>+{BASE_REWARD_HARD} XP (game)</Text>
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
  progress: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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