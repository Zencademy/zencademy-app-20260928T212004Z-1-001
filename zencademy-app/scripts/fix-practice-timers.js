const fs = require('fs');

const files = [
  'app/(tabs)/games/FourSevenEightGame.tsx',
  'app/(tabs)/games/PlankChallengeGame.tsx',
  'app/(tabs)/games/ForwardFoldGame.tsx',
  'app/(tabs)/games/BodyScanGame.tsx',
];

const old = `intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev >= 119) setShowDone(true);
          return prev + 1;
        });
      }, 1000);`;

const neu = `intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev >= 119) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setStarted(false);
            setShowDone(true);
            return 120;
          }
          return prev + 1;
        });
      }, 1000);`;

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  if (!c.includes('if (prev >= 119) setShowDone(true);')) {
    console.log('pattern miss', f);
    continue;
  }
  c = c.replace(old, neu);
  // also normalize clearInterval on stop
  c = c.replace(
    /if \(started\) \{\s*clearInterval\(intervalRef\.current\);\s*setStarted\(false\);/,
    `if (started) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStarted(false);`
  );
  fs.writeFileSync(f, c);
  console.log('timer fixed', f);
}
