import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../components/AuthContext';
import { useScreensaver } from '../../components/ScreensaverContext';
import { useTheme } from '../../components/ThemeContext';
import { AppHeader } from '../../components/ui/AppHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { FadeRise } from '../../components/ui/motion';
import { mindTypeLabel } from '../../lib/mindTypes';
import type { LeaderboardUser } from '../../lib/supabase/types';
import { userDataService } from '../../utils/supabase';

type Props = {
  goHome?: () => void;
  goMenu?: () => void;
  goJournal?: () => void;
  openMenu?: () => void;
};

function getBrainBadgeStyle(type: string | null | undefined) {
  if (!type || type === 'balanced') {
    return type === 'balanced'
      ? { label: 'Balanced', color: '#737373', icon: 'ellipse-outline' as const }
      : null;
  }
  const label = mindTypeLabel(type) || type;
  switch (type) {
    case 'Logic Guru':
      return { label, color: '#0aa', icon: 'bulb-outline' as const };
    case 'Memory Master':
      return { label, color: '#efb600', icon: 'layers-outline' as const };
    case 'Focus Champion':
    case 'Focus Titan':
      return { label, color: '#3dbd63', icon: 'flash-outline' as const };
    case 'Strategic Thinker':
      return { label, color: '#4154f1', icon: 'podium-outline' as const };
    case 'Creative Visionary':
      return { label, color: '#e11d48', icon: 'color-palette-outline' as const };
    case 'Quick Reactor':
      return { label, color: '#d97706', icon: 'flash-outline' as const };
    case 'Pattern Pro':
      return { label, color: '#7c3aed', icon: 'aperture-outline' as const };
    case 'Resilient Optimizer':
      return { label, color: '#0891b2', icon: 'reload-outline' as const };
    case 'Social Connector':
      return { label, color: '#10b981', icon: 'people-outline' as const };
    case 'Visualizer':
      return { label, color: '#0f172a', icon: 'image-outline' as const };
    default:
      return { label, color: '#888', icon: 'star-outline' as const };
  }
}

function getBadgeInfo(badgeId: string) {
  if (badgeId.startsWith('lv')) {
    const level = parseInt(badgeId.replace('lv', ''), 10);
    return {
      icon: 'star' as const,
      color:
        level === 1 ? '#4fc3f7' : level === 5 ? '#42e6a4' : level === 10 ? '#ffd700' : level === 15 ? '#d17fff' : '#ff9900',
    };
  }
  if (badgeId.startsWith('streak')) {
    const streak = parseInt(badgeId.replace('streak', ''), 10);
    return {
      icon: 'flame' as const,
      color:
        streak === 3
          ? '#ffb74d'
          : streak === 5
            ? '#ff7e67'
            : streak === 10
              ? '#ff3e3e'
              : streak === 20
                ? '#c43ef6'
                : streak === 50
                  ? '#2ed573'
                  : '#3742fa',
    };
  }
  if (badgeId.includes('badge')) {
    return { icon: 'medal' as const, color: '#8f5fff' };
  }
  return { icon: 'star-outline' as const, color: '#888' };
}

function pointsColor(points: number) {
  if (points >= 20000) return '#8B5CF6';
  if (points >= 10000) return '#F59E0B';
  if (points >= 5000) return '#10B981';
  if (points >= 2000) return '#6366F1';
  return '#6B7280';
}

function planColor(plan: string) {
  if (plan === 'elite') return '#8B5CF6';
  if (plan === 'lite') return '#F59E0B';
  return '#6B7280';
}

function planLabel(plan: string) {
  if (plan === 'elite') return 'ELITE';
  if (plan === 'lite') return 'LITE';
  return 'FREE';
}

export default function LeaderboardScreen(_props: Props) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { resetTimer, setEnabled } = useScreensaver();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const currentUserYRef = useRef<number | null>(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const scrolledOnce = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setEnabled(false);
      resetTimer();
      return () => setEnabled(false);
    }, [resetTimer, setEnabled])
  );

  const loadLeaderboard = useCallback(async () => {
    try {
      setError(null);
      const [{ users, totalCount }, rank] = await Promise.all([
        userDataService.getLeaderboard(50),
        user ? userDataService.getUserRank(user.id) : Promise.resolve(null),
      ]);
      setLeaderboard(users);
      setTotalPlayers(totalCount);
      setUserRank(rank);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load rankings.');
      setLeaderboard([]);
      setTotalPlayers(0);
      setUserRank(null);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    setIsLoading(true);
    void loadLeaderboard();
  }, [loadLeaderboard]);

  useFocusEffect(
    useCallback(() => {
      void loadLeaderboard();
    }, [loadLeaderboard])
  );

  useEffect(() => {
    if (isLoading || scrolledOnce.current || currentUserYRef.current == null || !scrollViewRef.current) return;
    scrolledOnce.current = true;
    const targetY = Math.max(currentUserYRef.current - 160, 0);
    scrollViewRef.current.scrollTo({ y: targetY, animated: true });
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 0, duration: 520, useNativeDriver: true }),
    ]).start();
  }, [isLoading, leaderboard, pulseAnim]);

  const onRefresh = async () => {
    setRefreshing(true);
    scrolledOnce.current = false;
    await loadLeaderboard();
  };

  const currentOnBoard = user ? leaderboard.find((u) => u.id === user.id) : undefined;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <AppHeader title="RANKINGS" showWallet compactWallet />

      <FadeRise>
        <View style={[styles.summary, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.summaryTitle, { color: theme.textSecondary }]}>XP decides. Prove your place.</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border, flex: 1 }]}>
              <Ionicons name="people" size={18} color={theme.primary} />
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {isLoading ? '…' : totalPlayers.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Athletes</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border, flex: 1 }]}>
              <Ionicons name="medal" size={18} color={theme.flame} />
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {isLoading ? '…' : userRank == null ? '—' : `#${userRank}`}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Your rank</Text>
            </View>
          </View>
        </View>
      </FadeRise>

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={resetTimer}
        onTouchStart={resetTimer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { void onRefresh(); }} />}
      >
        {isLoading ? (
          <View style={{ gap: 10, paddingTop: 8 }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Skeleton height={36} width={36} radius={10} />
                <View style={{ flex: 1, gap: 8 }}>
                  <Skeleton height={14} width="55%" />
                  <Skeleton height={10} width="35%" />
                </View>
                <Skeleton height={28} width={56} radius={999} />
              </View>
            ))}
          </View>
        ) : error ? (
          <EmptyState
            icon="cloud-offline-outline"
            title="Rankings unavailable"
            body={error}
          />
        ) : leaderboard.length === 0 ? (
          <EmptyState
            icon="trophy-outline"
            title="No rankings yet"
            body="Train once and your XP will place you on the board."
          />
        ) : (
          <View>
            <View style={styles.sectionHeader}>
              <Ionicons name="trophy" size={18} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Top {Math.min(50, leaderboard.length)}</Text>
              <Text style={[styles.sectionMeta, { color: theme.textSecondary }]}>
                · {totalPlayers.toLocaleString()} athletes
              </Text>
            </View>

            {leaderboard.map((row) => {
              const isYou = row.id === user?.id;
              const brain = getBrainBadgeStyle(row.brain_type);
              const rank = row.rank || 0;
              const isTop3 = rank > 0 && rank <= 3;
              const isTop10 = rank > 3 && rank <= 10;

              return (
                <Animated.View
                  key={row.id}
                  onLayout={(e) => {
                    if (isYou) currentUserYRef.current = e.nativeEvent.layout.y;
                  }}
                  style={[
                    styles.row,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    isTop3 && { borderColor: '#F59E0B' },
                    isTop10 && { borderColor: theme.primary },
                    isYou && {
                      borderColor: theme.primary,
                      backgroundColor: theme.surface,
                      transform: [
                        {
                          scale: pulseAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.015],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {isYou ? <View style={[styles.youAccent, { backgroundColor: theme.primary }]} /> : null}

                  <View
                    style={[
                      styles.rankBadge,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      isTop3 && styles.topThreeBadge,
                    ]}
                  >
                    <Text style={[styles.rankText, { color: theme.text }]}>#{rank}</Text>
                  </View>

                  <View style={styles.mid}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                        {row.username}
                        {isYou ? ' (you)' : ''}
                      </Text>
                      {brain ? (
                        <View
                          style={[
                            styles.chip,
                            { backgroundColor: `${brain.color}15`, borderColor: `${brain.color}40` },
                          ]}
                        >
                          <Ionicons name={brain.icon} size={11} color={brain.color} />
                          <Text style={[styles.chipText, { color: brain.color }]} numberOfLines={1}>
                            {brain.label}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.metaRow}>
                      <View style={[styles.planBadge, { backgroundColor: planColor(row.plan || 'free') }]}>
                        <Text style={styles.planText}>{planLabel(row.plan || 'free')}</Text>
                      </View>
                      <View style={styles.streak}>
                        <Ionicons name="flame" size={13} color="#F59E0B" />
                        <Text style={[styles.streakText, { color: theme.textSecondary }]}>
                          {row.daily_streak_count || row.streak_count || 0}
                        </Text>
                      </View>
                      {row.equipped_badge ? (
                        <View
                          style={[
                            styles.equipped,
                            {
                              backgroundColor: `${getBadgeInfo(row.equipped_badge).color}22`,
                              borderColor: getBadgeInfo(row.equipped_badge).color,
                            },
                          ]}
                        >
                          <Ionicons
                            name={getBadgeInfo(row.equipped_badge).icon}
                            size={14}
                            color={getBadgeInfo(row.equipped_badge).color}
                          />
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.right}>
                    <View style={[styles.pointsBadge, { backgroundColor: pointsColor(row.points) }]}>
                      <Text style={styles.pointsText}>{row.points.toLocaleString()}</Text>
                    </View>
                    <Text style={[styles.levelText, { color: theme.textSecondary }]}>Lv.{row.level}</Text>
                  </View>
                </Animated.View>
              );
            })}

            {user && userRank != null && !currentOnBoard ? (
              <View style={[styles.youOffBoard, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
                <Text style={[styles.youOffTitle, { color: theme.text }]}>Your place</Text>
                <Text style={[styles.youOffBody, { color: theme.textSecondary }]}>
                  Rank #{userRank} · keep training to enter the Top 50
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  summary: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionMeta: {
    fontSize: 13,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 10,
    overflow: 'hidden',
  },
  youAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  rankBadge: {
    minWidth: 40,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  topThreeBadge: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  rankText: {
    fontSize: 13,
    fontWeight: '800',
  },
  mid: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    maxWidth: 110,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  planText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
  },
  equipped: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  pointsBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pointsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  youOffBoard: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  youOffTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  youOffBody: {
    fontSize: 13,
    fontWeight: '500',
  },
});
