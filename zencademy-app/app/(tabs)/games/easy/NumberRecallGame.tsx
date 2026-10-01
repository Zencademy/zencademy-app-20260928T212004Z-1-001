import { sessionXp, partialSessionXp, coinsForXp } from '../../../../lib/progression';
import { useGameReward } from '../../../../hooks/useGameReward';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GameHeader from '../../../../components/GameHeader';
import { useTheme } from '../../../../components/ThemeContext';
import { useXP } from '../../../../components/XPContext';

const { width } = Dimensions.get('window');
const DIGIT_COUNT = 7;
const SHOW_TIME = 2000;
// Easy: flat +10 on success; plan bonuses (Lite +10, Elite +25)
const BASE_REWARD_EASY = 12;

function generateDigits(count: number) {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 10));
}

export default function NumberRecallGame() {
  const { incrementCompletedGame, plan } = useXP();
  const { award, awardFor, reset: resetReward } = useGameReward();
  const router = useRouter();
  const { theme } = useTheme();
  const [digits, setDigits] = useState(generateDigits(DIGIT_COUNT));
  const [showDigits, setShowDigits] = useState(true);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [failed, setFailed] = useState(false);
  const [streak, setStreak] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    setShowDigits(true);
    setUserInput([]);
    setGameOver(false);
    setFailed(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowDigits(false);
    }, SHOW_TIME);
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [digits]);

  const handleDigitPress = (n: number) => {
    if (showDigits || gameOver) return;
    const nextInput = [...userInput, n];
    setUserInput(nextInput);
    if (n !== digits[userInput.length]) {
      setFailed(true);
      setGameOver(true);
      setStreak(0);
      return;
    }

    if (nextInput.length === digits.length) {
      setGameOver(true);
      setFailed(false);
      const planBonus = plan === 'elite' ? 25 : (plan === 'lite' ? 10 : 0);
      void awardFor('Easy');
      incrementCompletedGame({ category: 'memory', difficulty: 'easy' });
      setStreak(streak + 1);
    }
  };

  const handleRestart = () => {
    setDigits(generateDigits(DIGIT_COUNT));
    setShowDigits(true);
    setUserInput([]);
    setGameOver(false);
    setFailed(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GameHeader
        onBack={() => router.replace('/games/MemoryTrainingScreen')}
        gameTitle="Number Recall Easy"
        gameDescription="Test your memory by memorizing and recalling sequences of numbers."
        gameInstructions="Memorize the sequence of numbers shown, then tap them in the correct order. Win to earn +10 points (Lite +10, Elite +25)."
      />
      <View style={styles.gameContent}>
        <Text style={[styles.header, { color: theme.text }]}>Number Recall</Text>
      <Text style={[styles.subheader, { color: theme.textSecondary }]}>Memorize the sequence. Tap the digits in order.</Text>
      <View style={styles.digitsWrap}>
        {showDigits ? (
          <View style={styles.digitsRow}>
            <View style={styles.digitsLine}>
              {digits.slice(0, 4).map((d, i) => (
                <View key={i} style={[styles.digitBox, { backgroundColor: theme.primary }]}>
                  <Text style={[styles.digitText, { color: theme.buttonText }]}>{d}</Text>
                </View>
              ))}
            </View>
            <View style={styles.digitsLine}>
              {digits.slice(4).map((d, i) => (
                <View key={i + 4} style={[styles.digitBox, { backgroundColor: theme.primary }]}>
                  <Text style={[styles.digitText, { color: theme.buttonText }]}>{d}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.digitsRow}>
            <View style={styles.digitsLine}>
              {userInput.slice(0, 4).map((d, i) => (
                <View key={i} style={[styles.inputBox, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.inputText, { color: theme.text }]}>{d}</Text>
                </View>
              ))}
              {Array.from({ length: Math.max(0, 4 - userInput.length) }).map((_, i) => (
                <View key={i + userInput.length} style={[styles.inputBoxEmpty, { backgroundColor: theme.card }]} />
              ))}
            </View>
            <View style={styles.digitsLine}>
              {userInput.slice(4).map((d, i) => (
                <View key={i + 4} style={[styles.inputBox, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.inputText, { color: theme.text }]}>{d}</Text>
                </View>
              ))}
              {Array.from({ length: Math.max(0, 3 - Math.max(0, userInput.length - 4)) }).map((_, i) => (
                <View key={i + 4 + userInput.slice(4).length} style={[styles.inputBoxEmpty, { backgroundColor: theme.card }]} />
              ))}
            </View>
          </View>
        )}
      </View>
      {!showDigits && !gameOver && (
        <View style={styles.keypad}>
          {Array.from({ length: 10 }).map((_, n) => (
            <TouchableOpacity
              key={n}
              style={[styles.keyBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => handleDigitPress(n)}
            >
              <Text style={[styles.keyText, { color: theme.text }]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {gameOver && (
        <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
          <Text style={[styles.resultTitle, { color: theme.text }]}>{failed ? '✘ Game Over!' : '✔️ Great memory!'}</Text>
          <Text style={[styles.resultScore, { color: theme.textSecondary }]}>Sequence: {digits.join(' ')}</Text>
          {!failed && (
            <>
              <Text style={[styles.xpText, { color: theme.text }]}>+{BASE_REWARD_EASY} XP (game)</Text>
              {plan === 'elite' && <Text style={[styles.xpText, { color: theme.text }]}>+25 XP (Elite bonus)</Text>}
              {plan === 'lite' && <Text style={[styles.xpText, { color: theme.text }]}>+10 XP (Lite bonus)</Text>}
            </>
          )}
          <TouchableOpacity style={[styles.restartBtn, { backgroundColor: theme.primary }]} onPress={handleRestart}>
            <Text style={[styles.restartText, { color: theme.buttonText }]}>{failed ? 'Play Again' : 'Play Again'}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
  digitsWrap: {
    marginTop: 32,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitsRow: {
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
  },
  digitsLine: {
    flexDirection: 'row',
    gap: 12,
  },
  digitBox: {
    width: 44,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  digitText: {
    fontWeight: 'bold',
    fontSize: 32,
    letterSpacing: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputBox: {
    width: 44,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  inputBoxEmpty: {
    width: 44,
    height: 56,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  inputText: {
    fontWeight: 'bold',
    fontSize: 32,
    letterSpacing: 2,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: width - 48,
    justifyContent: 'center',
    marginTop: 18,
  },
  keyBtn: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  keyText: {
    fontWeight: 'bold',
    fontSize: 24,
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
