const fs = require('fs');
const path = require('path');

const byFile = {
  'AlternateNostrilGame.tsx': 'Easy',
  'BodyweightCircuitGame.tsx': 'Medium',
  'BosuBalanceGame.tsx': 'Medium',
  'ButterflyStretchGame.tsx': 'Easy',
  'CardioRunGame.tsx': 'Easy',
  'CrossCrawlGame.tsx': 'Easy',
  'CyclingSprintGame.tsx': 'Medium',
  'DynamicBalanceGame.tsx': 'Hard',
  'ExplosivePowerGame.tsx': 'Hard',
  'GuidedImageryGame.tsx': 'Medium',
  'HandClapGame.tsx': 'Medium',
  'HeelToeWalkGame.tsx': 'Medium',
  'HipFlexorStretchGame.tsx': 'Medium',
  'IntervalsGame.tsx': 'Medium',
  'JugglingGame.tsx': 'Hard',
  'LongDistanceWalkGame.tsx': 'Hard',
  'OneLegStandGame.tsx': 'Easy',
  'ProgressiveRelaxationGame.tsx': 'Medium',
  'ReactionCatchGame.tsx': 'Medium',
  'RelaxationBreathingGame.tsx': 'Medium',
  'ResistanceBandsGame.tsx': 'Medium',
  'ShoulderStretchGame.tsx': 'Easy',
  'WimHofGame.tsx': 'Hard',
  'WorldsGreatestGame.tsx': 'Hard',
  'BoxBreathingGame.tsx': 'Easy',
  'FourSevenEightGame.tsx': 'Medium',
  'PlankChallengeGame.tsx': 'Easy',
  'ForwardFoldGame.tsx': 'Easy',
  'BodyScanGame.tsx': 'Easy',
};

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.tsx')) out.push(p);
  }
  return out;
}

for (const file of walk(path.join('app', '(tabs)', 'games'))) {
  const base = path.basename(file);
  const diff = byFile[base];
  if (!diff) continue;
  let c = fs.readFileSync(file, 'utf8');
  if (!c.includes('PracticeDoneModal')) continue;
  const next = c.replace(/difficulty="(Easy|Medium|Hard)"/, `difficulty="${diff}"`);
  if (next !== c) {
    fs.writeFileSync(file, next);
    console.log('diff', base, '→', diff);
  }
}
console.log('done');
