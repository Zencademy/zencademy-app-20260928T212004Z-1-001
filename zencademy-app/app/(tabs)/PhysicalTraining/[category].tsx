import { useLocalSearchParams } from 'expo-router';
import { ExerciseScreen } from '../../../components/ExerciseScreen';
import { CATEGORY_COPY } from '../../../lib/catalogCopy';

const LEGACY: Record<string, string> = {
  MobilityTrainingScreen: 'mobility',
  StrengthTrainingScreen: 'strength',
  StretchingTrainingScreen: 'stretching',
  BreathingTrainingScreen: 'breathing',
  EnduranceTrainingScreen: 'endurance',
  BalanceTrainingScreen: 'balance',
  CoordinationTrainingScreen: 'coordination',
  RelaxationTrainingScreen: 'relaxation',
  PostureTrainingScreen: 'posture',
};

export default function LegacyPhysicalList() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const key = LEGACY[String(category || '')] || String(category || 'mobility');
  const copy = CATEGORY_COPY[key] ?? { title: 'Training', subtitle: 'Choose a set that matches your XP.', back: '/PhysicalTrainingScreen' };
  return <ExerciseScreen title={copy.title} subtitle={copy.subtitle} category={key} backTo={copy.back} />;
}
