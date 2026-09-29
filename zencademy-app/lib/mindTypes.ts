export type MindTypeId =
  | 'Logic Guru'
  | 'Memory Master'
  | 'Focus Champion'
  | 'Strategic Thinker'
  | 'Pattern Pro'
  | 'Quick Reactor';

export type MindProfile = {
  id: MindTypeId;
  title: string;
  tagline: string;
  body: string;
  strengths: string[];
  train: string[];
};

export const MIND_PROFILES: Record<MindTypeId, MindProfile> = {
  'Logic Guru': {
    id: 'Logic Guru',
    title: 'Analytical Mind',
    tagline: 'You break problems into clean structure.',
    body: 'You prefer evidence over impulse. When others guess, you model. Train logic and critical sets to sharpen this edge.',
    strengths: ['Structured reasoning', 'Problem decomposition', 'Precision under ambiguity'],
    train: ['Logic', 'Critical thinking', 'Metacognition'],
  },
  'Memory Master': {
    id: 'Memory Master',
    title: 'Memory Architect',
    tagline: 'You retain what others lose.',
    body: 'Detail sticks with you. Names, sequences, and prior context come back on demand. Memory and verbal drills compound that advantage.',
    strengths: ['Retention', 'Recall under load', 'Associative linking'],
    train: ['Memory', 'Verbal', 'Attention'],
  },
  'Focus Champion': {
    id: 'Focus Champion',
    title: 'Focus Operator',
    tagline: 'Depth beats distraction.',
    body: 'You can hold a single target longer than most. That makes deep work natural — and makes attention training especially high-leverage.',
    strengths: ['Sustained attention', 'Task lock-in', 'Noise resistance'],
    train: ['Attention', 'Focus sessions', 'Breathwork'],
  },
  'Strategic Thinker': {
    id: 'Strategic Thinker',
    title: 'Strategic Planner',
    tagline: 'You play the long board.',
    body: 'You see second-order effects and plan ahead. Strategy and executive exercises keep that foresight sharp.',
    strengths: ['Forward planning', 'Trade-off clarity', 'Systems view'],
    train: ['Executive', 'Critical thinking', 'Goal review'],
  },
  'Pattern Pro': {
    id: 'Pattern Pro',
    title: 'Pattern Reader',
    tagline: 'You notice the shape before the noise.',
    body: 'Connections appear early for you — in visuals, sequences, and behavior. Visual and pattern work turns that instinct into skill.',
    strengths: ['Pattern detection', 'Visual synthesis', 'Transfer learning'],
    train: ['Visual', 'Speed patterns', 'Creativity'],
  },
  'Quick Reactor': {
    id: 'Quick Reactor',
    title: 'Rapid Processor',
    tagline: 'You decide while others hesitate.',
    body: 'Speed without panic is your edge. Reaction and speed drills raise the ceiling without sacrificing control.',
    strengths: ['Processing speed', 'Adaptive switching', 'Decisive action'],
    train: ['Speed', 'Attention', 'Coordination'],
  },
};

/** Short badge labels for leaderboard / profile chips. */
export const MIND_TYPE_LABEL: Record<string, string> = {
  'Logic Guru': 'Analytical',
  'Memory Master': 'Memory',
  'Focus Champion': 'Focus',
  'Focus Titan': 'Focus',
  'Strategic Thinker': 'Strategic',
  'Pattern Pro': 'Pattern',
  'Quick Reactor': 'Rapid',
  'Creative Visionary': 'Creative',
  'Resilient Optimizer': 'Resilient',
  'Social Connector': 'Social',
  'Visualizer': 'Visual',
};

export function mindTypeLabel(id: string | null | undefined) {
  if (!id) return '';
  return MIND_TYPE_LABEL[id] || id;
}

export function mindTypeTitle(id: string | null | undefined) {
  if (!id) return '';
  const profile = MIND_PROFILES[id as MindTypeId];
  return profile?.title || mindTypeLabel(id) || id;
}
