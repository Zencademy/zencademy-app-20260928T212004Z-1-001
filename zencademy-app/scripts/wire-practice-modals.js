const fs = require('fs');
const path = require('path');

const targets = [
  { file: 'app/(tabs)/games/FourSevenEightGame.tsx', diff: 'Medium', back: '/PhysicalTraining/BreathingTrainingScreen', title: 'Breathing complete' },
  { file: 'app/(tabs)/games/PlankChallengeGame.tsx', diff: 'Easy', back: '/PhysicalTraining/StrengthTrainingScreen', title: 'Plank complete' },
  { file: 'app/(tabs)/games/ForwardFoldGame.tsx', diff: 'Easy', back: '/PhysicalTraining/StretchingTrainingScreen', title: 'Stretch complete' },
  { file: 'app/(tabs)/games/BodyScanGame.tsx', diff: 'Easy', back: '/PhysicalTraining/RelaxationTrainingScreen', title: 'Scan complete' },
];

for (const t of targets) {
  let c = fs.readFileSync(t.file, 'utf8');
  if (c.includes('PracticeDoneModal')) {
    console.log('skip', t.file);
    continue;
  }
  if (!c.includes("from 'react-native';")) {
    console.log('no rn', t.file);
    continue;
  }
  c = c.replace(
    /from 'react-native';/,
    "from 'react-native';\nimport { PracticeDoneModal } from '../../../components/PracticeDoneModal';"
  );

  // Replace Mark as Done block + closing SafeArea with modal
  const doneBlock = /\{\s*showDone && !started && \(\s*<TouchableOpacity[\s\S]*?<\/TouchableOpacity>\s*\)\s*\}/;
  if (!doneBlock.test(c)) {
    console.log('no done block', t.file);
    continue;
  }
  c = c.replace(
    doneBlock,
    `{showDone && !started ? (
          <Text style={{ textAlign: 'center', marginTop: 12, color: '#17181c', fontWeight: '600' }}>Session finished — claim your reward</Text>
        ) : null}`
  );

  c = c.replace(
    /<\/ScrollView>\s*<\/SafeAreaView>/,
    `</ScrollView>

      <PracticeDoneModal
        visible={showDone && !started}
        difficulty="${t.diff}"
        title="${t.title}"
        onAgain={() => {
          setTimer(0);
          setShowDone(false);
        }}
        onExit={() => {
          setShowDone(false);
          router.replace('${t.back}');
        }}
      />
    </SafeAreaView>`
  );

  fs.writeFileSync(t.file, c);
  console.log('wired', path.basename(t.file));
}
