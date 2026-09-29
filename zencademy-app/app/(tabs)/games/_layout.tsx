import { Slot, usePathname, useRouter } from 'expo-router';
import { Text } from 'react-native';
import { useTheme } from '../../../components/ThemeContext';
import { useXP } from '../../../components/XPContext';
import { PrimaryButton, Screen } from '../../../components/ui/Screen';
import { type } from '../../../components/ui/type';
import { exerciseForRoute, unlockLevelFor } from '../../../lib/progression';

export default function GamesLayout() {
  const path = usePathname();
  const exercise = exerciseForRoute(path);
  const { level } = useXP();
  const { theme } = useTheme();
  const router = useRouter();
  if (!exercise) return <Slot />;
  const needed = unlockLevelFor(exercise.difficulty);
  if (level >= needed) return <Slot />;
  return (
    <Screen title="Locked" subtitle={exercise.title} backTo="/TrainingHub" wallet>
      <Text style={[type.body, { color: theme.textSecondary }]}>
        This set opens at level {needed}. You are level {level}. Coins cannot unlock it.
      </Text>
      <PrimaryButton label="Back to training" onPress={() => router.push('/TrainingHub')} />
    </Screen>
  );
}
