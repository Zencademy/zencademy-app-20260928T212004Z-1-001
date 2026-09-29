import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../components/ThemeContext';
import { useXP } from '../../components/XPContext';
import { AppHeader } from '../../components/ui/AppHeader';
import { CountUp, FadeRise, SpinCoin, ThunderBolt } from '../../components/ui/motion';
import { type } from '../../components/ui/type';

const width = Dimensions.get('window').width;

export default function TrainingHub() {
  const router = useRouter();
  const { theme } = useTheme();
  const { totalPoints, coins, level } = useXP();
  const isWide = width > 520;

  const Tile = ({
    title,
    subtitle,
    icon,
    onPress,
    delay = 0,
  }: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    onPress: () => void;
    delay?: number;
  }) => (
    <FadeRise delay={delay} style={{ flex: 1, minWidth: isWide ? undefined : '100%' }}>
      <TouchableOpacity
        style={{
          borderRadius: 18,
          padding: 20,
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
          alignItems: 'center',
          gap: 8,
          minHeight: 168,
        }}
        onPress={onPress}
        activeOpacity={0.88}
      >
        <View
          style={{
            width: 58,
            height: 58,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.primary,
          }}
        >
          {icon}
        </View>
        <Text style={[type.card, { color: theme.text }]}>{title}</Text>
        <Text style={[type.body, { color: theme.textSecondary, textAlign: 'center' }]}>{subtitle}</Text>
      </TouchableOpacity>
    </FadeRise>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <AppHeader onBack={() => router.replace('/')} title="HUB" showWallet={false} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 44, gap: 14 }}>
        <FadeRise>
          <Text style={[type.title, { color: theme.text, textAlign: 'center' }]}>Training Hub</Text>
          <Text style={[type.subtitle, { color: theme.textSecondary, textAlign: 'center' }]}>
            Pick a lane. Execute.
          </Text>
        </FadeRise>

        <FadeRise delay={50}>
          <View
            style={{
              borderRadius: 16,
              padding: 14,
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[type.label, { color: theme.textSecondary }]}>Progress</Text>
              <Text style={[type.label, { color: theme.primary }]}>LVL {level}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1.2, borderRadius: 12, padding: 12, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <ThunderBolt size={13} color={theme.primary} />
                  <Text style={[type.label, { color: theme.textTertiary }]}>XP</Text>
                </View>
                <CountUp value={totalPoints} duration={550} fromZero style={[type.title, { color: theme.text, fontSize: 22 }]} />
              </View>
              <View style={{ flex: 1, borderRadius: 12, padding: 12, backgroundColor: theme.coinSoft, borderWidth: 1, borderColor: theme.coinBorder }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <SpinCoin size={13} color={theme.coin} />
                  <Text style={[type.label, { color: theme.coin }]}>COINS</Text>
                </View>
                <CountUp value={coins} duration={550} fromZero style={[type.title, { color: theme.text, fontSize: 22 }]} />
              </View>
            </View>
          </View>
        </FadeRise>

        <View style={{ flexDirection: isWide ? 'row' : 'column', flexWrap: 'wrap', gap: 12 }}>
          <Tile
            title="Mental"
            subtitle="Logic, memory, focus."
            delay={90}
            onPress={() => router.push('/MentalTrainingScreen')}
            icon={<MaterialCommunityIcons name="brain" size={30} color={theme.primary} />}
          />
          <Tile
            title="Physical"
            subtitle="Move, stretch, breathe."
            delay={130}
            onPress={() => router.push('/PhysicalTrainingScreen')}
            icon={<Feather name="activity" size={28} color={theme.primary} />}
          />
          <Tile
            title="Ebooks"
            subtitle="Library access & titles."
            delay={170}
            onPress={() => router.push('/EbookScreen')}
            icon={<Ionicons name="library-outline" size={28} color={theme.primary} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
