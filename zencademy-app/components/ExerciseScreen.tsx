import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { coinsForXp, exercisesForCategory, isExerciseUnlocked, rewardXpFor, unlockXpFor } from '../lib/progression';
import { useTheme } from './ThemeContext';
import { useXP } from './XPContext';
import { EmptyState } from './ui/EmptyState';
import { FadeRise } from './ui/motion';
import { Screen } from './ui/Screen';
import { type } from './ui/type';

export function ExerciseScreen({
  title,
  subtitle,
  category,
  backTo,
}: {
  title: string;
  subtitle: string;
  category: string;
  backTo: string;
}) {
  const { theme } = useTheme();
  const { level } = useXP();
  const router = useRouter();
  const exercises = exercisesForCategory(category);

  return (
    <Screen title={title} subtitle={subtitle} backTo={backTo}>
      {exercises.length === 0 ? (
        <FadeRise>
          <EmptyState
            icon="construct-outline"
            title="Path in preparation"
            body="This category is being built. Your XP and coins stay saved — come back after the next update."
          />
        </FadeRise>
      ) : exercises.map((exercise, index) => {
        const open = isExerciseUnlocked(level, exercise.difficulty);
        const needed = unlockXpFor(exercise.difficulty);
        const levelsLeft = Math.max(0, needed - level);
        const xpGain = rewardXpFor(exercise.difficulty);
        const coinGain = coinsForXp(xpGain);
        return (
          <FadeRise key={exercise.id} delay={Math.min(index * 55, 280)}>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => (open ? router.push(exercise.route as never) : undefined)}
              style={{
                borderRadius: 16,
                padding: 16,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: open ? theme.primary : theme.border,
                opacity: open ? 1 : 0.72,
                gap: 6,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <Text style={[type.card, { color: theme.text, flex: 1 }]}>{exercise.title}</Text>
                <View style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: open ? theme.surface : theme.border, borderWidth: 1, borderColor: open ? theme.primary : theme.border }}>
                  <Text style={[type.label, { color: open ? theme.primary : theme.textSecondary }]}>{open ? exercise.difficulty : `Lv ${needed}`}</Text>
                </View>
              </View>
              <Text style={[type.body, { color: theme.textSecondary }]}>{exercise.description}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name={open ? 'lock-open-outline' : 'lock-closed-outline'} size={14} color={theme.textTertiary} />
                  <Text style={[type.label, { color: theme.textTertiary, fontWeight: '500' }]}>
                    {open
                      ? 'Ready'
                      : levelsLeft === 1
                        ? `Locked · 1 level to go (Lv ${needed})`
                        : `Locked · ${levelsLeft} levels to go (Lv ${needed})`}
                  </Text>
                </View>
                {open ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[type.label, { color: theme.primary, fontWeight: '700' }]}>+{xpGain} XP</Text>
                    <Text style={[type.label, { color: theme.coin, fontWeight: '700' }]}>+{coinGain} coins</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          </FadeRise>
        );
      })}
    </Screen>
  );
}
