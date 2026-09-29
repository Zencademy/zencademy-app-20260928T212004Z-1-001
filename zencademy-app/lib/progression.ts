export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Exercise = {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  route: string;
  category: string;
};

/** Level opens harder sets. Coins are separate and never unlock training. */
export const UNLOCK_LEVEL: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 5,
};

/** @deprecated Prefer UNLOCK_LEVEL — kept for older copy references. */
export const UNLOCK_XP: Record<Difficulty, number> = {
  Easy: 0,
  Medium: 2,
  Hard: 5,
};

export const REWARD_XP: Record<Difficulty, number> = {
  Easy: 12,
  Medium: 18,
  Hard: 28,
};

export function unlockLevelFor(difficulty: Difficulty) {
  return UNLOCK_LEVEL[difficulty];
}

/** Alias: returns required level (not XP). */
export function unlockXpFor(difficulty: Difficulty) {
  return unlockLevelFor(difficulty);
}

export function rewardXpFor(difficulty: Difficulty) {
  return REWARD_XP[difficulty];
}

export function isExerciseUnlocked(level: number, difficulty: Difficulty) {
  return level >= unlockLevelFor(difficulty);
}

/** About 40% of XP as coins — enough for shop, not so fast that badges feel free. */
export function coinsForXp(xp: number) {
  if (xp <= 0) return 0;
  return Math.max(1, Math.round(xp * 0.4));
}

/** Small plan bump so elite is nicer without breaking unlock pacing. */
export function planXpBonus(plan?: string | null) {
  if (plan === 'elite') return 4;
  if (plan === 'lite') return 2;
  return 0;
}

/** Session XP including plan bonus — single source for all games. */
export function sessionXp(difficulty: Difficulty, plan?: string | null) {
  return rewardXpFor(difficulty) + planXpBonus(plan);
}

/** Partial credit for incomplete runs (0–1 of session XP). */
export function partialSessionXp(difficulty: Difficulty, ratio: number, plan?: string | null) {
  const full = sessionXp(difficulty, plan);
  const clamped = Math.max(0, Math.min(1, ratio));
  if (clamped <= 0) return 0;
  if (clamped >= 1) return full;
  return Math.max(1, Math.round(full * clamped));
}


export function ebookCoinPrice(ebook: { isPremium?: boolean; pages?: number; status?: string }) {
  if (ebook.status === 'under-development') return null;
  const pages = ebook.pages && ebook.pages > 0 ? ebook.pages : 40;
  return ebook.isPremium ? 36 + Math.round(pages / 8) : 14 + Math.round(pages / 10);
}

export const EXERCISES: Exercise[] = [
  { id: 'focus-easy', title: 'Focus Tap', description: 'Tap the marked circle before the timer ends.', difficulty: 'Easy', route: '/games/easy/FocusEasyGame', category: 'attention' },
  { id: 'focus-medium', title: 'Color Count Focus', description: 'Track the right color under more noise.', difficulty: 'Medium', route: '/games/medium/FocusMediumGame', category: 'attention' },
  { id: 'sequence-tap', title: 'Sequence Tap', description: 'Repeat a longer tap sequence.', difficulty: 'Medium', route: '/games/medium/SequenceTapMediumGame', category: 'attention' },
  { id: 'number-recall', title: 'Number Recall', description: 'Memorize a short sequence of numbers.', difficulty: 'Easy', route: '/games/easy/NumberRecallGame', category: 'memory' },
  { id: 'grid-pattern', title: 'Grid Pattern', description: 'Remember and rebuild a grid.', difficulty: 'Medium', route: '/games/medium/GridPatternMemoryGame', category: 'memory' },
  { id: 'sequence-recall', title: 'Sequence Recall', description: 'Replay a longer visual sequence.', difficulty: 'Hard', route: '/games/hard/SequenceRecallGame', category: 'memory' },
  { id: 'odd-one-out', title: 'Odd One Out', description: 'Find the item that does not belong.', difficulty: 'Easy', route: '/games/easy/OddOneOutGame', category: 'logic' },
  { id: 'mastermind', title: 'Mastermind', description: 'Deduce the hidden code.', difficulty: 'Hard', route: '/games/MastermindGame', category: 'logic' },
  { id: 'reaction-tap', title: 'Reaction Tap', description: 'Tap as soon as the signal appears.', difficulty: 'Easy', route: '/games/easy/ReactionTapGame', category: 'speed' },
  { id: 'speed-pattern', title: 'Speed Pattern', description: 'Recognize the pattern before time runs out.', difficulty: 'Hard', route: '/games/SpeedPatternGame', category: 'speed' },
  { id: 'verbal-easy', title: 'Word Sense', description: 'Choose the word that fits the clue.', difficulty: 'Easy', route: '/games/easy/VerbalEasyGame', category: 'verbal' },
  { id: 'visual-easy', title: 'Visual Match', description: 'Spot the matching visual pattern.', difficulty: 'Easy', route: '/games/easy/VisualEasyGame', category: 'visual' },
  { id: 'creativity-easy', title: 'Idea Spark', description: 'Practice a short creative prompt.', difficulty: 'Easy', route: '/games/easy/CreativityEasyGame', category: 'creativity' },
  { id: 'fact-check', title: 'Fact Check', description: 'Decide which claim is supported.', difficulty: 'Medium', route: '/games/FactCheckingGame', category: 'critical' },
  { id: 'fallacies', title: 'Logical Fallacies', description: 'Name the flaw in the argument.', difficulty: 'Hard', route: '/games/LogicalFallaciesGame', category: 'critical' },
  { id: 'evidence', title: 'Evidence Hunt', description: 'Pick the strongest evidence.', difficulty: 'Medium', route: '/games/EvidenceHuntGame', category: 'critical' },
  { id: 'reflection', title: 'Self Reflection', description: 'Pause and review how you thought.', difficulty: 'Easy', route: '/games/SelfReflectionGame', category: 'meta' },
  { id: 'goal-review', title: 'Goal Review', description: 'Check a goal against a better plan.', difficulty: 'Medium', route: '/games/GoalReviewGame', category: 'meta' },
  { id: 'mindful-pause', title: 'Mindful Pause', description: 'A short reset between tasks.', difficulty: 'Easy', route: '/games/MindfulPauseGame', category: 'meta' },
  { id: 'box-breathing', title: 'Box Breathing', description: 'Four equal breaths to settle your pace.', difficulty: 'Easy', route: '/games/BoxBreathingGame', category: 'breathing' },
  { id: 'four-seven-eight', title: '4-7-8 Breath', description: 'A longer exhale for a calmer rhythm.', difficulty: 'Medium', route: '/games/FourSevenEightGame', category: 'breathing' },
  { id: 'wim-hof', title: 'Power Breathing', description: 'A stronger breathing set. Take it slowly.', difficulty: 'Hard', route: '/games/WimHofGame', category: 'breathing' },
  { id: 'forward-fold', title: 'Forward Fold', description: 'A gentle fold for the back of the body.', difficulty: 'Easy', route: '/games/ForwardFoldGame', category: 'stretching' },
  { id: 'shoulder-stretch', title: 'Shoulder Stretch', description: 'Open the chest and shoulders.', difficulty: 'Easy', route: '/games/ShoulderStretchGame', category: 'stretching' },
  { id: 'hip-flexor', title: 'Hip Flexor Stretch', description: 'Ease the front of the hip.', difficulty: 'Medium', route: '/games/HipFlexorStretchGame', category: 'stretching' },
  { id: 'one-leg', title: 'One-Leg Stand', description: 'Balance on one foot with control.', difficulty: 'Easy', route: '/games/OneLegStandGame', category: 'balance' },
  { id: 'heel-toe', title: 'Heel-Toe Walk', description: 'Walk a straight line slowly.', difficulty: 'Medium', route: '/games/HeelToeWalkGame', category: 'balance' },
  { id: 'plank', title: 'Plank', description: 'Hold a steady plank.', difficulty: 'Easy', route: '/games/PlankChallengeGame', category: 'strength' },
  { id: 'circuit', title: 'Bodyweight Circuit', description: 'A short circuit of simple moves.', difficulty: 'Medium', route: '/games/BodyweightCircuitGame', category: 'strength' },
  { id: 'body-scan', title: 'Body Scan', description: 'Notice tension and let it soften.', difficulty: 'Easy', route: '/games/BodyScanGame', category: 'relaxation' },
  { id: 'progressive', title: 'Progressive Relaxation', description: 'Tense and release one area at a time.', difficulty: 'Medium', route: '/games/ProgressiveRelaxationGame', category: 'relaxation' },
  { id: 'joint-rotations', title: 'Joint Rotations', description: 'Move each joint through a comfortable range.', difficulty: 'Easy', route: '/PhysicalTraining/easy/JointRotationsGame', category: 'mobility' },
  { id: 'cardio', title: 'Easy Cardio', description: 'A light endurance interval.', difficulty: 'Easy', route: '/games/CardioRunGame', category: 'endurance' },
  { id: 'intervals', title: 'Intervals', description: 'Alternate effort and recovery.', difficulty: 'Medium', route: '/games/IntervalsGame', category: 'endurance' },
  { id: 'cross-crawl', title: 'Cross Crawl', description: 'Coordinate opposite hand and foot.', difficulty: 'Easy', route: '/games/CrossCrawlGame', category: 'coordination' },
  { id: 'hand-clap', title: 'Rhythm Clap', description: 'Match a simple rhythm.', difficulty: 'Medium', route: '/games/HandClapGame', category: 'coordination' },
];

const byRoute = new Map(EXERCISES.map(exercise => [exercise.route, exercise]));

export function exerciseForRoute(path: string) {
  const clean = path.split('?')[0].replace(/\/$/, '');
  return byRoute.get(clean) ?? EXERCISES.find(exercise => clean.endsWith(exercise.route));
}

export function exercisesForCategory(category: string) {
  return EXERCISES.filter(exercise => exercise.category === category);
}
