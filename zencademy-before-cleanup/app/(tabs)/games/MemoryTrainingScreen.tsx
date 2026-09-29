import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../components/ThemeContext';

const getExercises = (theme: any) => [
  {
    key: 'numberrecall',
    icon: <MaterialCommunityIcons name="numeric" size={28} color={theme.text} />,
    title: 'Number Recall',
    desc: 'Memorize a sequence of numbers and tap them in order.',
    difficulty: 'Easy',
    route: '/games/easy/NumberRecallGame',
  },
  {
    key: 'gridpattern',
    icon: <MaterialCommunityIcons name="grid" size={28} color={theme.text} />,
    title: 'Grid Pattern Memory',
    desc: 'Memorize a pattern on the grid and recreate it.',
    difficulty: 'Medium',
    route: '/games/medium/GridPatternMemoryGame',
  },
  {
    key: 'sequencerecall',
    icon: <Feather name="repeat" size={28} color={theme.text} />,
    title: 'Sequence Recall',
    desc: 'Watch a sequence and tap the cells in the same order.',
    difficulty: 'Hard',
    route: '/games/hard/SequenceRecallGame',
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

export default function MemoryTrainingScreen() {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const exercises = getExercises(theme);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.headerBar, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => router.push('/MentalTrainingScreen')} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Memory Exercises</Text>
      </View>

      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Strengthen your short and long-term memory. Choose an exercise:
      </Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {exercises.map(ex => {
          const badge = getBadgeStyle(ex.difficulty, themeMode === 'dark', theme);
          return (
            <TouchableOpacity
              key={ex.key}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
              activeOpacity={0.85}
              onPress={() => router.push(ex.route as any)}
            >
              <View style={[styles.iconWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>{ex.icon}</View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{ex.title}</Text>
                <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{ex.desc}</Text>
              </View>
              <View style={[
                styles.badge,
                { backgroundColor: badge.backgroundColor, borderColor: badge.borderColor }
              ]}>
                <Text style={[styles.badgeText, { color: badge.color }]}>{ex.difficulty}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        {/* Did you know footer */}
        <View style={[styles.didYouKnowCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.didYouKnowTitle, { color: theme.text }]}>Did you know?</Text>
          <Text style={[styles.didYouKnowText, { color: theme.textSecondary }]}>
            Short, consistent memory training strengthens neural pathways and improves recall speed. 
            Practicing a few minutes daily can boost learning, names-and-faces recall, and problem solving.
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
    paddingTop: 16,
    paddingBottom: 5,
    paddingHorizontal: 10,
  },
  backBtn: {
    padding: 5,
    marginRight: 4,
    borderRadius: 9,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
    flex: 1,
  },
  subtitle: {
    fontSize: 14.5,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 12,
    paddingHorizontal: 22,
  },
  scrollContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
    paddingBottom: 30,
  },
  card: {
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.1,
    paddingVertical: 19,
    paddingHorizontal: 15,
    marginBottom: 13,
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
    fontSize: 15.9,
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
    fontWeight: '700',
    fontSize: 13.2,
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
