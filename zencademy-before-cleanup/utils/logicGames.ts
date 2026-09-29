export interface LogicQuestion {
  id: string;
  type: 'pattern' | 'deductive' | 'mathematical' | 'spatial' | 'verbal';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  hints: string[];
  timeLimit?: number;
  category: string;
}

export interface GameSession {
  id: string;
  userId: string;
  questions: LogicQuestion[];
  currentQuestionIndex: number;
  score: number;
  hintsUsed: number;
  startTime: Date;
  endTime?: Date;
}

// Logic Questions Database
export const LOGIC_QUESTIONS: LogicQuestion[] = [
  // Pattern Recognition
  {
    id: 'pattern-1',
    type: 'pattern',
    difficulty: 'medium',
    category: 'Pattern Recognition',
    question: 'Care este următorul număr în secvența: 2, 6, 12, 20, 30, ?',
    options: ['40', '42', '44', '46'],
    correctAnswer: 1, // 42
    explanation: 'Diferența între numere crește cu 2: +4, +6, +8, +10, +12. Deci 30 + 12 = 42',
    hints: [
      'Uită-te la diferențele dintre numere consecutive',
      'Diferența crește cu 2 la fiecare pas',
      'Ultima diferență este 10, următoarea va fi 12'
    ]
  },
  {
    id: 'pattern-2',
    type: 'pattern',
    difficulty: 'medium',
    category: 'Pattern Recognition',
    question: 'Completați secvența: A, C, F, J, O, ?',
    options: ['T', 'U', 'V', 'W'],
    correctAnswer: 1, // U
    explanation: 'Litera următoare sare cu 1, 2, 3, 4, 5 poziții în alfabet. O + 6 = U',
    hints: [
      'Uită-te la pozițiile literelor în alfabet',
      'Săritura crește cu 1 la fiecare pas',
      'O este a 15-a literă, următoarea săritură este 6'
    ]
  },
  {
    id: 'pattern-3',
    type: 'pattern',
    difficulty: 'medium',
    category: 'Pattern Recognition',
    question: 'Care număr lipsește: 3, 8, 15, 24, 35, ?',
    options: ['46', '48', '50', '52'],
    correctAnswer: 1, // 48
    explanation: 'Fiecare număr este pătratul poziției + 2: 1²+2=3, 2²+2=6, 3²+2=11... 6²+2=38',
    hints: [
      'Încearcă să găsești o relație cu pătratele',
      'Fiecare număr este pătratul poziției plus ceva',
      '6² = 36, plus 2 = 38'
    ]
  },

  // Deductive Reasoning
  {
    id: 'deductive-1',
    type: 'deductive',
    difficulty: 'medium',
    category: 'Deductive Reasoning',
    question: 'Toți studenții din clasa A sunt inteligenți. Maria este din clasa A. Ce putem deduce?',
    options: [
      'Maria este inteligentă',
      'Maria nu este inteligentă',
      'Nu putem ști dacă Maria este inteligentă',
      'Toți studenții inteligenți sunt în clasa A'
    ],
    correctAnswer: 0,
    explanation: 'Dacă toți A sunt B și X este A, atunci X este B. Aceasta este o deducție validă.',
    hints: [
      'Uită-te la structura logică: Toți A sunt B, X este A',
      'Dacă toți membrii unei categorii au o proprietate...',
      'Și un individ aparține acelei categorii...'
    ]
  },
  {
    id: 'deductive-2',
    type: 'deductive',
    difficulty: 'medium',
    category: 'Deductive Reasoning',
    question: 'Într-o cameră sunt 3 persoane: Ana, Bogdan și Carmen. Ana spune adevărul, Bogdan minte, Carmen spune adevărul sau minte. Ana spune "Bogdan minte". Bogdan spune "Carmen minte". Carmen spune "Ana spune adevărul". Cine minte?',
    options: ['Ana', 'Bogdan', 'Carmen', 'Imposibil de determinat'],
    correctAnswer: 2, // Carmen
    explanation: 'Ana spune adevărul, deci Bogdan minte. Bogdan spune că Carmen minte, dar Bogdan minte, deci Carmen spune adevărul. Dar Carmen spune că Ana spune adevărul, ceea ce este fals, deci Carmen minte.',
    hints: [
      'Ana spune întotdeauna adevărul',
      'Bogdan minte întotdeauna',
      'Dacă Bogdan spune că Carmen minte, înseamnă că Carmen spune adevărul'
    ]
  },

  // Mathematical Logic
  {
    id: 'math-1',
    type: 'mathematical',
    difficulty: 'medium',
    category: 'Mathematical Logic',
    question: 'Un număr este cu 5 mai mare decât altul. Suma lor este 23. Care este numărul mai mare?',
    options: ['9', '14', '18', '19'],
    correctAnswer: 1, // 14
    explanation: 'Fie x numărul mai mic. Atunci x + (x+5) = 23. 2x + 5 = 23. 2x = 18. x = 9. Numărul mai mare = 9 + 5 = 14',
    hints: [
      'Fie x numărul mai mic',
      'Numărul mai mare este x + 5',
      'Suma lor este x + (x+5) = 23'
    ]
  },
  {
    id: 'math-2',
    type: 'mathematical',
    difficulty: 'medium',
    category: 'Mathematical Logic',
    question: 'Într-o urnă sunt bile albe și negre. 60% sunt albe. Dacă scoatem 10 bile albe, procentul de bile albe devine 50%. Câte bile erau inițial?',
    options: ['40', '50', '60', '70'],
    correctAnswer: 1, // 50
    explanation: 'Fie x numărul total de bile. 0.6x sunt albe. După scoaterea a 10 bile albe: (0.6x-10)/(x-10) = 0.5. Rezolvând: x = 50',
    hints: [
      'Fie x numărul total de bile',
      '60% din x sunt albe, deci 0.6x bile albe',
      'După scoaterea a 10 bile albe, rămân 0.6x-10 bile albe din x-10 bile'
    ]
  },

  // Spatial Logic
  {
    id: 'spatial-1',
    type: 'spatial',
    difficulty: 'medium',
    category: 'Spatial Logic',
    question: 'Un cub are muchia de 3 cm. Care este volumul unui cub cu muchia de 6 cm?',
    options: ['2 ori mai mare', '4 ori mai mare', '8 ori mai mare', '12 ori mai mare'],
    correctAnswer: 2, // 8 ori mai mare
    explanation: 'Volumul cubului este muchia la puterea a 3-a. 6³ = 216, 3³ = 27. 216/27 = 8',
    hints: [
      'Volumul cubului este muchia la puterea a 3-a',
      '6³ = 216, 3³ = 27',
      'Raportul volumelor este 216/27'
    ]
  },
  {
    id: 'spatial-2',
    type: 'spatial',
    difficulty: 'medium',
    category: 'Spatial Logic',
    question: 'Câte fețe are o piramidă cu bază pătrată?',
    options: ['4', '5', '6', '8'],
    correctAnswer: 1, // 5
    explanation: 'O piramidă cu bază pătrată are: 1 bază pătrată + 4 fețe triunghiulare = 5 fețe',
    hints: [
      'Piramida are o bază și fețe laterale',
      'Baza este un pătrat (1 față)',
      'Fețele laterale sunt triunghiuri'
    ]
  },

  // Verbal Logic
  {
    id: 'verbal-1',
    type: 'verbal',
    difficulty: 'medium',
    category: 'Verbal Logic',
    question: 'Care cuvânt nu se potrivește cu celelalte: MĂR, PĂR, CĂR, LĂR?',
    options: ['MĂR', 'PĂR', 'CĂR', 'LĂR'],
    correctAnswer: 3, // LĂR
    explanation: 'MĂR, PĂR, CĂR sunt cuvinte cu sens în română. LĂR nu există în limba română.',
    hints: [
      'Uită-te la sensul cuvintelor',
      'MĂR, PĂR, CĂR sunt cuvinte reale',
      'Verifică dacă toate cuvintele există în dicționar'
    ]
  },
  {
    id: 'verbal-2',
    type: 'verbal',
    difficulty: 'medium',
    category: 'Verbal Logic',
    question: 'Dacă "carte" este la "bibliotecă" cum este "mâncare" la:',
    options: ['restaurant', 'bucătărie', 'magazin', 'casă'],
    correctAnswer: 1, // bucătărie
    explanation: 'Cărțile se păstrează în bibliotecă, mâncarea se prepară în bucătărie. Relația este de loc de păstrare/producere.',
    hints: [
      'Uită-te la relația dintre "carte" și "bibliotecă"',
      'Cărțile se păstrează în bibliotecă',
      'Unde se prepară mâncarea?'
    ]
  }
];

// Game Logic Functions
export const getRandomQuestions = (count: number, difficulty: 'medium' = 'medium'): LogicQuestion[] => {
  const filteredQuestions = LOGIC_QUESTIONS.filter(q => q.difficulty === difficulty);
  const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

export const calculateScore = (
  correctAnswers: number,
  totalQuestions: number,
  hintsUsed: number,
  timeBonus: number = 0
): number => {
  const baseScore = (correctAnswers / totalQuestions) * 100;
  const hintPenalty = hintsUsed * 5; // 5 puncte penalizare per hint
  const finalScore = Math.max(0, baseScore - hintPenalty + timeBonus);
  return Math.round(finalScore);
};

export const getHint = (question: LogicQuestion, hintIndex: number): string => {
  if (hintIndex >= question.hints.length) {
    return "Nu mai sunt hinturi disponibile!";
  }
  return question.hints[hintIndex];
};

export const getXPForQuestion = (
  isCorrect: boolean,
  hintsUsed: number,
  timeBonus: number = 0
): number => {
  if (!isCorrect) return 0;
  
  let xp = 10; // Base XP for correct answer (reduced from 50)
  xp -= hintsUsed * 2; // Penalty for hints (reduced from 10)
  xp += timeBonus; // Bonus for speed
  
  return Math.max(5, xp); // Minimum 5 XP (reduced from 10)
};

export const getCategoryQuestions = (category: string): LogicQuestion[] => {
  return LOGIC_QUESTIONS.filter(q => q.category === category);
};

export const getQuestionsByType = (type: LogicQuestion['type']): LogicQuestion[] => {
  return LOGIC_QUESTIONS.filter(q => q.type === type);
};
