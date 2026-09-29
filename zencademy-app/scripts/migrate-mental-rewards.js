const fs = require('fs');
const path = require('path');

/** Migrate mental games from raw addXp to useGameReward + awardFor / award once. */
const targets = [
  {
    file: 'app/(tabs)/games/easy/OddOneOutGame.tsx',
    difficulty: 'Easy',
    mode: 'full', // award full on win
  },
  {
    file: 'app/(tabs)/games/easy/VerbalEasyGame.tsx',
    difficulty: 'Easy',
    mode: 'ratio',
  },
  {
    file: 'app/(tabs)/games/easy/VisualEasyGame.tsx',
    difficulty: 'Easy',
    mode: 'ratio',
  },
  {
    file: 'app/(tabs)/games/easy/CreativityEasyGame.tsx',
    difficulty: 'Easy',
    mode: 'ratio',
  },
  {
    file: 'app/(tabs)/games/easy/ReactionTapGame.tsx',
    difficulty: 'Easy',
    mode: 'custom',
  },
  {
    file: 'app/(tabs)/games/medium/FocusMediumGame.tsx',
    difficulty: 'Medium',
    mode: 'full',
  },
  {
    file: 'app/(tabs)/games/medium/SequenceTapMediumGame.tsx',
    difficulty: 'Medium',
    mode: 'full',
  },
  {
    file: 'app/(tabs)/games/medium/PatternSequenceGame.tsx',
    difficulty: 'Medium',
    mode: 'full',
  },
  {
    file: 'app/(tabs)/games/medium/GridPatternMemoryGame.tsx',
    difficulty: 'Medium',
    mode: 'full',
  },
  {
    file: 'app/(tabs)/games/easy/NumberRecallGame.tsx',
    difficulty: 'Easy',
    mode: 'full',
  },
  {
    file: 'app/(tabs)/games/hard/SequenceRecallGame.tsx',
    difficulty: 'Hard',
    mode: 'full',
  },
  {
    file: 'app/(tabs)/games/MastermindGame.tsx',
    difficulty: 'Hard',
    mode: 'mastermind',
  },
  {
    file: 'app/(tabs)/games/SpeedPatternGame.tsx',
    difficulty: 'Hard',
    mode: 'full',
  },
  {
    file: 'app/(tabs)/games/StoryBuilderGame.tsx',
    difficulty: 'Hard',
    mode: 'full',
  },
  {
    file: 'app/(tabs)/games/hard/MiniSudokuGame.tsx',
    difficulty: null,
    mode: 'sudoku',
  },
];

function ensureImport(c, depth) {
  const rel = '../'.repeat(depth) + 'hooks/useGameReward';
  const prog = '../'.repeat(depth) + 'lib/progression';
  if (!c.includes('useGameReward')) {
    c = `import { useGameReward } from '${rel}';\n` + c;
  }
  if (!c.includes('sessionXp') && !c.includes("from '" + prog)) {
    if (c.includes("from '" + prog.replace(/lib\/progression/, 'lib/progression') + "'")) {
      /* already */
    } else if (c.match(/from ['"].*lib\/progression['"]/)) {
      c = c.replace(
        /import \{([^}]+)\} from (['"].*lib\/progression['"])/,
        (m, names, from) => {
          const list = names
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          if (!list.includes('sessionXp')) list.push('sessionXp');
          if (!list.includes('partialSessionXp')) list.push('partialSessionXp');
          if (!list.includes('coinsForXp')) list.push('coinsForXp');
          return `import { ${[...new Set(list)].join(', ')} } from ${from}`;
        }
      );
    } else {
      c = `import { sessionXp, partialSessionXp, coinsForXp } from '${prog}';\n` + c;
    }
  }
  return c;
}

for (const t of targets) {
  if (!fs.existsSync(t.file)) {
    console.log('missing', t.file);
    continue;
  }
  let c = fs.readFileSync(t.file, 'utf8');
  if (c.includes('awardFor') || c.includes('useGameReward')) {
    // still patch common addXp patterns below if needed
  }
  const depth = t.file.includes('/easy/') || t.file.includes('/medium/') || t.file.includes('/hard/') ? 4 : 3;
  c = ensureImport(c, depth);

  // Ensure hook usage near useXP
  if (!c.includes('useGameReward()')) {
    if (c.includes('const { addXp')) {
      c = c.replace(
        /const \{([^}]*)addXp([^}]*)\} = useXP\(\);/,
        (m, a, b) => {
          const parts = (a + b)
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s && s !== 'addXp' && s !== 'addXP');
          const xpLine = parts.length
            ? `const { ${parts.join(', ')} } = useXP();\n  const { award, awardFor, reset: resetReward } = useGameReward();`
            : `const { plan } = useXP();\n  const { award, awardFor, reset: resetReward } = useGameReward();`;
          return xpLine;
        }
      );
    } else if (c.includes('const { addXP')) {
      c = c.replace(
        /const \{([^}]*)addXP([^}]*)\} = useXP\(\);/,
        (m, a, b) => {
          const parts = (a + b)
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s && s !== 'addXp' && s !== 'addXP');
          return parts.length
            ? `const { ${parts.join(', ')} } = useXP();\n  const { award, awardFor, reset: resetReward } = useGameReward();`
            : `const { plan } = useXP();\n  const { award, awardFor, reset: resetReward } = useGameReward();`;
        }
      );
    }
  }

  if (t.mode === 'full' && t.difficulty) {
    c = c.replace(/addXp\(([^)]+)\);/g, `void awardFor('${t.difficulty}');`);
    c = c.replace(/addXP\(([^)]+)\);/g, `void awardFor('${t.difficulty}');`);
  }
  if (t.mode === 'ratio' && t.difficulty) {
    // xpThisGame calculations → partialSessionXp
    c = c.replace(
      /const xpThisGame = Math\.min\(score, QUESTIONS_PER_GAME\) === QUESTIONS_PER_GAME \? MAX_XP : Math\.floor\(MAX_XP \* score \/ QUESTIONS_PER_GAME\);/,
      `const xpThisGame = partialSessionXp('${t.difficulty}', Math.min(score, QUESTIONS_PER_GAME) / QUESTIONS_PER_GAME, plan);`
    );
    c = c.replace(/addXp\(xpThisGame\);/g, 'void award(xpThisGame);');
    if (!c.includes('const { plan }') && !c.includes('plan } = useXP') && !c.includes('plan,')) {
      c = c.replace('useXP();', 'useXP();\n  const plan = (typeof plan !== "undefined" ? plan : undefined);');
      // cleaner: ensure plan from useXP
      c = c.replace(
        /const \{([^}]*)\} = useXP\(\);/,
        (m, names) => {
          if (names.includes('plan')) return m;
          return `const { ${names.trim()}${names.trim() ? ', ' : ''}plan } = useXP();`;
        }
      );
    }
  }
  if (t.mode === 'custom' && t.difficulty) {
    // ReactionTap: compute xp then addXp(xp)
    c = c.replace(
      /if \(xp > 0\) addXp\(xp\);/,
      `if (xp > 0) void award(xp);`
    );
    // Prefer partial of Easy based on wins/ROUNDS if MAX_XP pattern exists
    c = c.replace(
      /wins === ROUNDS \? MAX_XP :\s*wins >= 3 \? Math\.floor\(MAX_XP \* 0\.7\) :\s*wins >= 1 \? Math\.floor\(MAX_XP \* 0\.4\) :/,
      `wins === ROUNDS ? sessionXp('Easy', plan) :
    wins >= 3 ? partialSessionXp('Easy', 0.7, plan) :
    wins >= 1 ? partialSessionXp('Easy', 0.4, plan) :`
    );
    if (!c.includes('plan')) {
      c = c.replace(
        /const \{([^}]*)\} = useXP\(\);/,
        (m, names) => (names.includes('plan') ? m : `const { ${names.trim()}${names.trim() ? ', ' : ''}plan } = useXP();`)
      );
    }
  }
  if (t.mode === 'mastermind') {
    c = c.replace(
      /function xpForDifficulty\(level: string\) \{[\s\S]*?\n\}/,
      `function xpForDifficulty(level: string) {
  if (level === 'hard') return sessionXp('Hard');
  if (level === 'medium') return sessionXp('Medium');
  return sessionXp('Easy');
}`
    );
    c = c.replace(/addXp\(xpForDifficulty\(difficulty\)\);/g, 'void award(xpForDifficulty(difficulty));');
  }
  if (t.mode === 'sudoku') {
    c = c.replace(
      /function xpForDifficulty\(level: string\) \{[\s\S]*?\n  \}/,
      `function xpForDifficulty(level: string) {
    if (level === 'hard') return sessionXp('Hard');
    if (level === 'medium') return sessionXp('Medium');
    return sessionXp('Easy');
  }`
    );
    c = c.replace(/addXp\(xpForDifficulty\(difficulty\)\);/g, 'void award(xpForDifficulty(difficulty));');
  }

  fs.writeFileSync(t.file, c);
  console.log('mental', path.basename(t.file));
}

console.log('mental done');
