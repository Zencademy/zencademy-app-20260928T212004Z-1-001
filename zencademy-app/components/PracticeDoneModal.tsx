import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from './ThemeContext';
import { WinPulse } from './WinPulse';
import { useGameReward } from '../hooks/useGameReward';
import { coinsForXp, type Difficulty, sessionXp } from '../lib/progression';
import { type } from './ui/type';

/**
 * Shared completion sheet for timed practice (breathing / stretch / cardio).
 * Awards canonical Easy/Medium/Hard XP once when `visible` becomes true.
 */
export function PracticeDoneModal({
  visible,
  difficulty,
  title = 'Session complete',
  onAgain,
  onExit,
}: {
  visible: boolean;
  difficulty: Difficulty;
  title?: string;
  onAgain: () => void;
  onExit: () => void;
}) {
  const { theme } = useTheme();
  const { awardFor, reset, last } = useGameReward();
  const [busy, setBusy] = useState(false);
  const xp = last?.xp ?? sessionXp(difficulty);
  const coins = last?.coins ?? coinsForXp(xp);

  useEffect(() => {
    if (!visible) {
      reset();
      return;
    }
    setBusy(true);
    void awardFor(difficulty).finally(() => setBusy(false));
  }, [visible, difficulty, awardFor, reset]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onExit}>
      <View style={[styles.backdrop, { backgroundColor: theme.overlay }]}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={{ height: 100, width: '100%', marginBottom: 8 }}>
            <WinPulse active={visible} />
          </View>
          <Text style={[type.title, { color: theme.text, fontSize: 22, textAlign: 'center' }]}>{title}</Text>
          <Text style={[type.body, { color: theme.textSecondary, textAlign: 'center', marginTop: 8 }]}>
            {busy ? 'Saving reward…' : `+${xp} XP · +${coins} coins`}
          </Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.primary, marginTop: 20 }]}
            onPress={() => {
              reset();
              onAgain();
            }}
          >
            <Text style={[type.button, { color: theme.buttonText }]}>Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, marginTop: 8 }]}
            onPress={onExit}
          >
            <Text style={[type.button, { color: theme.text }]}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    overflow: 'hidden',
  },
  btn: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
});
