import { useLocalSearchParams } from 'expo-router';
import { ExerciseScreen } from '../../../components/ExerciseScreen';
import { CATEGORY_COPY } from '../../../lib/catalogCopy';

export default function ExerciseCatalog() {
  const params = useLocalSearchParams<{ category?: string }>();
  const category = String(params.category || 'attention');
  const copy = CATEGORY_COPY[category] ?? { title: 'Training', subtitle: 'Choose a set that matches your XP.', back: '/TrainingHub' };
  return <ExerciseScreen title={copy.title} subtitle={copy.subtitle} category={category} backTo={copy.back} />;
}
