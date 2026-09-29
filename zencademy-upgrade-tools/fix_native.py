from pathlib import Path
for folder in ['app', 'components']:
    for p in Path(folder).rglob('*.tsx'):
        old = p.read_text(encoding='utf-8')
        new = old.replace('NodeJS.Timeout', 'ReturnType<typeof setTimeout>').replace('StyleSheet.absoluteFillObject', 'StyleSheet.absoluteFill')
        if new != old:
            p.write_text(new, encoding='utf-8')
p = Path('components/ParticleZ.tsx')
s = p.read_text(encoding='utf-8')
line = "  const [mode, setMode] = useState<'shape' | 'free'>('free');"
s = s.replace(line + '\n', '')
s = s.replace('  // --- Per-particle random walking ---', line + '\n\n  // --- Per-particle random walking ---')
p.write_text(s, encoding='utf-8')
