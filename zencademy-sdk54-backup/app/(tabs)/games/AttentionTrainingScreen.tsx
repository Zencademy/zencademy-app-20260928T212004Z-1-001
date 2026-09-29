import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../components/ThemeContext';

const getExercises = (theme: any) => [
  {
    key: 'focusEasy',
    icon: <Feather name="target" size={28} color={theme.text} />,
    title: 'Focus Tap',
    difficulty: 'Easy',
    route: '/games/easy/FocusEasyGame' as string,
  },
  {
    key: 'focusMedium',
    icon: <Feather name="crosshair" size={28} color={theme.text} />,
    title: 'Color Count Focus',
    difficulty: 'Medium',
    route: '/games/medium/FocusMediumGame' as string,
  },
  {
    key: 'sequenceTapMedium',
    icon: <Feather name="shuffle" size={28} color={theme.text} />,
    title: 'Sequence Tap',
    difficulty: 'Medium',
    route: '/games/medium/SequenceTapMediumGame' as string,
  },
];

function getBadgeStyle(level: string, isDark: boolean, theme: any) {
  switch (level) {
    case 'Easy':
      return { backgroundColor: isDark ? '#4CAF50' : '#e7e7e8', color: isDark ? '#fff' : '#23242b', borderColor: isDark ? '#4CAF50' : '#c7c7cb' };
    case 'Medium':
      return { backgroundColor: isDark ? '#FF9800' : '#b7b8ba', color: '#fff', borderColor: isDark ? '#FF9800' : '#939393' };
    case 'Hard':
      return { backgroundColor: isDark ? '#F44336' : '#23242b', color: '#fff', borderColor: isDark ? '#F44336' : '#23242b' };
    default:
      return { backgroundColor: isDark ? theme.surface : '#d8d9db', color: theme.text, borderColor: theme.border };
  }
}

// Helper pentru grupare pe categorii
const getGroupedExercises = (exercises: any[]) => exercises.reduce((acc, ex) => {
  if (!acc[ex.difficulty]) acc[ex.difficulty] = [];
  acc[ex.difficulty].push(ex);
  return acc;
}, {} as Record<string, any[]>);

const difficultyOrder = ['Easy', 'Medium', 'Hard'];
const difficultyLabels: Record<string, string> = {
  'Easy': 'Ușor',
  'Medium': 'Mediu',
  'Hard': 'Dificil',
};

export default function AttentionTrainingScreen() {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const exercises = getExercises(theme);
  const groupedExercises = getGroupedExercises(exercises);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.headerBar, { backgroundColor: theme.background, borderBottomColor: theme.border }]}> 
        <TouchableOpacity onPress={() => router.push('/MentalTrainingScreen')} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Attention Exercises</Text>
      </View>

      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Strengthen your focus and filtering abilities. Choose an exercise:
      </Text>
      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.background }]}> 
        {exercises.map(ex => {
          const badge = getBadgeStyle(ex.difficulty, themeMode === 'dark', theme);
          return (
            <View key={ex.key} style={{ width: '100%' }}>
              <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}
                activeOpacity={0.85}
                onPress={() => router.push(ex.route as any)}
              >
                <View style={[styles.iconWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>{ex.icon}</View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{ex.title}</Text>
                  {/* No hints or extra info shown */}
                </View>
                <View style={[
                  styles.badge,
                  { backgroundColor: badge.backgroundColor, borderColor: badge.borderColor }
                ]}>
                  <Text style={[styles.badgeText, { color: badge.color }]}>{ex.difficulty}</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
        {/* Did you know footer */}
        <View style={[styles.didYouKnowCard, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          <Text style={[styles.didYouKnowTitle, { color: theme.text }]}>Did you know?</Text>
          <Text style={[styles.didYouKnowText, { color: theme.textSecondary }]}>
            Regular attention training improves working memory, reduces reaction time, and boosts learning speed. 
            Just 5–10 minutes a day can enhance focus in study, work, and daily life.
          </Text>
        </View>
        <View style={{ height: 70 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 5,
    marginRight: 4,
    borderRadius: 9,
  },
  title: {
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
    flex: 1,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 8,
    paddingHorizontal: 22,
  },
  scrollContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
    paddingBottom: 24,
    paddingTop: 6,
  },
  card: {
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.1,
    paddingVertical: 19,
    paddingHorizontal: 15,
    marginBottom: 10,
    width: '98%',
    maxWidth: 390,
    minHeight: 68,
    shadowColor: '#111',
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 1,
    position: 'relative',
  },
  iconWrap: {
    borderRadius: 15,
    marginRight: 13,
    padding: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16.6,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 13.4,
    fontWeight: '500',
    opacity: 0.91,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 13,
    marginLeft: 12,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    minWidth: 56,
    borderWidth: 1,
    shadowColor: '#111',
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  badgeText: {
    fontWeight: '800',
    fontSize: 14.4,
    letterSpacing: 0.5,
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  didYouKnowCard: {
    width: '98%',
    maxWidth: 390,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginTop: 16,
  },
  didYouKnowTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  didYouKnowText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
