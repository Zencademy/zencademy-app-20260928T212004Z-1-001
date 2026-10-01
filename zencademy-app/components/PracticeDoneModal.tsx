import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from './ThemeContext';
import { CoachNote } from './CoachNote';
import { WinPulse } from './WinPulse';
import { useGameReward } from '../hooks/useGameReward';
import { EXERCISES, type Difficulty } from '../lib/progression';
import { type } from './ui/type';

const HARD_PHYSICAL = new Set(['strength', 'endurance', 'coordination', 'mobility']);

/**
 * Shared completion sheet for timed practice (breathing / stretch / cardio).
 * Awards server-confirmed XP once when `visible` becomes true.
 */
export function PracticeDoneModal({
  visible,
  difficulty,
  activityId,
  started = false,
  title = 'Session complete',
  onAgain,
  onExit,
}: {
  visible: boolean;
  difficulty: Difficulty;
  /** Catalog id; resolved from route when omitted. */
  activityId?: string;
  started?: boolean;
  title?: string;
  onAgain: () => void;
  onExit: () => void;
}) {
  const router = useRouter();
  const { theme } = useTheme();
  const { awardFor, reset, start, last, error, busy: saving, activityId: resolved, estimateXp, estimateCoins } =
    useGameReward(activityId, false);
  const resolvedId = activityId || resolved;
  const exercise = resolvedId ? EXERCISES.find(e => e.id === resolvedId) : null;

  useEffect(() => {
    if (started) {
      reset();
      void start();
    }
  }, [started, reset, start]);
  const [busy, setBusy] = useState(false);
  const xp = last?.xp ?? estimateXp(difficulty);
  const coins = last?.coins ?? estimateCoins(difficulty);

  const showCalm =
    difficulty === 'Hard' || (exercise?.category ? HARD_PHYSICAL.has(exercise.category) : false);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    // Intentionally kick off claim when the sheet opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busy flag for network claim
    setBusy(true);
    void awardFor(difficulty)
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, difficulty]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onExit}>
      <View style={[styles.backdrop, { backgroundColor: theme.overlay }]}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={{ height: 100, width: '100%', marginBottom: 8 }}>
            <WinPulse active={visible} />
          </View>
          <Text style={[type.title, { color: theme.text, fontSize: 22, textAlign: 'center' }]}>{title}</Text>
          <Text style={[type.body, { color: theme.textSecondary, textAlign: 'center', marginTop: 8 }]}>
            {busy
              ? 'Saving reward…'
              : error
                ? error
                : last
                  ? `+${xp} XP · +${coins} coins`
                  : 'Waiting for confirmation…'}
          </Text>
          <CoachNote activityId={resolvedId} />
          {error ? (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: theme.primary, marginTop: 12 }]}
              onPress={() => {
                setBusy(true);
                void awardFor(difficulty)
                  .catch(() => {})
                  .finally(() => setBusy(false));
              }}
              accessibilityLabel="Retry saving reward"
            >
              <Text style={[type.button, { color: theme.buttonText }]}>Retry save</Text>
            </TouchableOpacity>
          ) : null}
          {showCalm ? (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, marginTop: 12 }]}
              onPress={() => {
                onExit();
                router.replace('/games/BoxBreathingGame' as never);
              }}
              accessibilityLabel="Two minute calm"
            >
              <Text style={[type.button, { color: theme.text }]}>2-min calm breathing</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.primary, marginTop: 12 }]}
            onPress={() => {
              reset();
              onAgain();
            }}
            disabled={saving}
            accessibilityLabel="Practice again"
          >
            <Text style={[type.button, { color: theme.buttonText }]}>Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.btn,
              { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, marginTop: 8 },
            ]}
            onPress={onExit}
            accessibilityLabel="Done with practice"
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
