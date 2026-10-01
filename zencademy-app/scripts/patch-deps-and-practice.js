const fs = require('fs');

const files = [
  'app/(tabs)/games/LogicalFallaciesGame.tsx',
  'app/(tabs)/games/EvidenceHuntGame.tsx',
  'app/(tabs)/games/GoalReviewGame.tsx',
  'app/(tabs)/games/SelfReflectionGame.tsx',
  'app/(tabs)/games/MindfulPauseGame.tsx',
];

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/\}, \[streak, award\]\);/g, '}, [streak, awardFor]);');
  fs.writeFileSync(f, c);
  console.log('deps', f);
}

require('./wire-practice-modals.js');
