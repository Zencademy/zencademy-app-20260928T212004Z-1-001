import { Text, View } from 'react-native';
import { Page } from '../../components/Page';
import { useXP } from '../../components/XPContext';
import { useTheme } from '../../components/ThemeContext';
import { localDate } from '../../lib/dates';
export default function StatisticsScreen() {
  const { sessions, totalPoints, completed, streak } = useXP(); const { theme } = useTheme();
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return localDate(d); });
  return <Page title="Your progress"><Text style={{ color: theme.text }}>{totalPoints} lifetime XP · {completed} sessions · {streak} day streak</Text><Text style={{ color: theme.textSecondary }}>Last 7 days · completed sessions</Text>{days.map(day => { const items = sessions.filter(s => s.activity_day === day); return <View key={day} style={{ padding: 14, backgroundColor: theme.card, borderRadius: 12 }}><Text style={{ color: theme.text }}>{day}</Text><Text style={{ color: theme.textSecondary }}>{items.length} sessions · {Math.round(items.reduce((n, s) => n + s.duration_seconds, 0) / 60)} min · {items.reduce((n, s) => n + s.xp, 0)} XP</Text></View>; })}{sessions.length === 0 && <Text style={{ color: theme.text }}>Complete your first activity to start your history.</Text>}</Page>;
}
