import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../components/AuthContext';
import { useTheme } from '../../components/ThemeContext';
import { useXP } from '../../components/XPContext';
import { PrimaryButton, Screen } from '../../components/ui/Screen';
import { type } from '../../components/ui/type';
import { isAdminUser } from '../../hooks/useGameReward';
import { coinsForXp } from '../../lib/progression';

export default function AdminEditorScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { totalPoints, coins, level, addXp, refresh } = useXP();

  if (!isAdminUser(user)) {
    return (
      <Screen title="Admin" subtitle="Restricted" backTo="/(tabs)" wallet={false}>
        <Text style={[type.body, { color: theme.textSecondary }]}>This screen is only for the admin account.</Text>
        <PrimaryButton label="Back" onPress={() => router.replace('/(tabs)')} />
      </Screen>
    );
  }

  const grant = async (xp: number) => {
    try {
      await addXp(xp);
      await refresh();
    } catch (error) {
      // visible via wallet refresh failure
    }
  };

  return (
    <Screen title="Admin tools" subtitle="Grant training rewards. XP cannot be spent or reduced." backTo="/(tabs)">
      <View style={{ borderRadius: 16, padding: 16, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, gap: 6 }}>
        <Text style={[type.card, { color: theme.text }]}>{user?.email}</Text>
        <Text style={[type.body, { color: theme.textSecondary }]}>Level {level} · {totalPoints} XP · {coins} coins</Text>
      </View>
      <Text style={[type.body, { color: theme.textSecondary }]}>
        Granting XP also adds coins (~40% of XP). Coins buy shop items and ebooks only.
      </Text>
      {[10, 25, 50, 100].map(value => (
        <PrimaryButton key={value} label={`Grant +${value} XP`} onPress={() => { void grant(value); }} />
      ))}
    </Screen>
  );
}
