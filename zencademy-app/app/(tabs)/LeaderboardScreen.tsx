import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert, Animated,
    ScrollView, StyleSheet,
    Text,
    View,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../components/AuthContext";
import { useScreensaver } from "../../components/ScreensaverContext";
import { useTheme } from "../../components/ThemeContext";
import { useXP } from "../../components/XPContext";
import { AppHeader } from "../../components/ui/AppHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { Breath, CountUp, FadeRise } from "../../components/ui/motion";
import useResponsive from '../../hooks/useResponsive';
import { userDataService } from "../../utils/supabase";
import { deriveLevelAndLevelXP } from "../../utils/levels";
import { mindTypeLabel } from "../../lib/mindTypes";

// Helper function to get brain type style
function getBrainBadgeStyle(type: string | null | undefined) {
  if (!type) return null;
  const label = mindTypeLabel(type);
  switch (type) {
    case "Logic Guru": return { label, color: "#0aa", icon: "bulb-outline" as const };
    case "Memory Master": return { label, color: "#efb600", icon: "layers-outline" as const };
    case "Focus Champion":
    case "Focus Titan": return { label, color: "#3dbd63", icon: "flash-outline" as const };
    case "Strategic Thinker": return { label, color: "#4154f1", icon: "podium-outline" as const };
    case "Creative Visionary": return { label, color: "#e11d48", icon: "color-palette-outline" as const };
    case "Quick Reactor": return { label, color: "#d97706", icon: "flash-outline" as const };
    case "Pattern Pro": return { label, color: "#7c3aed", icon: "aperture-outline" as const };
    case "Resilient Optimizer": return { label, color: "#0891b2", icon: "reload-outline" as const };
    case "Social Connector": return { label, color: "#10b981", icon: "people-outline" as const };
    case "Visualizer": return { label, color: "#0f172a", icon: "image-outline" as const };
    default: return { label: label || type, color: "#888", icon: "star-outline" as const };
  }
}

// Helper function to get badge info (memoized to prevent excessive calls)
const badgeInfoCache = new Map<string, { icon: string; color: string }>();

function getBadgeInfo(badgeId: string) {
  // Check cache first
  if (badgeInfoCache.has(badgeId)) {
    return badgeInfoCache.get(badgeId)!;
  }
  
  let result: { icon: string; color: string };
  
  // Level badges
  if (badgeId.startsWith('lv')) {
    const level = parseInt(badgeId.replace('lv', ''));
    result = {
      icon: "star" as const,
      color: level === 1 ? "#4fc3f7" : level === 5 ? "#42e6a4" : level === 10 ? "#ffd700" : level === 15 ? "#d17fff" : "#ff9900",
    };
  }
  // Streak badges
  else if (badgeId.startsWith('streak')) {
    const streak = parseInt(badgeId.replace('streak', ''));
    result = {
      icon: "flame" as const,
      color: streak === 3 ? "#ffb74d" : streak === 5 ? "#ff7e67" : streak === 10 ? "#ff3e3e" : streak === 20 ? "#c43ef6" : streak === 50 ? "#2ed573" : "#3742fa",
    };
  }
  // Premium/Shop badges - check multiple variations
  else if (badgeId === "badge-premium" || badgeId === "badge-legend" || badgeId === "badge-focus" || badgeId === "badge-mind" || badgeId === "badge-power" || badgeId === "badge-streak" || badgeId === "badge-zen") {
    result = {
      icon: "medal" as const,
      color: "#9747ff",
    };
  }
  // Shop badges from ShopScreen (any badge-* pattern)
  else if (badgeId.includes("badge-")) {
    result = {
      icon: "medal" as const,
      color: "#8f5fff", // Premium purple
    };
  }
  // Default
  else {
    result = {
      icon: "star-outline" as const,
      color: "#888",
    };
  }
  
  // Cache the result
  badgeInfoCache.set(badgeId, result);
  return result;
}

interface LeaderboardUser {
  id: string;
  username: string;
  // Total points
  points: number;
  // Optional per-level points
  level_points?: number;
  level: number;
  streak_count: number;
  daily_streak_count: number;
  plan?: string;
  brain_type?: string | null;
  badges?: string[];
  equipped_badge?: string | null;
  rank?: number;
  created_at?: string;
}

type Props = {
  goHome?: () => void;
  goMenu?: () => void;
  goJournal?: () => void;
  openMenu?: () => void;
};

export default function LeaderboardScreen({ goHome, goMenu, goJournal, openMenu }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { level, xp, streak, brainType } = useXP();
  const { insets } = (useResponsive as any)();
  const { active: screensaverActive } = useScreensaver();
  const { theme } = useTheme();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const currentUserYRef = useRef<number | null>(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Screensaver global - premium sync
  const { resetTimer } = useScreensaver();
  useFocusEffect(
    useCallback(() => {
      resetTimer();
      return () => {};
    }, [resetTimer])
  );

  useEffect(() => {
    loadLeaderboard();
  }, []);

  // Refresh leaderboard when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadLeaderboard();
      // Small delayed refresh to catch very recent writes (e.g., after game complete)
      const t = setTimeout(() => {
        loadLeaderboard().catch(() => {});
      }, 500);
      return () => clearTimeout(t);
    }, [])
  );

  const getLevelFromTotalPoints = (totalPoints: number) => deriveLevelAndLevelXP(totalPoints).level;

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      
      // Get leaderboard data from Supabase (top 50 + total count)
      const { users, totalCount } = await userDataService.getLeaderboard(50);
      
      console.log('Leaderboard loaded:', { usersCount: users.length, totalCount });
      
      // Add rank numbers and ensure required fields
      const rankedUsers: LeaderboardUser[] = users.map((user, index) => {
        const mappedUser = {
          id: user.id,
          username: user.username || 'Anonymous',
          points: (user as any).points || 0,
          level_points: (user as any).level_points || 0,
          level: getLevelFromTotalPoints(((user as any).points || 0)),
          streak_count: user.streak_count || 0,
          daily_streak_count: user.daily_streak_count || 0,
          plan: user.plan || 'free',
          brain_type: (user as any).brain_type || null,
          badges: (user as any).badges || [],
          equipped_badge: (user as any).equipped_badge || null,
          rank: index + 1,
          created_at: user.created_at
        };
        // Log users with equipped badges for debugging
        if (mappedUser.equipped_badge) {
          console.log(`User ${mappedUser.username} has equipped badge:`, mappedUser.equipped_badge);
        }
        if (index === 0) {
          console.log('First user data:', {
            username: mappedUser.username,
            brain_type: mappedUser.brain_type,
            equipped_badge: mappedUser.equipped_badge,
            badges: mappedUser.badges,
            rawUserData: user
          });
        }
        return mappedUser;
      });

      setLeaderboard(rankedUsers);
      setTotalPlayers(totalCount);

      // Get current user's rank
      if (user) {
        const currentUserRank = await userDataService.getUserRank(user.id);
        setUserRank(currentUserRank);
      }

    } catch (error) {
      console.error('Leaderboard load error:', error);
      Alert.alert('Error', `Failed to load leaderboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to the current user's position and animate highlight once data is loaded
  useEffect(() => {
    if (!isLoading && currentUserYRef.current != null && scrollViewRef.current) {
      const targetY = Math.max((currentUserYRef.current as number) - 180, 0);
      scrollViewRef.current.scrollTo({ y: targetY, animated: true });

      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 600, useNativeDriver: true })
      ]).start();
    }
  }, [isLoading]);


  const getPointsColor = (totalPoints: number) => {
    if (totalPoints >= 20000) return '#8B5CF6'; // Purple
    if (totalPoints >= 10000) return '#F59E0B'; // Amber
    if (totalPoints >= 5000) return '#10B981'; // Emerald
    if (totalPoints >= 2000) return '#6366F1'; // Indigo
    return '#6B7280'; // Gray
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'elite': return '#8B5CF6'; // Purple
      case 'lite': return '#F59E0B'; // Amber
      default: return '#6B7280'; // Gray for free
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'elite': return 'ELITE';
      case 'lite': return 'LITE';
      default: return 'FREE';
    }
  };


  return (
    <Animated.View style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
            <AppHeader title="RANKINGS" showWallet compactWallet />
            <FadeRise>
              <View style={[styles.header, { backgroundColor: theme.card, marginTop: 0 }]}>
                <View style={styles.headerBackground}>
                  <View style={styles.titleContainer}>
                    <View style={styles.titleRow}>
                      <Ionicons name="trophy" size={28} color={theme.primary} />
                      <Text style={[styles.title, { color: theme.text }]}>RANKINGS</Text>
                    </View>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>XP decides. Prove your place.</Text>
                  </View>

                  <View style={styles.statsGrid}>
                    <Breath amount={1.02} style={{ flex: 1 }}>
                      <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Ionicons name="people" size={20} color={theme.primary} />
                        <CountUp value={totalPlayers} style={[styles.statNumber, { color: theme.text }]} />
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Athletes</Text>
                      </View>
                    </Breath>
                    <Breath amount={1.02} style={{ flex: 1 }}>
                      <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Ionicons name="medal" size={20} color={theme.flame} />
                        {userRank == null ? (
                          <Text style={[styles.statNumber, { color: theme.text }]}>—</Text>
                        ) : (
                          <Text style={[styles.statNumber, { color: theme.text }]}>
                            #<CountUp value={userRank} style={[styles.statNumber, { color: theme.text }]} />
                          </Text>
                        )}
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Your Rank</Text>
                      </View>
                    </Breath>
                  </View>
                </View>
              </View>
            </FadeRise>

            {/* Current User Stats removed for compact view */}

            <ScrollView
              ref={scrollViewRef}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16, paddingBottom: 24 }}
              showsVerticalScrollIndicator={true}
              scrollIndicatorInsets={{ right: 5 }}
              indicatorStyle="black"
              bounces={true}
              scrollEventThrottle={16}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              directionalLockEnabled
              onScrollBeginDrag={resetTimer}
              onTouchStart={resetTimer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={async () => {
                    setRefreshing(true);
                    try { await loadLeaderboard(); } finally { setRefreshing(false); }
                  }}
                />
              }
            >
              {isLoading ? (
                <View style={{ gap: 12, paddingHorizontal: 4, paddingTop: 8 }}>
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
              ) : leaderboard.length === 0 ? (
                <EmptyState
                  icon="trophy-outline"
                  title="No rankings yet"
                  body="Train once and your XP will place you on the board. Be the first name on the list."
                />
              ) : (
                <View style={styles.leaderboardContainer}>
                  {/* Top 50 Leaderboard */}
                  <View style={styles.fullLeaderboard}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionTitleRow}>
                        <Ionicons name="star" size={20} color={theme.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Top 50</Text>
                      </View>
                      <View style={styles.sectionSubtitle}>
                        <Text style={[styles.sectionSubtitleText, { color: theme.textSecondary }]}>Ranked by XP Â· {totalPlayers.toLocaleString()} athletes</Text>
                      </View>
                    </View>
                    
                    {leaderboard.map((leaderboardUser, index) => (
                      <Animated.View
                        key={leaderboardUser.id}
                        onLayout={(e) => {
                          if (leaderboardUser.id === user?.id) {
                            currentUserYRef.current = e.nativeEvent.layout.y;
                          }
                        }}
                        style={[
                          styles.leaderboardItem,
                          { backgroundColor: theme.card, borderColor: theme.border },
                          leaderboardUser.id === user?.id && [styles.currentUserItem, { borderColor: theme.primary, backgroundColor: theme.surface }],
                          index < 3 && [styles.topThreeItem, { borderColor: '#F59E0B', backgroundColor: theme.surface }],
                          index < 10 && [styles.topTenItem, { borderColor: theme.primary, backgroundColor: theme.surface }],
                          (leaderboardUser.plan === 'lite' || leaderboardUser.plan === 'elite') && [styles.premiumItem, { borderColor: '#10B981', backgroundColor: theme.surface }],
                          leaderboardUser.id === user?.id && { transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] }) }] }
                        ]}
                      >
                        {leaderboardUser.id === user?.id && <View style={[styles.currentUserAccent, { backgroundColor: theme.primary }]} />}
                        
                        {/* Rank Section */}
                        <View style={styles.rankSection}>
                          <View style={[
                            styles.rankBadge,
                            { backgroundColor: theme.surface, borderColor: theme.border },
                            leaderboardUser.rank! <= 3 && styles.topThreeBadge,
                            leaderboardUser.rank! <= 10 && styles.topTenBadge
                          ]}>
                            <Text style={[styles.rankNumber, { color: theme.text }]}>#{leaderboardUser.rank}</Text>
                          </View>
                          {leaderboardUser.rank! <= 3 && (
                            <Ionicons name="trophy" size={14} color="#F59E0B" style={{ marginTop: 2 }} />
                          )}
                        </View>
                        
                        {/* User Info Section */}
                        <View style={styles.userInfoSection}>
                          {/* First Row: Name, Brain Type */}
                          <View style={styles.userNameRow}>
                            <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
                              {leaderboardUser.username}
                            </Text>
                            {/* Brain Type Badge */}
                            {leaderboardUser.brain_type && (() => {
                              const brainStyle = getBrainBadgeStyle(leaderboardUser.brain_type);
                              if (!brainStyle) return null;
                              return (
                                <View style={[styles.brainTypeBadge, { backgroundColor: `${brainStyle.color}15`, borderColor: `${brainStyle.color}40` }]}>
                                  <Ionicons name={brainStyle.icon} size={11} color={brainStyle.color} />
                                  <Text style={[styles.brainTypeText, { color: brainStyle.color }]} numberOfLines={1}>
                                    {brainStyle.label}
                                  </Text>
                                </View>
                              );
                            })()}
                          </View>
                          
                          {/* Second Row: Plan, Streak, Equipped Badge */}
                          <View style={styles.userDetailsRow}>
                            <View style={[styles.planBadge, { backgroundColor: getPlanColor(leaderboardUser.plan || 'free') }]}>
                              <Text style={styles.planBadgeText}>{getPlanLabel(leaderboardUser.plan || 'free')}</Text>
                            </View>
                            <View style={styles.streakContainer}>
                              <Ionicons name="flame" size={13} color="#F59E0B" />
                              <Text style={[styles.streakText, { color: theme.textSecondary }]}>{leaderboardUser.streak_count || leaderboardUser.daily_streak_count || 0}</Text>
                            </View>
                            {/* Equipped Badge - Next to daily streak */}
                            {leaderboardUser.equipped_badge && (() => {
                              const badgeInfo = getBadgeInfo(leaderboardUser.equipped_badge);
                              return (
                                <View style={[styles.equippedBadgeIcon, { 
                                  backgroundColor: `${badgeInfo.color}30`, 
                                  borderColor: `${badgeInfo.color}`, 
                                  borderWidth: 2,
                                }]}>
                                  <Ionicons name={badgeInfo.icon} size={16} color={badgeInfo.color} />
                                </View>
                              );
                            })()}
                          </View>
                        </View>
                        
                        {/* Stats Section */}
                        <View style={styles.statsSection}>
                          <View style={[styles.pointsBadge, { backgroundColor: getPointsColor(leaderboardUser.points) }]}>
                            <Text style={styles.pointsText}>{leaderboardUser.points.toLocaleString()}</Text>
                            <Text style={styles.pointsLabel}>pts</Text>
                          </View>
                          <Text style={[styles.levelText, { color: theme.textSecondary }]}>Lv.{leaderboardUser.level}</Text>
                        </View>
                      </Animated.View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  headerBackground: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: 'center',
  },
  currentUserCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  currentUserHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  currentUserTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  currentUserRank: {
    backgroundColor: '#FFD700',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  currentUserRankText: {
    fontSize: 16,
    fontWeight: "900",
    color: '#000',
  },
  currentUserStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statIconText: {
    fontSize: 18,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700',
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loadingSpinnerText: {
    fontSize: 24,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
  },
  leaderboardContainer: {
    flex: 1,
  },
  podiumContainer: {
    marginBottom: 30,
  },
  podiumTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
    letterSpacing: 1,
  },
  podium: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 140,
  },
  podiumItem: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    padding: 15,
    minWidth: 90,
    borderWidth: 2,
    borderColor: '#333',
  },
  firstPlace: {
    backgroundColor: "#FFD700",
    height: 140,
    borderColor: '#FFA500',
  },
  secondPlace: {
    backgroundColor: "#C0C0C0",
    height: 120,
    borderColor: '#999',
  },
  thirdPlace: {
    backgroundColor: "#CD7F32",
    height: 100,
    borderColor: '#A0522D',
  },
  podiumCrown: {
    marginBottom: 8,
  },
  podiumCrownText: {
    fontSize: 24,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 5,
  },
  podiumStats: {
    alignItems: "center",
  },
  podiumLevel: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
    marginBottom: 2,
  },
  podiumXP: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  fullLeaderboard: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    marginBottom: 4,
  },
  sectionSubtitleText: {
    fontSize: 14,
    fontWeight: "500",
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
    minHeight: 70,
  },
  currentUserItem: {
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  currentUserAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  topThreeItem: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topTenItem: {
    // Colors will be set dynamically
  },
  premiumItem: {
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankSection: {
    alignItems: "center",
    marginRight: 14,
    minWidth: 50,
  },
  rankBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    minWidth: 36,
    alignItems: 'center',
  },
  topThreeBadge: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  topTenBadge: {
    backgroundColor: '#8B5CF6',
    borderColor: '#7C3AED',
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: "800",
  },
  userInfoSection: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  userName: {
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 1,
    letterSpacing: 0.2,
  },
  equippedBadgeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    marginLeft: 4,
  },
  brainTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  brainTypeText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  userDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  badgesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCountText: {
    fontSize: 10,
    fontWeight: "700",
  },
  planBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statsSection: {
    alignItems: "flex-end",
    minWidth: 80,
  },
  pointsBadge: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 4,
    alignItems: 'center',
    minWidth: 60,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 16,
  },
  pointsLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ffffff",
    opacity: 0.9,
  },
  levelText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
