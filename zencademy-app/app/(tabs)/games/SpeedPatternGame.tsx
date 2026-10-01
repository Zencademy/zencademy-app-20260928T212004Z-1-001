import { sessionXp, partialSessionXp, coinsForXp } from '../../../lib/progression';
import { useGameReward } from '../../../hooks/useGameReward';
import { WinPulse } from '../../../components/WinPulse';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GameHeader from '../../../components/GameHeader';
import { useTheme } from '../../../components/ThemeContext';
import { useXP } from '../../../components/XPContext';
import { playSfx } from '../../../lib/sound/SoundPack';

const WIN_XP = 28; // Hard
const GRID = 5; // more tiles (5x5)

function makePattern() {
  const total = GRID * GRID;
  const target = Math.max(5, Math.floor(total * 0.32)); // ~32% active, at least 5
  const active: Set<number> = new Set();
  while (active.size < target) active.add(Math.floor(Math.random() * total));
  return Array.from({ length: total }).map((_, i) => active.has(i));
}

export default function SpeedPatternGame() {
  const router = useRouter();
  const { plan } = useXP();
  const { award, awardFor, reset: resetReward } = useGameReward();
  const { theme } = useTheme();
  const [pattern, setPattern] = useState<boolean[]>(makePattern());
  const [selection, setSelection] = useState<boolean[]>(Array(GRID * GRID).fill(false));
  const [time, setTime] = useState(5);
  const [showWin, setShowWin] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const reset = () => { setPattern(makePattern()); setSelection(Array(GRID * GRID).fill(false)); setTime(5); setShowWin(false); };
  useFocusEffect(React.useCallback(() => { reset(); return () => {}; }, []));

  useEffect(() => {
    if (time <= 0) {
      const ok = selection.every((v, i) => v === pattern[i]);
      if (ok) { playSfx('correct'); void awardFor('Hard'); setShowWin(true); } else { playSfx('wrong'); reset(); }
      return;
    }
    const t = setTimeout(() => setTime(time - 1), 1000);
    return () => clearTimeout(t);
  }, [time]);

  const toggle = (i: number) => {
    setSelection(prev => { const n = [...prev]; n[i] = !n[i]; return n; });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GameHeader
        onBack={() => router.replace('/(tabs)/games/SpeedTrainingScreen')}
        gameTitle="Speed Pattern"
        gameDescription="Memorize the highlighted grid pattern and reproduce it quickly."
        gameInstructions="Look at the top pattern, then tap cells below to match it before time runs out."
      />

      <View style={styles.gameContent}>
        <Text style={[styles.title, { color: theme.text }]}>Speed Pattern</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Replicate the highlighted pattern in {time}s</Text>

        <View style={[styles.grid, { borderColor: theme.border }]}>
          {pattern.map((on, i) => (
            <View
              key={i}
              style={[
                styles.cell,
                { borderColor: theme.border },
                on ? { backgroundColor: theme.primary } : { backgroundColor: theme.surface }
              ]}
            />
          ))}
        </View>
        <Text style={[styles.caption, { color: theme.text }]}>Pattern</Text>
        <View style={[styles.grid, { marginTop: 8, borderColor: theme.border }]}>
          {selection.map((on, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.cell,
                { borderColor: theme.border },
                on ? { backgroundColor: theme.primary } : { backgroundColor: theme.card }
              ]}
              onPress={() => toggle(i)}
              activeOpacity={0.7}
            />
          ))}
        </View>
        <Text style={[styles.caption, { color: theme.text }]}>Your Selection</Text>
      </View>

      <Modal visible={showWin} transparent animationType="fade" onRequestClose={() => setShowWin(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, alignItems: 'center' }]}> 
            <WinPulse active />
            <Text style={[styles.winTitle, { color: theme.text }]}>Great speed!</Text>
            <Text style={[styles.winText, { color: theme.primary }]}>+{WIN_XP} XP</Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={() => { setShowWin(false); reset(); }}>
              <Text style={[styles.primaryText, { color: theme.buttonText }]}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.surface, marginTop: 8 }]} onPress={() => { setShowWin(false); router.replace('/(tabs)/games/SpeedTrainingScreen'); }}>
              <Text style={[styles.primaryText, { color: theme.text }]}>Go to Main Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showHelp} transparent animationType="fade" onRequestClose={() => setShowHelp(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.helpTitle, { color: theme.text }]}>How to Play</Text>
            <Text style={[styles.helpTextP, { color: theme.textSecondary }]}>Look at the top pattern. Tap to toggle cells below and match it before time runs out.</Text>
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
  container: { flex: 1 },
  gameContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '900', marginTop: 24 },
  subtitle: { fontSize: 14, marginTop: 6 },
  grid: { width: 250, height: 250, flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, borderWidth: 1 },
  cell: { width: 49, height: 49, borderWidth: 1, margin: 0 },
  caption: { marginTop: 8, fontWeight: '800' },
  modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modalCard: { padding: 18, borderRadius: 14, width: '86%' },
  winTitle: { fontSize: 22, fontWeight: '900', marginBottom: 6, textAlign: 'center' },
  winText: { fontSize: 14, marginBottom: 10, textAlign: 'center' },
  primaryBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, alignSelf: 'center' },
  primaryText: { fontWeight: '800' },
  helpTitle: { fontSize: 18, fontWeight: '900', marginBottom: 8 },
  helpTextP: { fontSize: 14, lineHeight: 20 }
});


