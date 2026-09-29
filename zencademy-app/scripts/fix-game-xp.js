const fs = require('fs');
const path = require('path');

function walk(d, a = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.name === 'node_modules' || e.name === '.git') continue;
    if (e.isDirectory()) walk(p, a);
    else if (/\.(tsx|ts)$/.test(e.name)) a.push(p);
  }
  return a;
}

const map = {
  'FactCheckingGame.tsx': [['const WIN_XP = 12; // Easy', 'const WIN_XP = 18; // Medium']],
  'LogicalFallaciesGame.tsx': [['const WIN_XP = 18; // Medium', 'const WIN_XP = 28; // Hard']],
  'EvidenceHuntGame.tsx': [['const WIN_XP = 28; // Hard', 'const WIN_XP = 18; // Medium']],
  'MindfulPauseGame.tsx': [['const WIN_XP = 28; // Hard', 'const WIN_XP = 12; // Easy']],
  'NumberRecallGame.tsx': [['const BASE_REWARD_EASY = 10;', 'const BASE_REWARD_EASY = 12;']],
  'SequenceRecallGame.tsx': [['const BASE_REWARD_HARD = 20;', 'const BASE_REWARD_HARD = 28;']],
  'FocusMediumGame.tsx': [['const BASE_REWARD_MEDIUM = 15;', 'const BASE_REWARD_MEDIUM = 18;']],
  'GridPatternMemoryGame.tsx': [['const BASE_REWARD_MEDIUM = 15;', 'const BASE_REWARD_MEDIUM = 18;']],
  'SequenceTapMediumGame.tsx': [['const XP_REWARD = 40; // Bonus for completing the game', 'const XP_REWARD = 18; // Medium']],
  'PatternSequenceGame.tsx': [
    ['const XP_REWARD = 40; // Bonus for completing the game', 'const XP_REWARD = 18;'],
    ['const MAX_XP = 25;', 'const MAX_XP = 18;'],
  ],
  'SpeedPatternGame.tsx': [['const WIN_XP = 40; // hard', 'const WIN_XP = 28; // Hard']],
  'StoryBuilderGame.tsx': [['const WIN_XP = 35; // Hard', 'const WIN_XP = 28; // Hard']],
  'OddOneOutGame.tsx': [
    ['const XP_REWARD = 25; // Bonus for completing the game', 'const XP_REWARD = 12;'],
    ['const MAX_XP = 15;', 'const MAX_XP = 12;'],
  ],
  'VerbalEasyGame.tsx': [
    ['const XP_REWARD = 25; // Bonus for completing the game', 'const XP_REWARD = 12;'],
    ['const MAX_XP = 15;', 'const MAX_XP = 12;'],
  ],
  'VisualEasyGame.tsx': [
    ['const XP_REWARD = 25; // Bonus for completing the game', 'const XP_REWARD = 12;'],
    ['const MAX_XP = 15;', 'const MAX_XP = 12;'],
  ],
  'CreativityEasyGame.tsx': [
    ['const XP_REWARD = 25; // Bonus for completing the game', 'const XP_REWARD = 12;'],
    ['const MAX_XP = 15;', 'const MAX_XP = 12;'],
  ],
  'ReactionTapGame.tsx': [
    ['const XP_REWARD = 25; // Bonus for completing the game', 'const XP_REWARD = 12;'],
    ['const MAX_XP = 15;', 'const MAX_XP = 12;'],
  ],
  'MastermindGame.tsx': [
    [
      `function xpForDifficulty(level: string) {
  switch (level) {
    case 'hard':
      return 30;
    case 'medium':
      return 20;
    default:
      return 15;
  }
}`,
      `function xpForDifficulty(level: string) {
  switch (level) {
    case 'hard':
      return 28;
    case 'medium':
      return 18;
    default:
      return 12;
  }
}`,
    ],
  ],
  'MiniSudokuGame.tsx': [
    ['const XP_REWARD = 50; // Bonus for completing the game', 'const XP_REWARD = 28;'],
    ['const MAX_XP = 35;', 'const MAX_XP = 28;'],
  ],
};

const files = walk('app');
let n = 0;
for (const f of files) {
  const base = path.basename(f);
  if (!map[base]) continue;
  let c = fs.readFileSync(f, 'utf8');
  const o = c;
  for (const [a, b] of map[base]) c = c.split(a).join(b);
  if (c !== o) {
    fs.writeFileSync(f, c);
    n++;
    console.log('fixed', base);
  }
}
console.log('done', n);
