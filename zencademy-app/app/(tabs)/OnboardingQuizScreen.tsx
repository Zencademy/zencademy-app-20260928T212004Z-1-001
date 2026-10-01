import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../components/AuthContext';
import { useTheme } from '../../components/ThemeContext';
import { useXP } from '../../components/XPContext';
import { FadeRise } from '../../components/ui/motion';
import { type } from '../../components/ui/type';
import { MIND_PROFILES, type MindTypeId } from '../../lib/mindTypes';

type Question = {
  id: string;
  prompt: string;
  hint?: string;
  options: { label: string; type: MindTypeId }[];
};

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    prompt: 'When a complex problem lands on your desk, what do you do first?',
    hint: 'Pick the instinct that feels most natural — not the “correct” answer.',
    options: [
      { label: 'Map the variables and eliminate noise', type: 'Logic Guru' },
      { label: 'Scan for similar cases I already solved', type: 'Memory Master' },
      { label: 'Clear the field and protect focus time', type: 'Focus Champion' },
      { label: 'Define the outcome, then reverse-plan steps', type: 'Strategic Thinker' },
    ],
  },
  {
    id: 'q2',
    prompt: 'In a long training block, what keeps you engaged?',
    options: [
      { label: 'A clear rule system I can optimize', type: 'Logic Guru' },
      { label: 'Remembering sequences and improving recall', type: 'Memory Master' },
      { label: 'Uninterrupted concentration on one target', type: 'Focus Champion' },
      { label: 'Seeing how today’s set feeds a bigger plan', type: 'Strategic Thinker' },
    ],
  },
  {
    id: 'q3',
    prompt: 'You walk into a room mid-conversation. What do you notice first?',
    options: [
      { label: 'Whether the argument is actually sound', type: 'Logic Guru' },
      { label: 'Names, facts, and who said what earlier', type: 'Memory Master' },
      { label: 'Visual patterns — posture, layout, signals', type: 'Pattern Pro' },
      { label: 'The fastest useful move I can make', type: 'Quick Reactor' },
    ],
  },
  {
    id: 'q4',
    prompt: 'Under time pressure, your default is to…',
    options: [
      { label: 'Slow down enough to think cleanly', type: 'Logic Guru' },
      { label: 'Pull a known template from memory', type: 'Memory Master' },
      { label: 'Ignore noise and finish the critical path', type: 'Focus Champion' },
      { label: 'Act first, then adjust mid-flight', type: 'Quick Reactor' },
    ],
  },
  {
    id: 'q5',
    prompt: 'Which feedback feels most useful after a session?',
    options: [
      { label: 'Where my reasoning broke down', type: 'Logic Guru' },
      { label: 'What I retained vs. what slipped', type: 'Memory Master' },
      { label: 'How long I stayed locked on target', type: 'Focus Champion' },
      { label: 'Whether the plan still holds for next week', type: 'Strategic Thinker' },
    ],
  },
  {
    id: 'q6',
    prompt: 'You are learning a new skill. Your preferred path is…',
    options: [
      { label: 'Principles first, then practice', type: 'Logic Guru' },
      { label: 'Spaced repetition until it sticks', type: 'Memory Master' },
      { label: 'Deep blocks without multitasking', type: 'Focus Champion' },
      { label: 'Spotting the recurring shape across examples', type: 'Pattern Pro' },
    ],
  },
  {
    id: 'q7',
    prompt: 'In a team setting, you naturally contribute by…',
    options: [
      { label: 'Stress-testing the logic of the plan', type: 'Logic Guru' },
      { label: 'Holding context others forget', type: 'Memory Master' },
      { label: 'Setting a multi-step roadmap', type: 'Strategic Thinker' },
      { label: 'Reading the room and connecting signals', type: 'Pattern Pro' },
    ],
  },
  {
    id: 'q8',
    prompt: 'A game timer hits zero. What happens in your head?',
    options: [
      { label: 'I recheck the last decision for flaws', type: 'Logic Guru' },
      { label: 'I replay the sequence I just ran', type: 'Memory Master' },
      { label: 'I reset attention and start clean', type: 'Focus Champion' },
      { label: 'I already switched to the next move', type: 'Quick Reactor' },
    ],
  },
  {
    id: 'q9',
    prompt: 'Which statement sounds most like you?',
    options: [
      { label: 'If the model is wrong, the result is wrong', type: 'Logic Guru' },
      { label: 'What I can recall, I can use', type: 'Memory Master' },
      { label: 'Depth beats scattering effort', type: 'Focus Champion' },
      { label: 'Today’s choice must still look good tomorrow', type: 'Strategic Thinker' },
    ],
  },
  {
    id: 'q10',
    prompt: 'When studying a chart or diagram, you…',
    options: [
      { label: 'Hunt for the underlying rule', type: 'Logic Guru' },
      { label: 'Commit the key points to memory', type: 'Memory Master' },
      { label: 'See the structure before the labels', type: 'Pattern Pro' },
      { label: 'Extract the action item immediately', type: 'Quick Reactor' },
    ],
  },
  {
    id: 'q11',
    prompt: 'Your ideal training week has…',
    options: [
      { label: 'Hard logic sets with clear scoring', type: 'Logic Guru' },
      { label: 'Daily recall drills that build capacity', type: 'Memory Master' },
      { label: 'Protected focus blocks and few switches', type: 'Focus Champion' },
      { label: 'A plan that unlocks harder tiers over time', type: 'Strategic Thinker' },
    ],
  },
  {
    id: 'q12',
    prompt: 'When something unexpected breaks your rhythm, you…',
    options: [
      { label: 'Diagnose the failure mode calmly', type: 'Logic Guru' },
      { label: 'Compare it to a prior save', type: 'Memory Master' },
      { label: 'Return to the original target fast', type: 'Focus Champion' },
      { label: 'Adapt in the moment and keep moving', type: 'Quick Reactor' },
    ],
  },
];

type Stage = 'welcome' | 'name' | 'brief' | 'quiz' | 'result' | 'permissions';

type Props = { onFinish?: () => void | Promise<void> };

function scoreMindType(answers: MindTypeId[]): MindTypeId {
  const tally: Partial<Record<MindTypeId, number>> = {};
  for (const a of answers) tally[a] = (tally[a] || 0) + 1;
  const ranked = (Object.entries(tally) as [MindTypeId, number][]).sort((a, b) => b[1] - a[1]);
  const top = ranked.filter(([, n]) => n === ranked[0][1]).map(([id]) => id);
  const preference: MindTypeId[] = [
    'Focus Champion',
    'Strategic Thinker',
    'Logic Guru',
    'Memory Master',
    'Pattern Pro',
    'Quick Reactor',
  ];
  return preference.find((p) => top.includes(p)) || top[0] || 'Focus Champion';
}

async function requestNotifPermission() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export default function OnboardingQuizScreen({ onFinish }: Props) {
  const { theme } = useTheme();
  const { clearNewUserFlag } = useAuth();
  const { name: existingName, setName, setBrainType, setOnboardingChecked } = useXP();
  const params = useLocalSearchParams<{ retake?: string }>();
  const isRetake = params.retake === '1' || params.retake === 'true';

  const [stage, setStage] = useState<Stage>(isRetake ? 'brief' : 'welcome');
  const [displayName, setDisplayName] = useState(existingName && existingName !== 'Member' ? existingName : '');
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<MindTypeId[]>([]);
  const [resultId, setResultId] = useState<MindTypeId | null>(null);
  const [saving, setSaving] = useState(false);
  const [notifStatus, setNotifStatus] = useState<'idle' | 'granted' | 'denied'>('idle');
  const progressAnim = useRef(new Animated.Value(0)).current;

  const progress = stage === 'quiz' ? (step + (selected !== null ? 0.35 : 0)) / QUESTIONS.length : stage === 'result' || stage === 'permissions' ? 1 : 0;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const profile = useMemo(() => (resultId ? MIND_PROFILES[resultId] : null), [resultId]);

  const finishAndGo = async (mind: MindTypeId, nameValue: string, nextRoute?: string) => {
    setSaving(true);
    try {
      const clean = nameValue.trim() || existingName || 'Member';
      if (!isRetake || clean !== existingName) await setName(clean);
      await setBrainType(mind);
      // Retake only updates mind type — never resets XP/coins/onboarding flag incorrectly
      if (!isRetake) {
        await setOnboardingChecked(true);
        await clearNewUserFlag();
        await onFinish?.();
      }
      if (nextRoute) {
        router.replace(nextRoute as never);
      } else if (isRetake) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch {
      if (!isRetake) {
        await setOnboardingChecked(true);
        await onFinish?.();
      }
      if (isRetake) router.back();
      else router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  const skip = async () => {
    if (isRetake) {
      router.back();
      return;
    }
    setSaving(true);
    try {
      await setOnboardingChecked(true);
      await clearNewUserFlag();
      await onFinish?.();
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  const chooseOption = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    void Haptics.selectionAsync();
    const choice = QUESTIONS[step].options[index].type;
    const next = [...answers, choice];
    setTimeout(() => {
      if (step + 1 >= QUESTIONS.length) {
        const mind = scoreMindType(next);
        setAnswers(next);
        setResultId(mind);
        setStage('result');
        setSelected(null);
      } else {
        setAnswers(next);
        setStep((s) => s + 1);
        setSelected(null);
      }
    }, 220);
  };

  const Header = ({ showSkip = true }: { showSkip?: boolean }) => (
    <View style={styles.header}>
      {showSkip ? (
        <Pressable onPress={() => { void skip(); }} hitSlop={12} style={styles.headerSide}>
          <Text style={[type.label, { color: theme.textTertiary }]}>{isRetake ? 'Close' : 'Skip'}</Text>
        </Pressable>
      ) : (
        <View style={styles.headerSide} />
      )}
      <Text style={[type.brand, { color: theme.text }]}>ZENCADEMY</Text>
      <View style={styles.headerSide} />
    </View>
  );

  const Progress = () => (
    <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            backgroundColor: theme.primary,
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {stage === 'welcome' && (
          <View style={styles.screenPad}>
            <Header />
            <View style={styles.hero}>
              <FadeRise>
                <Text style={[type.label, { color: theme.textTertiary, marginBottom: 14 }]}>Welcome</Text>
                <Text style={[type.title, { color: theme.text, fontSize: 34, lineHeight: 40 }]}>
                  Train the mind.{'\n'}Earn the edge.
                </Text>
                <Text style={[type.subtitle, { color: theme.textSecondary, marginTop: 14, maxWidth: 320 }]}>
                  A short assessment maps how you think — so training starts where you are strongest.
                </Text>
              </FadeRise>
            </View>
            <FadeRise delay={80}>
              <Pressable
                onPress={() => setStage('name')}
                style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={[type.button, { color: theme.buttonText }]}>Begin</Text>
              </Pressable>
              <Text style={[type.body, { color: theme.textTertiary, textAlign: 'center', marginTop: 14 }]}>
                About 3 minutes · 12 questions
              </Text>
            </FadeRise>
          </View>
        )}

        {stage === 'name' && (
          <View style={styles.screenPad}>
            <Header />
            <FadeRise>
              <Text style={[type.label, { color: theme.textTertiary, marginBottom: 10 }]}>Identity</Text>
              <Text style={[type.title, { color: theme.text }]}>What should we call you?</Text>
              <Text style={[type.subtitle, { color: theme.textSecondary, marginTop: 8 }]}>
                Shown on your profile and leaderboard. You can change it later.
              </Text>
            </FadeRise>
            <FadeRise delay={60}>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                placeholderTextColor={theme.textTertiary}
                autoFocus
                maxLength={24}
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.border, backgroundColor: theme.card },
                ]}
                returnKeyType="done"
                onSubmitEditing={() => setStage('brief')}
              />
            </FadeRise>
            <Pressable
              onPress={() => setStage('brief')}
              style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 8 }]}
            >
              <Text style={[type.button, { color: theme.buttonText }]}>Continue</Text>
            </Pressable>
          </View>
        )}

        {stage === 'brief' && (
          <View style={styles.screenPad}>
            <Header />
            <FadeRise>
              <Text style={[type.label, { color: theme.textTertiary, marginBottom: 10 }]}>
                {isRetake ? 'Retake mind type' : 'Mind type'}
              </Text>
              <Text style={[type.title, { color: theme.text }]}>
                {isRetake ? 'Update how you think' : 'How you think shapes how you train'}
              </Text>
              <Text style={[type.subtitle, { color: theme.textSecondary, marginTop: 10 }]}>
                {isRetake
                  ? 'Your XP, coins, and streak stay exactly as they are. Only your mind type updates.'
                  : 'Answer honestly. There are no wrong choices — only a clearer starting profile.'}
              </Text>
            </FadeRise>
            <FadeRise delay={70}>
              <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {[
                  { icon: 'layers-outline' as const, text: '12 calibrated prompts' },
                  { icon: 'analytics-outline' as const, text: 'One primary mind type' },
                  { icon: 'barbell-outline' as const, text: 'Training paths matched to you' },
                ].map((row) => (
                  <View key={row.text} style={styles.infoRow}>
                    <Ionicons name={row.icon} size={18} color={theme.primary} />
                    <Text style={[type.body, { color: theme.text, flex: 1 }]}>{row.text}</Text>
                  </View>
                ))}
              </View>
            </FadeRise>
            <Pressable
              onPress={() => {
                setStep(0);
                setAnswers([]);
                setSelected(null);
                setStage('quiz');
              }}
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={[type.button, { color: theme.buttonText }]}>Start assessment</Text>
            </Pressable>
          </View>
        )}

        {stage === 'quiz' && (
          <View style={{ flex: 1 }}>
            <View style={[styles.screenPad, { paddingBottom: 0 }]}>
              <Header showSkip />
              <Progress />
              <Text style={[type.label, { color: theme.textTertiary, marginTop: 14, marginBottom: 6 }]}>
                Question {step + 1} of {QUESTIONS.length}
              </Text>
            </View>
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <FadeRise key={QUESTIONS[step].id}>
                <Text style={[type.title, { color: theme.text, fontSize: 22, lineHeight: 30 }]}>
                  {QUESTIONS[step].prompt}
                </Text>
                {QUESTIONS[step].hint ? (
                  <Text style={[type.body, { color: theme.textTertiary, marginTop: 8 }]}>
                    {QUESTIONS[step].hint}
                  </Text>
                ) : null}
              </FadeRise>
              <View style={{ marginTop: 22, gap: 10 }}>
                {QUESTIONS[step].options.map((opt, i) => {
                  const on = selected === i;
                  return (
                    <Pressable
                      key={opt.label}
                      onPress={() => chooseOption(i)}
                      style={[
                        styles.option,
                        {
                          backgroundColor: on ? theme.surface : theme.card,
                          borderColor: on ? theme.primary : theme.border,
                          borderWidth: on ? 2 : 1,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.optionIndex,
                          { backgroundColor: on ? theme.primary : theme.surface, borderColor: theme.border },
                        ]}
                      >
                        <Text style={[type.label, { color: on ? theme.buttonText : theme.textSecondary, letterSpacing: 0 }]}>
                          {String.fromCharCode(65 + i)}
                        </Text>
                      </View>
                      <Text style={[type.body, { color: theme.text, flex: 1, fontWeight: '600' }]}>{opt.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        {stage === 'result' && profile && (
          <ScrollView contentContainerStyle={[styles.screenPad, { paddingBottom: 48 }]} showsVerticalScrollIndicator={false}>
            <Header showSkip={false} />
            <FadeRise>
              <Text style={[type.label, { color: theme.textTertiary, marginBottom: 10 }]}>Your mind type</Text>
              <LinearGradient
                colors={[theme.surface, theme.card]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.resultCard, { borderColor: theme.border }]}
              >
                <Text style={[type.title, { color: theme.text, fontSize: 28 }]}>{profile.title}</Text>
                <Text style={[type.subtitle, { color: theme.primary, marginTop: 6, fontWeight: '700' }]}>
                  {profile.tagline}
                </Text>
                <Text style={[type.body, { color: theme.textSecondary, marginTop: 14 }]}>{profile.body}</Text>
              </LinearGradient>
            </FadeRise>

            <FadeRise delay={70}>
              <Text style={[type.label, { color: theme.textTertiary, marginTop: 22, marginBottom: 10 }]}>Strengths</Text>
              <View style={{ gap: 8 }}>
                {profile.strengths.map((s) => (
                  <View key={s} style={[styles.chipRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
                    <Text style={[type.body, { color: theme.text }]}>{s}</Text>
                  </View>
                ))}
              </View>
            </FadeRise>

            <FadeRise delay={110}>
              <Text style={[type.label, { color: theme.textTertiary, marginTop: 22, marginBottom: 10 }]}>
                Start training here
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {profile.train.map((t) => (
                  <View
                    key={t}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: theme.border,
                      backgroundColor: theme.surface,
                    }}
                  >
                    <Text style={[type.label, { color: theme.textSecondary, letterSpacing: 0.4 }]}>{t}</Text>
                  </View>
                ))}
              </View>
            </FadeRise>

            <Text style={[type.body, { color: theme.textTertiary, marginTop: 20 }]}>
              XP unlocks Medium at level 2 and Hard at level 5. Coins buy shop items — never training access.
            </Text>

            <Pressable
              disabled={saving}
              onPress={() => {
                if (isRetake) {
                  void finishAndGo(profile.id, displayName);
                } else {
                  setStage('permissions');
                }
              }}
              style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 24, opacity: saving ? 0.6 : 1 }]}
            >
              <Text style={[type.button, { color: theme.buttonText }]}>
                {isRetake ? (saving ? 'Saving…' : 'Save mind type') : 'Continue'}
              </Text>
            </Pressable>
          </ScrollView>
        )}

        {stage === 'permissions' && profile && (
          <View style={styles.screenPad}>
            <Header showSkip={false} />
            <FadeRise>
              <Text style={[type.label, { color: theme.textTertiary, marginBottom: 10 }]}>Stay sharp</Text>
              <Text style={[type.title, { color: theme.text }]}>Turn on reminders?</Text>
              <Text style={[type.subtitle, { color: theme.textSecondary, marginTop: 10 }]}>
                One streak saver per day and optional training nudges. You can change this anytime in Settings.
              </Text>
            </FadeRise>
            <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border, marginVertical: 28 }]}>
              <View style={styles.infoRow}>
                <Ionicons name="notifications-outline" size={18} color={theme.primary} />
                <Text style={[type.body, { color: theme.text, flex: 1 }]}>
                  {notifStatus === 'granted'
                    ? 'Notifications enabled'
                    : notifStatus === 'denied'
                      ? 'Permission declined — you can enable later'
                      : 'Protect your streak with one evening reminder'}
                </Text>
              </View>
            </View>
            <Pressable
              disabled={saving}
              onPress={async () => {
                const ok = await requestNotifPermission();
                setNotifStatus(ok ? 'granted' : 'denied');
                await finishAndGo(profile.id, displayName, profile.startRoute);
              }}
              style={[styles.primaryBtn, { backgroundColor: theme.primary, opacity: saving ? 0.6 : 1 }]}
            >
              <Text style={[type.button, { color: theme.buttonText }]}>
                {saving ? 'Saving…' : profile.startLabel}
              </Text>
            </Pressable>
            <Pressable
              disabled={saving}
              onPress={() => { void finishAndGo(profile.id, displayName); }}
              style={[styles.primaryBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border, marginTop: 10 }]}
            >
              <Text style={[type.button, { color: theme.text }]}>Enter Home instead</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenPad: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    minHeight: 40,
  },
  headerSide: { width: 56, alignItems: 'flex-start' },
  hero: { flex: 1, justifyContent: 'center', paddingVertical: 24 },
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    fontWeight: '600',
    marginTop: 28,
    marginBottom: 16,
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    marginVertical: 28,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: { height: '100%', borderRadius: 2 },
  option: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIndex: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
});
