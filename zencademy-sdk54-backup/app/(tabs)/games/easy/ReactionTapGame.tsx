import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import ConfettiCannon from 'react-native-confetti-cannon';
import GameHeader from '../../../../components/GameHeader';
import { useTheme } from '../../../../components/ThemeContext';
import { useXP } from '../../../../components/XPContext';

const ROUNDS = 5;
const XP_PER_CORRECT = 5; // easy games: +5 points per correct answer
const XP_REWARD = 25; // Bonus for completing the game
const MAX_XP = 15;
const FULL_WIDTH = Dimensions.get('window').width;
const LIGHT_COUNT = 5;
const TOO_SLOW = 700; // ms

export default function ReactionF1Game() {
  const router = useRouter();
  const { addXp } = useXP();
  const { theme } = useTheme();

  const [round, setRound] = useState(0);
  const [lights, setLights] = useState(Array(LIGHT_COUNT).fill("off"));
  const [phase, setPhase] = useState("init");
  const [reactionTimes, setReactionTimes] = useState([]);
  const [startTime, setStartTime] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [restartKey, setRestartKey] = useState(0); // KEY pentru reset complet!

  const tapAnim = useRef(new Animated.Value(0)).current;
  const timersRef = useRef<number[]>([]);

  const avg = reactionTimes.length
    ? Math.round(reactionTimes.filter(x => typeof x === "number").reduce((a, b) => a + b, 0) / reactionTimes.filter(x => typeof x === "number").length)
    : 0;
  const wins = reactionTimes.filter(x => typeof x === "number" && x <= TOO_SLOW).length;
  const xp =
    wins === ROUNDS ? MAX_XP :
    wins >= 3 ? Math.floor(MAX_XP * 0.7) :
    wins >= 1 ? Math.floor(MAX_XP * 0.4) :
    0;

  function clearAllTimers() {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  }

  function startRedLightsSequence() {
    setLights(Array(LIGHT_COUNT).fill("off"));
    setPhase("init");
    clearAllTimers();

    let curr = 0;
    function nextRed() {
      setLights(_ => {
        const arr = Array(LIGHT_COUNT).fill("off");
        for (let i = 0; i <= curr; i++) arr[i] = "red";
        return arr;
      });
      curr++;
      if (curr < LIGHT_COUNT) {
        // DIFERENTA MAI MARE: 700–1600ms
        const interval = 700 + Math.random() * 900;
        timersRef.current.push(setTimeout(nextRed, interval));
      } else {
        const pause = 650 + Math.random() * 700;
        timersRef.current.push(setTimeout(() => {
          setLights(Array(LIGHT_COUNT).fill("green"));
          setPhase("go");
          setStartTime(Date.now());
          timersRef.current.push(setTimeout(() => {
            if (phase === "go") setPhase("too-slow");
          }, TOO_SLOW + 40));
        }, pause));
      }
    }
    // Delay initial 850–1200ms toate gri
    const initialDelay = 850 + Math.random() * 350;
    timersRef.current.push(setTimeout(nextRed, initialDelay));
  }

  // Pornim secvența la orice schimbare de round SAU la orice reset complet (restartKey)
  useEffect(() => {
    if (round >= ROUNDS) {
      setPhase("done");
      if (xp > 0) setShowConfetti(true);
      if (xp > 0) addXp(xp);
      return;
    }
    startRedLightsSequence();
    return clearAllTimers;
    // eslint-disable-next-line
  }, [round, restartKey]); // <- și restartKey!

  useEffect(() => {
    if (phase === "success") {
      timersRef.current.push(setTimeout(() => {
        setRound(r => r + 1);
        setLights(Array(LIGHT_COUNT).fill("off"));
        setPhase("init");
      }, 1000));
    }
    return clearAllTimers;
    // eslint-disable-next-line
  }, [phase]);

  function handleRestart() {
    clearAllTimers();
    setRestartKey(k => k + 1); // forțează restart total, efectul pornește sigur!
    setRound(0);
    setReactionTimes([]);
    setShowConfetti(false);
    setLights(Array(LIGHT_COUNT).fill("off"));
    setPhase("init");
  }

  function handleBack() {
    clearAllTimers();
    router.replace('/games/AttentionTrainingScreen');
  }

  function handleTap() {
    if (phase === "go") {
      const reaction = Date.now() - startTime;
      if (reaction > TOO_SLOW) {
        setPhase("too-slow");
      } else {
        setPhase("success");
        setReactionTimes(rts => [...rts, reaction]);
        Animated.sequence([
          Animated.timing(tapAnim, { toValue: 1, duration: 120, useNativeDriver: false }),
          Animated.timing(tapAnim, { toValue: 0, duration: 160, useNativeDriver: false }),
        ]).start();
      }
    } else if (phase === "init" || phase === "lights") {
      setPhase("false");
    }
  }

  function renderLights() {
    if (phase !== "init" && phase !== "go" && phase !== "lights") return null;
    return (
      <View style={styles.lightsRow}>
        {lights.slice(0, LIGHT_COUNT).map((state, i) => (
          <View
            key={i}
            style={[
              styles.light,
              state === "off" && styles.lightOff,
              state === "red" && styles.lightRed,
              state === "green" && styles.lightGreen,
            ]}
          />
        ))}
      </View>
    );
  }

  const tapStyle = {
    backgroundColor: tapAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [phase === "success" ? "#c8fcb8" : "#fff", "#a1ffa6"]
    }),
  };

  if (phase === "false" || phase === "too-slow") {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <GameHeader
          onBack={handleBack}
          gameTitle="Reaction Tap Easy"
          gameDescription="Test your reaction time and focus by tapping circles as quickly as possible."
          gameInstructions="Tap the circles as quickly as possible when they appear. Each correct tap gives you +5 points!"
        />
        <View style={styles.gameContent}>
          <View style={[styles.tryAgainCard, { backgroundColor: theme.card }]}>
            <Text style={[
              styles.tryAgainTitle,
              { color: theme.error }
            ]}>
              {phase === "false" ? "False start!" : "Too late!"}
            </Text>
            <Text style={[styles.tryAgainText, { color: theme.textSecondary }]}>
              {phase === "false"
                ? "You tapped before the lights turned green."
                : "You were too slow. Try to tap in under 700ms!"}
            </Text>
            <TouchableOpacity style={[styles.tryAgainBtn, { backgroundColor: theme.primary }]} onPress={handleRestart}>
              <Text style={[styles.tryAgainBtnText, { color: theme.buttonText }]}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (phase === "success") {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <GameHeader
          onBack={handleBack}
          gameTitle="Reaction Tap Easy"
          gameDescription="Test your reaction time and focus by tapping circles as quickly as possible."
          gameInstructions="Tap the circles as quickly as possible when they appear. Each correct tap gives you +5 points!"
        />
        <View style={styles.gameContent}>
          <ConfettiCannon
            count={55}
            origin={{ x: FULL_WIDTH / 2, y: -22 }}
            fadeOut
            autoStart
            explosionSpeed={410}
            fallSpeed={2100}
          />
          <View style={[styles.successCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.successText, { color: theme.primary }]}>Success!</Text>
            <Text style={[styles.successTime, { color: theme.textSecondary }]}>Reaction: {reactionTimes[reactionTimes.length - 1]} ms</Text>
          </View>
        </View>
      </View>
    );
  }

  if (phase === "done") {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <GameHeader
          onBack={handleBack}
          gameTitle="Reaction Tap Easy"
          gameDescription="Test your reaction time and focus by tapping circles as quickly as possible."
          gameInstructions="Tap the circles as quickly as possible when they appear. Each correct tap gives you +5 points!"
        />
        <View style={styles.gameContent}>
          {showConfetti && (
            <ConfettiCannon
              count={100}
              origin={{ x: FULL_WIDTH / 2, y: -22 }}
              fadeOut
              autoStart
              explosionSpeed={410}
              fallSpeed={3100}
            />
          )}
          <Text style={[styles.bigText, { color: theme.text }]}>Race Complete!</Text>
          <Text style={[styles.xpResult, { color: theme.text }]}>
            Average Reaction: <Text style={{ color: theme.primary }}>{isNaN(avg) ? 0 : avg} ms</Text>
          </Text>
          <Text style={[styles.xpResult, { color: theme.text }]}>
            Correct starts: <Text style={{ color: theme.primary }}>{wins}/{ROUNDS}</Text>
          </Text>
          <Text style={[styles.xpResult, { color: theme.text }]}>
            XP gained: <Text style={{ color: theme.primary }}>{xp}</Text>
          </Text>
          <TouchableOpacity style={[styles.tryAgainBtn, { backgroundColor: theme.primary }]} onPress={handleRestart}>
            <Text style={[styles.tryAgainBtnText, { color: theme.buttonText }]}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exitBtn, { backgroundColor: theme.surface }]} onPress={handleBack}>
            <Text style={[styles.exitBtnText, { color: theme.text }]}>← Back to category</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <GameHeader
          onBack={handleBack}
          gameTitle="Reaction Tap Easy"
          gameDescription="Test your reaction time and focus by tapping circles as quickly as possible."
          gameInstructions="Tap the circles as quickly as possible when they appear. Each correct tap gives you +5 points!"
        />
        <View style={styles.gameContent}>
          {renderLights()}
          <Animated.View
            style={[
              styles.tapArea,
              { backgroundColor: theme.card },
              tapStyle,
              phase === "go" && [styles.tapAreaActive, { backgroundColor: theme.primary + '20' }],
            ]}
          >
            <TouchableOpacity
              style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center" }}
              onPress={handleTap}
              activeOpacity={1}
              disabled={phase === "false" || phase === "too-slow" || phase === "done" || phase === "success"}
            >
              {phase === "go" ? (
                <Text style={[styles.tapText, { color: theme.primary }]}>GO! TAP!</Text>
              ) : (
                <Text style={[styles.tapText, { color: theme.text }]}>Wait for lights...</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
          <Text style={[styles.progress, { color: theme.primary }]}>
            Round {round + 1} / {ROUNDS}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

// stilurile rămân identice cu cele din exemplele anterioare!



const styles = StyleSheet.create({
  container: {
    flex: 1, width: "100%",
  },
  gameContent: {
    flex: 1, alignItems: "center", justifyContent: "center",
  },
  lightsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 16,
    gap: 14,
  },
  light: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 6,
    borderWidth: 2.5,
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 5,
    elevation: 2,
  },
  lightOff: {
    // Colors will be set dynamically
  },
  lightRed: {
    backgroundColor: "#fe5356",
    borderColor: "#be1013",
    shadowColor: "#f74a4a",
    shadowOpacity: 0.23,
    shadowRadius: 6,
    elevation: 7,
  },
  lightGreen: {
    backgroundColor: "#7ef963",
    borderColor: "#1d7d34",
    shadowColor: "#74fcac",
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 8,
  },
  tapArea: {
    width: "88%",
    height: 170,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#19bfa4",
    shadowOpacity: 0.11,
    shadowRadius: 15,
    marginBottom: 23,
    marginTop: 5,
    borderWidth: 2,
    alignSelf: "center",
  },
  tapAreaActive: {
    // Colors will be set dynamically
  },
  tapText: {
    fontSize: 27,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1.3,
  },
  progress: {
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginTop: 5,
  },
  xpBar: {
    marginTop: 9,
    fontSize: 17.5,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 7,
  },
  bigText: {
    fontSize: 32, fontWeight: "bold", marginBottom: 18, textAlign: "center",
  },
  xpResult: {
    fontSize: 18, fontWeight: "700", marginBottom: 8, textAlign: "center",
  },
  tryAgainCard: {
    borderRadius: 22,
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    width: "88%",
    marginTop: 15,
  },
  tryAgainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 7,
    textAlign: "center",
  },
  tryAgainText: {
    fontSize: 17,
    marginBottom: 20,
    textAlign: "center",
  },
  tryAgainBtn: {
    paddingVertical: 13,
    paddingHorizontal: 46,
    borderRadius: 15,
    marginBottom: 13,
    marginTop: 7,
    elevation: 2,
  },
  tryAgainBtnText: {
    fontWeight: "900", fontSize: 17, letterSpacing: 0.9,
  },
  exitAbs: {
    position: "absolute",
    top: Platform.OS === 'ios' ? 34 : 16,
    right: 18,
    zIndex: 10,
    borderRadius: 20,
    width: 40, height: 40,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  exitAbsText: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 28,
  },
  exitBtnText: {
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 0.8,
  },
  greenMarginWrap: {
    position: "absolute",
    top: 35, left: 0, right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    pointerEvents: "none",
    zIndex: 4,
    paddingHorizontal: 19,
  },
  greenMarginLight: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: "#33e36a",
    borderWidth: 3,
    borderColor: "#b6fbbd",
    shadowColor: "#18dc4e",
    shadowOpacity: 0.11,
    shadowRadius: 10,
    elevation: 7,
  },
  successCard: {
    backgroundColor: "#f8fff9",
    borderRadius: 18,
    paddingVertical: 29,
    paddingHorizontal: 34,
    alignItems: "center",
    marginTop: 20,
  },
  successText: {
    fontSize: 29,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  successTime: {
    fontSize: 20,
    color: "#34a853",
    fontWeight: "bold",
    marginBottom: 19,
    textAlign: "center",
  }
});
