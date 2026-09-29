/**
 * Generates tiny procedural WAV SFX for the Zencademy sound pack.
 * Run: node scripts/generate-sfx.js
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(OUT, { recursive: true });

function writeWav(file, samples, sampleRate = 22050) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE((s * 32767) | 0, 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT, file), buffer);
}

function tone(freq, durationSec, sampleRate, { attack = 0.008, release = 0.06, gain = 0.35, type = 'sine' } = {}) {
  const n = Math.floor(durationSec * sampleRate);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const envAttack = Math.min(1, t / attack);
    const envRelease = Math.min(1, (durationSec - t) / release);
    const env = Math.max(0, Math.min(envAttack, envRelease));
    const phase = 2 * Math.PI * freq * t;
    let wave = Math.sin(phase);
    if (type === 'triangle') wave = 2 * Math.abs(2 * ((freq * t) % 1) - 1) - 1;
    if (type === 'soft') wave = Math.sin(phase) * 0.85 + Math.sin(phase * 2) * 0.15;
    out[i] = wave * env * gain;
  }
  return out;
}

function concat(...parts) {
  const total = parts.reduce((s, p) => s + p.length, 0);
  const out = new Float32Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

function silence(sec, sampleRate = 22050) {
  return new Float32Array(Math.floor(sec * sampleRate));
}

const sr = 22050;

// Soft UI tap
writeWav(
  'tap.wav',
  tone(880, 0.045, sr, { attack: 0.002, release: 0.03, gain: 0.18, type: 'soft' })
);

// Correct / “babing”
writeWav(
  'correct.wav',
  concat(
    tone(659.25, 0.07, sr, { attack: 0.004, release: 0.04, gain: 0.28, type: 'soft' }),
    tone(880, 0.11, sr, { attack: 0.004, release: 0.07, gain: 0.3, type: 'soft' })
  )
);

// Soft miss
writeWav(
  'wrong.wav',
  tone(220, 0.12, sr, { attack: 0.005, release: 0.09, gain: 0.22, type: 'triangle' })
);

// Reward / win chime
writeWav(
  'reward.wav',
  concat(
    tone(523.25, 0.08, sr, { gain: 0.28, type: 'soft' }),
    tone(659.25, 0.08, sr, { gain: 0.3, type: 'soft' }),
    tone(783.99, 0.16, sr, { gain: 0.32, release: 0.1, type: 'soft' })
  )
);

// Unlock ebook / shop
writeWav(
  'unlock.wav',
  concat(
    tone(392, 0.06, sr, { gain: 0.22, type: 'soft' }),
    tone(523.25, 0.07, sr, { gain: 0.26, type: 'soft' }),
    tone(659.25, 0.07, sr, { gain: 0.28, type: 'soft' }),
    tone(1046.5, 0.18, sr, { gain: 0.3, release: 0.12, type: 'soft' })
  )
);

// Streak bump
writeWav(
  'streak.wav',
  concat(
    tone(440, 0.06, sr, { gain: 0.24, type: 'soft' }),
    silence(0.02, sr),
    tone(554.37, 0.06, sr, { gain: 0.26, type: 'soft' }),
    silence(0.02, sr),
    tone(659.25, 0.14, sr, { gain: 0.3, release: 0.1, type: 'soft' })
  )
);

console.log('Wrote SFX to', OUT);
