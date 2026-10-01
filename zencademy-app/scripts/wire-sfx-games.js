/**
 * Inject playSfx(correct/wrong) into quiz-style answer handlers and focus fail/success.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const QUIZ_FILES = [
  'app/(tabs)/games/FactCheckingGame.tsx',
  'app/(tabs)/games/EvidenceHuntGame.tsx',
  'app/(tabs)/games/LogicalFallaciesGame.tsx',
  'app/(tabs)/games/GoalReviewGame.tsx',
  'app/(tabs)/games/SelfReflectionGame.tsx',
  'app/(tabs)/games/MindfulPauseGame.tsx',
];

const IMPORT_LINE = "import { playSfx } from '../../../lib/sound/SoundPack';";

function ensureImport(src, importLine) {
  if (src.includes("playSfx")) return src;
  // After last import
  const lines = src.split('\n');
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) lastImport = i;
  }
  if (lastImport >= 0) {
    lines.splice(lastImport + 1, 0, importLine);
    return lines.join('\n');
  }
  return importLine + '\n' + src;
}

for (const rel of QUIZ_FILES) {
  const file = path.join(ROOT, rel);
  let src = fs.readFileSync(file, 'utf8');
  src = ensureImport(src, IMPORT_LINE);
  if (!src.includes('playSfx(ok')) {
    src = src.replace(
      /setStreak\(s => \(ok \? s \+ 1 : 0\)\);/g,
      "playSfx(ok ? 'correct' : 'wrong');\n\t\tsetStreak(s => (ok ? s + 1 : 0));"
    );
  }
  fs.writeFileSync(file, src);
  console.log('patched quiz', rel);
}

// Focus easy
{
  const file = path.join(ROOT, 'app/(tabs)/games/easy/FocusEasyGame.tsx');
  let src = fs.readFileSync(file, 'utf8');
  src = ensureImport(src, "import { playSfx } from '../../../../lib/sound/SoundPack';");
  if (!src.includes("playSfx('correct')")) {
    src = src.replace(
      /if \(idx === correctIdx\) \{\n\s*if \(round \+ 1 === ROUNDS\) \{\n\s*setPhase\('success'\);/,
      `if (idx === correctIdx) {\n      playSfx('correct');\n      if (round + 1 === ROUNDS) {\n        setPhase('success');`
    );
    src = src.replace(
      /\} else \{\n\s*setPhase\('fail'\);\n\s*\}/,
      `} else {\n      playSfx('wrong');\n      setPhase('fail');\n    }`
    );
  }
  fs.writeFileSync(file, src);
  console.log('patched FocusEasyGame');
}

// Focus medium / Sequence tap — fail/success
for (const rel of [
  'app/(tabs)/games/medium/FocusMediumGame.tsx',
  'app/(tabs)/games/medium/SequenceTapMediumGame.tsx',
]) {
  const file = path.join(ROOT, rel);
  let src = fs.readFileSync(file, 'utf8');
  src = ensureImport(src, "import { playSfx } from '../../../../lib/sound/SoundPack';");
  if (!src.includes("playSfx('correct')") && src.includes("setPhase('success')")) {
    src = src.replace(/setPhase\('success'\)/g, "playSfx('correct'); setPhase('success')");
    src = src.replace(/setPhase\('fail'\)/g, "playSfx('wrong'); setPhase('fail')");
  }
  fs.writeFileSync(file, src);
  console.log('patched', rel);
}

console.log('done');
