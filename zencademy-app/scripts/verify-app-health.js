const fs = require('fs');
const path = require('path');

function walk(d, acc = []) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p, acc);
    else if (f.name.endsWith('.tsx') || f.name.endsWith('.ts')) acc.push(p);
  }
  return acc;
}

const report = { ok: [], warn: [], fail: [] };

// Sounds
for (const s of ['tap', 'correct', 'wrong', 'reward', 'unlock', 'streak']) {
  const p = path.join('assets/sounds', `${s}.wav`);
  if (fs.existsSync(p) && fs.statSync(p).size > 100) report.ok.push(`sfx ${s}`);
  else report.fail.push(`missing sfx ${s}`);
}

// SoundPack requires
const pack = fs.readFileSync('lib/sound/SoundPack.tsx', 'utf8');
for (const m of pack.matchAll(/require\('([^']+)'\)/g)) {
  const abs = path.resolve('lib/sound', m[1]);
  if (fs.existsSync(abs)) report.ok.push(`require ${m[1]}`);
  else report.fail.push(`broken require ${m[1]}`);
}

// Layout + settings
const layout = fs.readFileSync('app/_layout.tsx', 'utf8');
if (layout.includes('SoundProvider')) report.ok.push('SoundProvider mounted');
else report.fail.push('SoundProvider missing');
if (fs.readFileSync('app/(tabs)/settings.tsx', 'utf8').includes('Game sounds')) report.ok.push('settings toggle');
else report.fail.push('settings toggle missing');

// Ebooks
const catalog = fs.readFileSync('lib/ebookContent/catalog.ts', 'utf8');
const ids = [...catalog.matchAll(/^\s+'(\d+)': \{/gm)].map((m) => m[1]);
if (ids.length === 47) report.ok.push('47 ebook contents');
else report.fail.push(`ebook count ${ids.length}`);
if (fs.existsSync('app/ebooks/[id].tsx')) report.ok.push('dynamic ebook route');
else report.fail.push('no [id] route');
const ebookScreen = fs.readFileSync('app/(tabs)/EbookScreen.tsx', 'utf8');
if (ebookScreen.includes('/ebooks/${ebook.id}')) report.ok.push('openEbook wired');
else report.fail.push('openEbook not wired');

// Practice modals
let practiceOk = 0;
let practiceBad = 0;
for (const f of walk('app')) {
  const t = fs.readFileSync(f, 'utf8');
  if (!t.includes('<PracticeDoneModal')) continue;
  const block = t.match(/<PracticeDoneModal[\s\S]*?\/>/);
  if (!block) {
    report.warn.push(`PracticeDoneModal odd shape ${f}`);
    practiceBad++;
    continue;
  }
  const okDiff = /difficulty=["'](Easy|Medium|Hard)["']/.test(block[0]);
  if (okDiff) practiceOk++;
  else {
    practiceBad++;
    report.fail.push(`bad difficulty ${f}`);
  }
}
report.ok.push(`practice modals ${practiceOk}`);
if (practiceBad) report.fail.push(`practice modal issues ${practiceBad}`);

// Reward games
let reward = 0;
for (const f of walk('app')) {
  if (fs.readFileSync(f, 'utf8').includes('useGameReward')) reward++;
}
report.ok.push(`useGameReward in ${reward} screens`);

// playSfx coverage
let sfxFiles = 0;
for (const f of [...walk('app'), 'components/XPContext.tsx']) {
  if (fs.existsSync(f) && fs.readFileSync(f, 'utf8').includes('playSfx(')) sfxFiles++;
}
report.ok.push(`playSfx call sites in ${sfxFiles} files`);

// XP reward wiring
const xp = fs.readFileSync('components/XPContext.tsx', 'utf8');
if (xp.includes("playSfx('reward')") && xp.includes("playSfx('unlock')")) report.ok.push('XP reward/unlock sfx');
else report.fail.push('XPContext missing sfx');

// Retention pack release checks
const retentionFiles = [
  'lib/retention/index.ts',
  'hooks/useRetention.ts',
  'components/DailyCircuitCard.tsx',
  'components/CoachNote.tsx',
  'components/AccentOwnershipGuard.tsx',
  'supabase/migrations/202609300005_retention_circuit_recovery.sql',
];
for (const f of retentionFiles) {
  if (fs.existsSync(f)) report.ok.push(`retention ${f}`);
  else report.fail.push(`missing ${f}`);
}
const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
if (appJson.expo?.version === '1.0.0') report.ok.push('app version 1.0.0');
else report.fail.push(`app version is ${appJson.expo?.version}, expected 1.0.0`);
const shop = fs.readFileSync('constants/shop.ts', 'utf8');
if (shop.includes("UNAVAILABLE_BOOSTS = new Set(['boost-focus-1h'])")
  || (shop.includes('UNAVAILABLE_BOOSTS') && shop.includes('boost-focus-1h') && !shop.includes("UNAVAILABLE_BOOSTS = new Set(['boost-focus-1h', 'boost-xp-2h', 'boost-coin-rain'])"))) {
  report.ok.push('focus boost stays locked; xp/coin boosts enabled');
} else report.fail.push('boost availability mismatch');

console.log(JSON.stringify(report, null, 2));
process.exit(report.fail.length ? 1 : 0);
