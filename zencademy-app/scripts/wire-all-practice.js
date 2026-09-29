const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.tsx')) out.push(p);
  }
  return out;
}

const gamesRoot = path.join('app', '(tabs)', 'games');
const files = walk(gamesRoot).filter((f) => {
  const c = fs.readFileSync(f, 'utf8');
  return c.includes('Mark as Done') && !c.includes('PracticeDoneModal');
});

let ok = 0;
for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');

  const badge = (c.match(/badgeText[^>]*>\s*(Easy|Medium|Hard)\s*</) || c.match(/>(Easy|Medium|Hard)</))?.[1] || 'Easy';
  const back =
    (c.match(/router\.replace\(['"]([^'"]+)['"]\)/) || [])[1] ||
    '/PhysicalTrainingScreen';
  const titleMatch = c.match(/<Text style=\{styles\.title\}>([^<]+)<\/Text>/);
  const title = (titleMatch?.[1] || path.basename(file, '.tsx')).trim() + ' complete';

  // import
  if (!c.includes('PracticeDoneModal')) {
    c = c.replace(
      /from 'react-native';/,
      "from 'react-native';\nimport { PracticeDoneModal } from '../../../components/PracticeDoneModal';"
    );
  }

  // Fix timer completion for common thresholds
  c = c.replace(
    /intervalRef\.current = setInterval\(\(\) => \{\s*setTimer\(prev => \{\s*if \(prev >= (\d+)\) setShowDone\(true\);\s*return prev \+ 1;\s*\}\);\s*\}, 1000\);/g,
    (_m, thr) => {
      const t = Number(thr);
      return `intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev >= ${t}) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setStarted(false);
            setShowDone(true);
            return ${t + 1};
          }
          return prev + 1;
        });
      }, 1000);`;
    }
  );

  c = c.replace(
    /if \(started\) \{\s*clearInterval\(intervalRef\.current\);\s*setStarted\(false\);/g,
    `if (started) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStarted(false);`
  );

  // Replace Mark as Done UI
  const doneRe =
    /\{\s*showDone && !started && \(\s*<TouchableOpacity[\s\S]*?Mark as Done[\s\S]*?<\/TouchableOpacity>\s*\)\s*\}/;
  if (!doneRe.test(c)) {
    console.log('skip done UI', path.basename(file));
    continue;
  }
  c = c.replace(
    doneRe,
    `{showDone && !started ? (
          <Text style={{ textAlign: 'center', marginTop: 12, color: '#17181c', fontWeight: '600' }}>Session finished — claim your reward</Text>
        ) : null}`
  );

  if (!c.includes('<PracticeDoneModal')) {
    if (!/<\/ScrollView>\s*<\/SafeAreaView>/.test(c)) {
      console.log('skip close', path.basename(file));
      continue;
    }
    c = c.replace(
      /<\/ScrollView>\s*<\/SafeAreaView>/,
      `</ScrollView>

      <PracticeDoneModal
        visible={showDone && !started}
        difficulty="${badge}"
        title="${title.replace(/"/g, '\\"')}"
        onAgain={() => {
          setTimer(0);
          setShowDone(false);
        }}
        onExit={() => {
          setShowDone(false);
          router.replace('${back}');
        }}
      />
    </SafeAreaView>`
    );
  }

  fs.writeFileSync(file, c);
  ok++;
  console.log('wired', path.basename(file), badge, '→', back);
}

// Joint rotations outside games/
const joint = path.join('app', '(tabs)', 'PhysicalTraining', 'easy', 'JointRotationsGame.tsx');
if (fs.existsSync(joint)) {
  let c = fs.readFileSync(joint, 'utf8');
  if (c.includes('Mark as Done') && !c.includes('PracticeDoneModal')) {
    c = c.replace(
      /from 'react-native';/,
      "from 'react-native';\nimport { PracticeDoneModal } from '../../../../components/PracticeDoneModal';"
    );
    c = c.replace(
      /intervalRef\.current = setInterval\(\(\) => \{\s*setTimer\(prev => \{\s*if \(prev >= (\d+)\) setShowDone\(true\);\s*return prev \+ 1;\s*\}\);\s*\}, 1000\);/g,
      (_m, thr) => {
        const t = Number(thr);
        return `intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev >= ${t}) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setStarted(false);
            setShowDone(true);
            return ${t + 1};
          }
          return prev + 1;
        });
      }, 1000);`;
      }
    );
    c = c.replace(
      /\{\s*showDone && !started && \(\s*<TouchableOpacity[\s\S]*?Mark as Done[\s\S]*?<\/TouchableOpacity>\s*\)\s*\}/,
      `{showDone && !started ? (
          <Text style={{ textAlign: 'center', marginTop: 12, color: '#17181c', fontWeight: '600' }}>Session finished — claim your reward</Text>
        ) : null}`
    );
    const back = (c.match(/router\.replace\(['"]([^'"]+)['"]\)/) || [])[1] || '/PhysicalTrainingScreen';
    c = c.replace(
      /<\/ScrollView>\s*<\/SafeAreaView>/,
      `</ScrollView>

      <PracticeDoneModal
        visible={showDone && !started}
        difficulty="Easy"
        title="Joint rotations complete"
        onAgain={() => {
          setTimer(0);
          setShowDone(false);
        }}
        onExit={() => {
          setShowDone(false);
          router.replace('${back}');
        }}
      />
    </SafeAreaView>`
    );
    fs.writeFileSync(joint, c);
    ok++;
    console.log('wired JointRotationsGame.tsx');
  }
}

console.log('total', ok);
