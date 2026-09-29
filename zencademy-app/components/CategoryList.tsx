import { ExerciseScreen } from './ExerciseScreen';
import { CATEGORY_COPY } from '../lib/catalogCopy';

export function CategoryList({ category }: { category: string }) {
  const copy = CATEGORY_COPY[category] ?? { title: 'Training', subtitle: 'Choose a set that matches your XP.', back: '/TrainingHub' };
  return <ExerciseScreen title={copy.title} subtitle={copy.subtitle} category={category} backTo={copy.back} />;
}
