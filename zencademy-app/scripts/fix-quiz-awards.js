const fs = require('fs');

const games = [
  {
    file: 'app/(tabs)/games/LogicalFallaciesGame.tsx',
    diff: 'Hard',
    winConst: /const WIN_XP = 28; \/\/ Hard\r?\n\r?\n/,
  },
  {
    file: 'app/(tabs)/games/EvidenceHuntGame.tsx',
    diff: 'Medium',
    winConst: /const WIN_XP = 18; \/\/ Medium\r?\n\r?\n/,
  },
  {
    file: 'app/(tabs)/games/GoalReviewGame.tsx',
    diff: 'Medium',
    winConst: /const WIN_XP = 18; \/\/ Medium\r?\n\r?\n/,
  },
  {
    file: 'app/(tabs)/games/SelfReflectionGame.tsx',
    diff: 'Easy',
    winConst: /const WIN_XP = 12; \/\/ Easy\r?\n\r?\n/,
  },
  {
    file: 'app/(tabs)/games/MindfulPauseGame.tsx',
    diff: 'Easy',
    winConst: /const WIN_XP = 12; \/\/ Easy\r?\n\r?\n/,
  },
];

for (const g of games) {
  let c = fs.readFileSync(g.file, 'utf8');
  if (!c.includes("from '../../../lib/progression'")) continue;
  c = c.replace(
    /import \{ coinsForXp \} from '\.\.\/\.\.\/\.\.\/lib\/progression';/,
    "import { coinsForXp, sessionXp } from '../../../lib/progression';\nimport { useXP } from '../../../components/XPContext';"
  );
  c = c.replace(g.winConst, '');
  c = c.replace(
    /const \{ award, reset \} = useGameReward\(\);/,
    `const { awardFor, reset, last } = useGameReward();\n\tconst { plan } = useXP();\n\tconst winXp = last?.xp ?? sessionXp('${g.diff}', plan);`
  );
  c = c.replace(
    new RegExp(`void award\\(WIN_XP\\); setShowWin\\(true\\); \\}, \\[streak, award\\]\\);`),
    `void awardFor('${g.diff}'); setShowWin(true); }, [streak, awardFor]);`
  );
  // SelfReflection may have different award pattern
  c = c.replace(/void award\(WIN_XP\);/g, `void awardFor('${g.diff}');`);
  c = c.replace(
    /\+\{WIN_XP\} XP \+ \{coinsForXp\(WIN_XP\)\} coins/,
    '+{winXp} XP + {coinsForXp(winXp)} coins'
  );
  fs.writeFileSync(g.file, c);
  console.log('updated', g.file);
}
