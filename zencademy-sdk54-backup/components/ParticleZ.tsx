import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, useWindowDimensions } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

// --- Forme ciudate ---
function shapeStar(width: number, height: number) {
  const cx = width / 2, cy = height / 2, r1 = Math.min(width, height) * 0.17, r2 = r1 * 0.45;
  return Array.from({ length: 42 }, (_, i) => {
    const angle = (2 * Math.PI * i) / 42 - Math.PI / 2;
    const r = i % 2 === 0 ? r1 : r2;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  });
}
function shapeWave(width: number, height: number) {
  const cx = width / 2, cy = height / 2;
  const w = width * 0.5, h = height * 0.16;
  return Array.from({ length: 42 }, (_, i) => {
    const t = i / 41;
    const x = cx - w / 2 + w * t;
    const y = cy + Math.sin(3 * Math.PI * t) * h;
    return [x, y];
  });
}
function shapeSpiral(width: number, height: number) {
  const cx = width / 2, cy = height / 2;
  const R = Math.min(width, height) * 0.23;
  return Array.from({ length: 42 }, (_, i) => {
    const theta = (i / 41) * 3.5 * Math.PI;
    const r = R * (0.25 + 0.75 * (i / 41));
    return [
      cx + r * Math.cos(theta),
      cy + r * Math.sin(theta)
    ];
  });
}
function shapeTriangle(width: number, height: number) {
  const cx = width / 2, cy = height / 2;
  const size = Math.min(width, height) * 0.36;
  const h = size * 0.87;
  const pts = [
    [cx, cy - h / 2],
    [cx + size / 2, cy + h / 2.4],
    [cx - size / 2.3, cy + h / 2]
  ];
  const out = [];
  for (let j = 0; j < 3; j++) {
    const [x1, y1] = pts[j];
    const [x2, y2] = pts[(j + 1) % 3];
    const n = j === 2 ? 14 : 14;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      out.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
    }
  }
  return out.slice(0, 42);
}
function shapeSquiggle(width: number, height: number) {
  // Formă foarte „weird”
  const cx = width / 2, cy = height / 2;
  const w = width * 0.37, h = height * 0.24;
  return Array.from({ length: 42 }, (_, i) => {
    const t = i / 41;
    const x = cx + w * Math.sin(3 * Math.PI * t) * Math.cos(2 * Math.PI * t);
    const y = cy + h * Math.sin(5 * Math.PI * t) * Math.cos(Math.PI * t);
    return [x, y];
  });
}
function randomPositions(width: number, height: number) {
  return Array.from({ length: 42 }, () => [
    20 + Math.random() * (width - 40),
    20 + Math.random() * (height - 40)
  ]);
}

const shapeList = [
  { key: "★", gen: shapeStar },
  { key: "~", gen: shapeWave },
  { key: "⊚", gen: shapeSpiral },
  { key: "△", gen: shapeTriangle },
  { key: "≋", gen: shapeSquiggle }
];

export default function ParticleZ({ colorMode = "bw" }) {
  const { width: WIDTH, height: HEIGHT } = useWindowDimensions();

  // --- Per-particle random walking ---
  const [freeTargets, setFreeTargets] = useState(() => randomPositions(WIDTH, HEIGHT));
  const freeTimers = useRef<(NodeJS.Timeout | null)[]>([]);

  function scheduleFreeTarget(i: number) {
    const moveParticle = () => {
      setFreeTargets((prev) => {
        const arr = [...prev];
        arr[i] = [
          20 + Math.random() * (WIDTH - 40),
          20 + Math.random() * (HEIGHT - 40)
        ];
        return arr;
      });
      // reprogramăm
      freeTimers.current[i] = setTimeout(moveParticle, 1000 + Math.random() * 1600); // 1–2.6s fiecare
    };
    freeTimers.current[i] = setTimeout(moveParticle, 400 + Math.random() * 1200);
  }

  useEffect(() => {
    if (mode === 'free') {
      for (let i = 0; i < 42; i++) {
        scheduleFreeTarget(i);
      }
    }
    return () => {
      for (let i = 0; i < 42; i++) {
        if (freeTimers.current[i]) clearTimeout(freeTimers.current[i]!);
        freeTimers.current[i] = null;
      }
    };
    // eslint-disable-next-line
  }, [WIDTH, HEIGHT, mode]);

  // --- END random walk logic ---

  const [mode, setMode] = useState<'shape' | 'free'>('free');
  const [shapeIndex, setShapeIndex] = useState(() => Math.floor(Math.random() * shapeList.length));
  const [positions, setPositions] = useState(() =>
    randomPositions(WIDTH, HEIGHT)
  );
  const anims = useRef(
    positions.map(([x, y]) => ({
      x: new Animated.Value(x),
      y: new Animated.Value(y)
    }))
  ).current;

  // BW elegant
  const dotColors = ["#15151e", "#3b3b3c", "#222", "#666", "#999", "#111"];
  const lineColor = "#222";
  const [opacity, setOpacity] = useState(new Animated.Value(1));

  // Interval logic: mult random, scurt formă
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === 'free') {
      interval = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0.12, duration: 700, useNativeDriver: true }).start(() => {
          // trecem la o formă random
          const next = Math.floor(Math.random() * shapeList.length);
          setShapeIndex(next);
          setPositions(shapeList[next].gen(WIDTH, HEIGHT));
          setMode('shape');
          Animated.timing(opacity, { toValue: 1, duration: 1200, useNativeDriver: true }).start();
        });
      }, 35000 + Math.random() * 13000); // 35–48 sec random!
    } else {
      interval = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0.12, duration: 500, useNativeDriver: true }).start(() => {
          setPositions(randomPositions(WIDTH, HEIGHT));
          setMode('free');
          Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
        });
      }, 2000 + Math.random() * 1200); // 2–3.2 sec pe formă
    }
    return () => clearTimeout(interval);
  }, [mode, shapeIndex, WIDTH, HEIGHT]);

  // Cheie: dacă suntem în formă → animăm toate spre formă.  
  // dacă suntem în random, animăm fiecare spre freeTargets[i] și actualizăm mereu (efect de „random walk”)
  useEffect(() => {
    if (mode === 'shape') {
      positions.forEach(([tx, ty], i) => {
        Animated.timing(anims[i].x, {
          toValue: tx,
          duration: 1800,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false
        }).start();
        Animated.timing(anims[i].y, {
          toValue: ty,
          duration: 1800,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false
        }).start();
      });
    }
    // eslint-disable-next-line
  }, [positions, WIDTH, HEIGHT, mode]);

  // Animăm spre freeTargets mereu cât suntem în random
  useEffect(() => {
    if (mode === 'free') {
      for (let i = 0; i < 42; i++) {
        Animated.timing(anims[i].x, {
          toValue: freeTargets[i][0],
          duration: 1200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false
        }).start();
        Animated.timing(anims[i].y, {
          toValue: freeTargets[i][1],
          duration: 1200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false
        }).start();
      }
    }
    // eslint-disable-next-line
  }, [freeTargets, WIDTH, HEIGHT, mode]);

  // Actualizează pozițiile curente pentru conexiuni
  const [currPos, setCurrPos] = useState(positions);
  useEffect(() => {
    const updates: number[] = [];
    anims.forEach((a, i) => {
      updates.push(
        a.x.addListener(({ value }) => setCurrPos(prev => {
          const cp = [...prev];
          cp[i] = [value, cp[i][1]];
          return cp;
        })),
        a.y.addListener(({ value }) => setCurrPos(prev => {
          const cp = [...prev];
          cp[i] = [cp[i][0], value];
          return cp;
        }))
      );
    });
    return () => updates.forEach(id => anims.forEach(a => {
      a.x.removeListener(id);
      a.y.removeListener(id);
    }));
    // eslint-disable-next-line
  }, [anims]);

  // Conexiuni mai vizibile în random mode
  const lines = [];
  const maxDist = mode === 'free' ? 82 : 48;
  for (let i = 0; i < currPos.length; i++) {
    for (let j = i + 1; j < currPos.length; j++) {
      const [x1, y1] = currPos[i];
      const [x2, y2] = currPos[j];
      const dist = Math.hypot(x1 - x2, y1 - y2);
      if (dist < maxDist) {
        lines.push({ x1, y1, x2, y2, alpha: mode === 'free'
          ? (0.09 + 0.28 * (1 - dist / maxDist))
          : (0.13 + 0.16 * (1 - dist / maxDist))
        });
      }
    }
  }

  return (
    <Animated.View style={{
      width: WIDTH,
      height: HEIGHT,
      alignSelf: 'center',
      opacity,
      position: 'absolute',
      left: 0, top: 0, right: 0, bottom: 0,
      zIndex: 0,
    }}>
      <Svg width={WIDTH} height={HEIGHT} style={{ position: 'absolute', left: 0, top: 0 }}>
        {lines.map((l, i) => (
          <Line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke={lineColor}
            strokeWidth="1"
            opacity={l.alpha}
          />
        ))}
        {anims.map((a, i) => (
          <AnimatedCircle
            key={i}
            animatedX={a.x}
            animatedY={a.y}
            r={4.1}
            fill={dotColors[i % dotColors.length]}
          />
        ))}
      </Svg>
    </Animated.View>
  );
}

function AnimatedCircle({ animatedX, animatedY, r, fill }: any) {
  const [cx, setCx] = useState(0);
  const [cy, setCy] = useState(0);
  useEffect(() => {
    const idX = animatedX.addListener(({ value }) => setCx(value));
    const idY = animatedY.addListener(({ value }) => setCy(value));
    return () => {
      animatedX.removeListener(idX);
      animatedY.removeListener(idY);
    };
  }, [animatedX, animatedY]);
  return (
    <Circle
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      opacity={0.92}
      stroke="#fff"
      strokeWidth={0.8}
    />
  );
}
