import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { useAuth } from "../../components/AuthContext";
import { useTheme } from "../../components/ThemeContext";
import { useXP } from "../../components/XPContext";
import { SHOP_BADGES } from "../../constants/shop";
import { avatarGlyph, avatarTone, getEquippedAvatar } from "../../lib/inventory";
import { mindTypeTitle } from "../../lib/mindTypes";
import { getXpForLevel } from "../../utils/levels";

const { width: screenWidth } = Dimensions.get('window');

const levelMilestones = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100];
const streakMilestones = [3, 5, 10, 20, 50, 100];

interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  unlocked: boolean;
  isShopBadge?: boolean;
}

function getNewBadges(unlockedBadges: string[], prevBadges: string[]): string[] {
  return unlockedBadges.filter((b: string) => !prevBadges.includes(b));
}

function getBrainBadgeStyle(type: string) {
  const label = mindTypeTitle(type) || type;
  switch (type) {
    case "Logic Guru": return { label, bg: "#e0f7fa", color: "#0aa", icon: "bulb-outline" as const, shadow: "#0aa" };
    case "Memory Master": return { label, bg: "#fff9e6", color: "#efb600", icon: "layers-outline" as const, shadow: "#efb600" };
    case "Focus Champion":
    case "Focus Titan": return { label, bg: "#eaf8e8", color: "#3dbd63", icon: "flash-outline" as const, shadow: "#3dbd63" };
    case "Strategic Thinker": return { label, bg: "#eef2ff", color: "#4154f1", icon: "podium-outline" as const, shadow: "#4154f1" };
    case "Creative Visionary": return { label, bg: "#fff1f2", color: "#e11d48", icon: "color-palette-outline" as const, shadow: "#e11d48" };
    case "Quick Reactor": return { label, bg: "#fef3c7", color: "#d97706", icon: "flash-outline" as const, shadow: "#d97706" };
    case "Pattern Pro": return { label, bg: "#f3e8ff", color: "#7c3aed", icon: "aperture-outline" as const, shadow: "#7c3aed" };
    case "Resilient Optimizer": return { label, bg: "#e6fffb", color: "#0891b2", icon: "reload-outline" as const, shadow: "#0891b2" };
    case "Social Connector": return { label, bg: "#ecfdf5", color: "#10b981", icon: "people-outline" as const, shadow: "#10b981" };
    case "Visualizer": return { label, bg: "#f1f5f9", color: "#0f172a", icon: "image-outline" as const, shadow: "#0f172a" };
    default: return { label, bg: "#eee", color: "#888", icon: "star-outline" as const, shadow: "#888" };
  }
}

const brainBadgeStyles = StyleSheet.create({
  badgeWrap: {
    alignSelf: "center",
    marginTop: 9,
    marginBottom: 3,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  badgeContent: {
    flexDirection: "row", 
    alignItems: "center"
  },
  badgeText: {
    fontWeight: "800", 
    fontSize: 16, 
    letterSpacing: 0.4, 
    marginRight: 5
  },
  refreshBtn: {
    padding: 4, 
    marginLeft: 4, 
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)"
  }
});

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, themeMode } = useTheme();
  const {
    xp, level, streak, addXp,
    name, setName,
    brainType,
    completed, achievements,
    unlockedBadges = [],
    equippedBadge,
    setEquippedBadge
  } = useXP();

  const [prevBadges, setPrevBadges] = useState<string[]>(unlockedBadges);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    void getEquippedAvatar().then(setAvatarId);
  }, [unlockedBadges]);

  useEffect(() => {
    const newOnes = getNewBadges(unlockedBadges, prevBadges);
    if (newOnes.length > 0) {
      setNewlyUnlocked(newOnes);
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start(() => setNewlyUnlocked([]));
    }
    setPrevBadges(unlockedBadges);
  }, [unlockedBadges]);

  const currentBrainType = brainType;

  let unlockedLevels = levelMilestones.filter(lv => level >= lv);
  let nextLevelBadge = levelMilestones.find(lv => !unlockedLevels.includes(lv));
  let showLevelBadges = [...unlockedLevels];
  if (nextLevelBadge) showLevelBadges.push(nextLevelBadge);

  let unlockedStreaks = streakMilestones.filter(s => streak >= s);
  let nextStreakBadge = streakMilestones.find(s => !unlockedStreaks.includes(s));
  let showStreakBadges = [...unlockedStreaks];
  if (nextStreakBadge) showStreakBadges.push(nextStreakBadge);

  const premiumBadge: Badge = {
    id: "badge-premium",
    name: "Zencademy Legend",
    icon: "medal-outline",
    color: "#9747ff",
    description: unlockedBadges?.includes("badge-premium")
      ? "Legendary badge: Awarded to the most dedicated members."
      : "Buy from the Shop to become a Legend!",
    unlocked: unlockedBadges?.includes("badge-premium") || false,
    isShopBadge: true,
  };

  // Build the list of shop badges that are unlocked
  const unlockedShopBadges = SHOP_BADGES.filter(b => unlockedBadges.includes(b.id)).map(b => ({
    id: b.id,
    name: b.title,
    icon: b.icon,
    color: '#8f5fff', // premium purple gradient base
    description: b.desc,
    unlocked: true,
    isShopBadge: true,
  }));

  const badges: Badge[] = [
    ...showLevelBadges.map(lv => ({
      id: `lv${lv}`,
      name: `Level ${lv} Achieved`,
      icon: "star-outline",
      color: lv === 1 ? "#4fc3f7" : lv === 5 ? "#42e6a4" : lv === 10 ? "#ffd700" : lv === 15 ? "#d17fff" : "#ff9900",
      description: `Reach Level ${lv}`,
      unlocked: level >= lv,
    })),
    ...showStreakBadges.map(s => ({
      id: `streak${s}`,
      name: `${s}-Day Streak`,
      icon: "flame",
      color: s === 3 ? "#ffb74d" : s === 5 ? "#ff7e67" : s === 10 ? "#ff3e3e" : s === 20 ? "#c43ef6" : s === 50 ? "#2ed573" : "#3742fa",
      description: `Maintain a streak of ${s} days`,
      unlocked: streak >= s,
    })),
    {
      id: "lv10-streak10",
      name: "Disciplined Warrior",
      icon: "shield-checkmark-outline",
      color: "#00d7a7",
      description: "Reach Level 10 & 10-Day Streak",
      unlocked: level >= 10 && streak >= 10,
    },
    ...unlockedShopBadges,
    premiumBadge
  ];

  // equippedBadge is now managed by Firebase through useXP

  const handleEquipBadge = async (badge: Badge) => {
    if (!badge.unlocked) {
      console.log('Badge not unlocked:', badge.id);
      return;
    }
    console.log('Equipping badge:', badge.id);
    await setEquippedBadge(badge.id);
    console.log('Badge equipped:', badge.id);
    
    // Premium animation feedback
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const [editVisible, setEditVisible] = useState(false);
  const [nameInput, setNameInput] = useState(name);

  useEffect(() => {
    setNameInput(name);
  }, [name]);

  const saveName = () => {
    if (nameInput.trim().length > 0) setName(nameInput.trim());
    setEditVisible(false);
  };

  const MAX_LEVEL = 100;
  const xpToLevel = getXpForLevel(level);

  const goRetakeBrainTest = () => {
    router.push({ pathname: "/OnboardingQuizScreen", params: { retake: "1" } });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Premium Background Gradient */}
      <View style={[styles.backgroundGradient, { backgroundColor: theme.background }]}>
        {themeMode === 'dark' && (
          <View style={[styles.gradientOverlay, { backgroundColor: theme.overlay }]} />
        )}
      </View>
      
      <View style={[styles.topBar, { backgroundColor: theme.background, borderBottomColor: theme.borderLight }]}>
        <Pressable 
          style={[styles.exitBtn, { backgroundColor: theme.surface }]} 
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 44 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          {/* Premium Avatar with Gradient Border */}
          <View style={styles.avatarContainer}>
            {(() => {
              const tone = avatarTone(avatarId);
              return (
                <View style={[styles.avatarGradientBorder, {
                  backgroundColor: tone?.tone || (themeMode === 'light' ? theme.primary : 'transparent'),
                  shadowColor: tone?.tone || (themeMode === 'light' ? theme.primary : theme.warning),
                }]}>
                  <View style={[styles.avatarCircle, {
                    backgroundColor: tone?.tone || theme.primary,
                    borderColor: theme.border,
                  }]}>
                    <Text style={[styles.avatarLetter, {
                      color: tone?.ink || theme.buttonText,
                      fontSize: avatarId ? 30 : 36,
                    }]}>
                      {avatarGlyph(avatarId, name && name.length > 0 ? name.charAt(0).toUpperCase() : "?")}
                    </Text>
                  </View>
                </View>
              );
            })()}
          </View>
          
          <View style={styles.nameContainer}>
            <Text style={[styles.username, { color: theme.text }]}>{name}</Text>
            
            {/* Current Plan Badge */}
            <Pressable 
              style={[styles.planBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => router.push('/PlansScreen')}
            >
              <Ionicons 
                name="star" 
                size={16} 
                color={theme.textSecondary} 
              />
              <Text style={[styles.planBadgeText, { color: theme.textSecondary }]}>
                LITE
              </Text>
            </Pressable>
            
            {equippedBadge && (() => {
              const badge = badges.find(b => b.id === equippedBadge);
              if (!badge) return null;
              const isLegend = badge.id === "badge-premium";
              return (
                <View style={[
                  styles.equippedBadgeContainer,
                  isLegend && {
                    backgroundColor: themeMode === 'light' ? "rgba(139, 92, 246, 0.08)" : "rgba(139, 92, 246, 0.2)",
                    borderColor: theme.secondary,
                  },
                  { backgroundColor: theme.surface, borderColor: theme.border }
                ]}>
                  {isLegend && (
                    <View style={[styles.legendGlow, { 
                      backgroundColor: themeMode === 'light' ? "rgba(139, 92, 246, 0.15)" : "rgba(139, 92, 246, 0.3)",
                      shadowColor: theme.secondary,
                    }]} />
                  )}
                  <Ionicons
                    name={badge.icon as any}
                    size={24}
                    color={isLegend ? theme.secondary : badge.color}
                    style={{ zIndex: 1 }}
                  />
                </View>
              );
            })()}
          </View>

          {currentBrainType && (
            <Animated.View style={[
              brainBadgeStyles.badgeWrap,
              { 
                backgroundColor: getBrainBadgeStyle(currentBrainType).bg, 
                shadowColor: getBrainBadgeStyle(currentBrainType).shadow,
                transform: [{ scale: scaleAnim }]
              }
            ]}>
              <View style={brainBadgeStyles.badgeContent}>
                <Ionicons
                  name={getBrainBadgeStyle(currentBrainType).icon}
                  size={28}
                  color={getBrainBadgeStyle(currentBrainType).color}
                  style={{ marginRight: 12 }}
                />
                <Text style={[brainBadgeStyles.badgeText, { color: getBrainBadgeStyle(currentBrainType).color }]}>
                  {getBrainBadgeStyle(currentBrainType).label}
                </Text>
                <Pressable
                  onPress={goRetakeBrainTest}
                  style={({ pressed }) => [
                    brainBadgeStyles.refreshBtn,
                    { opacity: pressed ? 0.7 : 1 }
                  ]}
                  hitSlop={15}
                >
                  <Ionicons name="refresh-circle" size={24} color={getBrainBadgeStyle(currentBrainType).color} />
                </Pressable>
              </View>
            </Animated.View>
          )}

          <Pressable 
            style={[styles.editBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} 
            onPress={() => {
              setNameInput(name);
              setEditVisible(true);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="create-outline" size={18} color={theme.textSecondary} />
            <Text style={[styles.editLabel, { color: theme.textSecondary }]}>Edit Name</Text>
          </Pressable>
          
          <View style={styles.levelContainer}>
            <Text style={[styles.level, { color: theme.text }]}>
              Level {level}
            </Text>
            <View style={styles.streakContainer}>
              <Ionicons name="flame" size={20} color={theme.error} />
              <Text style={[styles.streakText, { color: theme.textSecondary }]}>{streak} days</Text>
            </View>
          </View>
          
          <View style={styles.xpContainer}>
            <View style={[styles.xpBarBackground, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.xpBarFill, { width: `${(xp / xpToLevel) * 100}%`, backgroundColor: theme.primary }]} />
              <View style={[styles.xpBarGlow, { backgroundColor: themeMode === 'light' ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.3)" }]} />
            </View>
            <Text style={[styles.xpLabel, { color: theme.textSecondary }]}>{xp} / {xpToLevel} Points</Text>
          </View>
        </View>

        {newlyUnlocked.length > 0 && (
          <Animated.View style={[styles.newBadgeBanner, { 
            opacity: fadeAnim, 
            backgroundColor: theme.card, 
            borderColor: theme.border,
            shadowColor: themeMode === 'light' ? theme.warning : theme.shadow,
          }]}>
            <View style={styles.sparkleContainer}>
              <Ionicons name="sparkles" size={22} color={theme.warning} />
            </View>
            <Text style={[styles.newBadgeBannerText, { color: theme.text }]}>
              New badge unlocked: {badges.find(b => b.id === newlyUnlocked[0])?.name || "Badge"}!
            </Text>
          </Animated.View>
        )}

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.statIconContainer, { backgroundColor: theme.surface }]}>
              <Ionicons name="star" size={24} color={theme.warning} />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>{(() => {
              let total = xp;
              for (let l = 1; l < level; l++) {
                total += getXpForLevel(l);
              }
              return total.toLocaleString();
            })()}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Points</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.statIconContainer, { backgroundColor: theme.surface }]}>
              <Ionicons name="flame" size={24} color={theme.error} />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Streak</Text>
          </View>
        </View>

        <View style={styles.badgesSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Badges <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>(tap to equip)</Text>
          </Text>
          <View style={styles.badgesWrap}>
            {badges.map((b, i) => {
              const isEquipped = equippedBadge === b.id;
              const isLegend = b.id === "badge-premium";
              const isUnlocked = b.unlocked || unlockedBadges.includes(b.id);
              const isNew = newlyUnlocked.includes(b.id);

              return (
                <Pressable
                  key={b.id}
                  onPress={() => handleEquipBadge({ ...b, unlocked: isUnlocked })}
                  disabled={!isUnlocked}
                  style={[
                    styles.badgeItem,
                    isLegend && isUnlocked && [styles.legendBadgeItem, {
                      borderColor: theme.secondary,
                      backgroundColor: themeMode === 'light' ? "rgba(139, 92, 246, 0.05)" : "rgba(151, 71, 255, 0.05)",
                      shadowColor: theme.secondary,
                    }],
                    b.isShopBadge && isUnlocked && {
                      borderWidth: 2.5,
                      borderColor: theme.secondary,
                      shadowColor: theme.secondary,
                      shadowOpacity: 0.5,
                      shadowRadius: 16,
                      elevation: 12,
                      backgroundColor: themeMode === 'light' ? "rgba(139, 92, 246, 0.08)" : "rgba(143,95,255,0.08)",
                    },
                    {
                      borderColor: isEquipped
                        ? (isLegend ? theme.secondary : theme.warning)
                        : (isUnlocked ? b.color : (themeMode === 'light' ? theme.border : theme.textTertiary)),
                      opacity: isUnlocked ? 1 : 0.5,
                      backgroundColor: isEquipped
                        ? (isLegend ? (themeMode === 'light' ? "rgba(139, 92, 246, 0.08)" : "rgba(139, 92, 246, 0.15)") : (themeMode === 'light' ? "rgba(245, 158, 11, 0.08)" : "rgba(245, 158, 11, 0.15)"))
                        : (isUnlocked ? (themeMode === 'light' ? theme.surface : "rgba(255, 255, 255, 0.05)") : (themeMode === 'light' ? theme.surface : "rgba(255, 255, 255, 0.02)")),
                      transform: [{ scale: isEquipped ? 1.04 : 1 }],
                    }
                  ]}
                >
                  <View style={[
                    styles.badgeIconCircle,
                    isLegend && isUnlocked && [styles.legendIconCircle, {
                      backgroundColor: themeMode === 'light' ? "rgba(139, 92, 246, 0.12)" : "rgba(151, 71, 255, 0.2)",
                      borderColor: theme.secondary,
                    }],
                    b.isShopBadge && isUnlocked && {
                      backgroundColor: themeMode === 'light' ? "rgba(139, 92, 246, 0.12)" : "rgba(139, 92, 246, 0.2)",
                      borderColor: theme.secondary,
                      shadowColor: theme.secondary,
                      shadowOpacity: 0.5,
                      shadowRadius: 16,
                      elevation: 12,
                    },
                    {
                      backgroundColor: isEquipped
                        ? (isLegend ? (themeMode === 'light' ? "rgba(139, 92, 246, 0.12)" : "rgba(139, 92, 246, 0.25)") : (themeMode === 'light' ? b.color + "15" : b.color + "30"))
                        : (isUnlocked ? (isLegend ? (themeMode === 'light' ? "rgba(139, 92, 246, 0.08)" : "rgba(139, 92, 246, 0.15)") : (themeMode === 'light' ? b.color + "10" : b.color + "20")) : (themeMode === 'light' ? theme.surface : "rgba(255, 255, 255, 0.1)")),
                    }
                  ]}>
                    <Ionicons
                      name={b.icon as any}
                      size={36}
                      color={isUnlocked ? (isLegend ? theme.secondary : b.color) : theme.textTertiary}
                      style={b.isShopBadge && isUnlocked ? { textShadowColor: theme.secondary, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 } : {}}
                    />
                    {isEquipped && (
                      <View style={[styles.equippedIndicator, { backgroundColor: themeMode === 'light' ? theme.background : "rgba(0,0,0,0.8)" }]}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={isLegend ? theme.secondary : theme.warning}
                        />
                      </View>
                    )}
                    {isNew && (
                      <View style={[styles.newIndicator, { 
                        backgroundColor: themeMode === 'light' ? "rgba(245, 158, 11, 0.15)" : "rgba(255, 215, 0, 0.2)",
                        shadowColor: theme.warning
                      }]}>
                        <Ionicons
                          name="sparkles"
                          size={18}
                          color={theme.warning}
                        />
                      </View>
                    )}
                  </View>
                  <View style={styles.badgeContent}>
                    <Text style={[
                      styles.badgeName,
                      isLegend && isUnlocked && [styles.legendBadgeName, { color: theme.secondary }],
                      { color: isEquipped ? (isLegend ? theme.secondary : theme.warning) : (isUnlocked ? theme.text : theme.textTertiary) }
                    ]}>
                      {b.name} {!isUnlocked && "(Locked)"}
                    </Text>
                    <Text style={[
                      styles.badgeDesc,
                      isLegend && isUnlocked && { color: theme.secondary },
                      { color: theme.textSecondary }
                    ]}>
                      {b.description}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <ProfileButton 
            label="Get More Points" 
            icon="trending-up" 
            onPress={() => router.push("/ShopScreen")} 
          />
        </View>

        <Pressable 
          style={[styles.settingsBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => router.push("/settings")}
        >
          <Ionicons name="settings-outline" size={20} color={theme.textSecondary} />
          <Text style={[styles.settingsLabel, { color: theme.textSecondary }]}>Settings</Text>
        </Pressable>

        {/* Admin Editor Button */}
        <Pressable 
          style={[styles.adminBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => router.push("/AdminEditorScreen")}
        >
          <Ionicons name="construct-outline" size={18} color={theme.textSecondary} />
          <Text style={[styles.adminLabel, { color: theme.textSecondary }]}>Admin Editor</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={editVisible} transparent animationType="fade">
        <View style={[styles.modalBg, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit your name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Your name"
              placeholderTextColor={theme.textTertiary}
              autoFocus
              maxLength={32}
              returnKeyType="done"
              onSubmitEditing={saveName}
            />
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, { backgroundColor: theme.surface, borderColor: theme.border }]} 
                onPress={() => setEditVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.primary }]} 
                onPress={saveName}
              >
                <Text style={[styles.saveButtonText, { color: theme.buttonText }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

interface ProfileButtonProps {
  label: string;
  icon: string;
  onPress: () => void;
}

function ProfileButton({ label, icon, onPress }: ProfileButtonProps) {
  const { theme } = useTheme();
  
  return (
    <Pressable 
      style={[styles.profileBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} 
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name={icon as any} size={22} color={theme.text} />
      <Text style={[styles.profileBtnText, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Will be overridden by theme.overlay in component
  },
  topBar: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 18 : 10, 
    paddingBottom: 6,
    borderBottomWidth: 1
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  placeholder: {
    width: 26,
  },
  exitBtn: { 
    padding: 10, 
    borderRadius: 20, 
    borderWidth: 1
  },
  header: { 
    alignItems: "center", 
    marginBottom: 20, 
    marginTop: 10 
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatarGradientBorder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 3,
    backgroundColor: 'linear-gradient(45deg, #ffd700, #ff6b6b, #4ecdc4, #9747ff)',
    shadowColor: "#ffd700",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  avatarCircle: { 
    width: 74, 
    height: 74, 
    borderRadius: 37, 
    alignItems: "center", 
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent"
  },
  avatarLetter: { 
    fontWeight: "800", 
    fontSize: 36, 
    letterSpacing: 1.5 
  },
  nameContainer: {
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8, 
    justifyContent: "center",
    marginBottom: 8
  },
  username: { 
    fontWeight: "800", 
    fontSize: 24, 
    letterSpacing: 0.5 
  },
  equippedBadgeContainer: {
    backgroundColor: "transparent",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  legendBadgeContainer: {
    // backgroundColor and borderColor will be set dynamically based on theme
  },
  legendGlow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 16,
    // backgroundColor and shadowColor will be set dynamically based on theme
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  editBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 12, 
    alignSelf: "center", 
    marginTop: 12, 
    marginBottom: 6,
    borderWidth: 1
  },
  editLabel: { 
    fontWeight: "600", 
    fontSize: 14.5 
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginTop: 16,
    marginBottom: 8
  },
  level: { 
    fontWeight: "800", 
    fontSize: 18, 
    letterSpacing: 0.2 
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  streakText: {
    fontWeight: "700",
    fontSize: 16
  },
  xpContainer: {
    alignItems: "center",
    marginTop: 8
  },
  xpBarBackground: { 
    width: 180, 
    height: 10, 
    borderRadius: 8, 
    alignSelf: "center", 
    marginBottom: 4, 
    marginTop: 4, 
    overflow: "hidden",
    borderWidth: 1,
    // borderColor will be set dynamically
  },
  xpBarFill: { 
    height: 10, 
    borderRadius: 8, 
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4
  },
  xpBarGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    // backgroundColor will be set dynamically based on theme
  },
  xpLabel: { 
    fontSize: 13, 
    fontWeight: "600", 
    textAlign: "center", 
    marginTop: 4 
  },

  newBadgeBanner: { 
    flexDirection: "row", 
    borderRadius: 16, 
    alignItems: "center", 
    alignSelf: "center", 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    marginBottom: 12, 
    marginTop: 8, 
    elevation: 8, 
    // shadowColor will be set dynamically
    shadowOpacity: 0.3, 
    shadowRadius: 12,
    borderWidth: 1
  },
  sparkleContainer: {
    marginRight: 10,
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 4
  },
  newBadgeBannerText: { 
    fontWeight: "800", 
    fontSize: 16 
  },

  statsRow: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    marginBottom: 24, 
    marginTop: 12,
    paddingHorizontal: 16
  },
  statCard: { 
    borderRadius: 16, 
    alignItems: "center", 
    padding: 16, 
    minWidth: 90, 
    elevation: 4, 
    shadowColor: "#000", 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    marginHorizontal: 6,
    borderWidth: 1
  },
  statIconContainer: {
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 8,
    marginBottom: 8
  },
  statNumber: { 
    fontWeight: "800", 
    fontSize: 20, 
    marginBottom: 4 
  },
  statLabel: { 
    fontWeight: "600", 
    fontSize: 13 
  },

  badgesSection: { 
    marginHorizontal: 16, 
    marginBottom: 24, 
    marginTop: 12 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: "800", 
    marginTop: 8, 
    marginBottom: 12, 
    marginLeft: 4, 
    letterSpacing: 0.2 
  },
  sectionSubtitle: { 
    fontSize: 14,
    fontWeight: "400"
  },
  badgesWrap: { 
    flexDirection: "column", 
    gap: 12 
  },
  badgeItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    elevation: 4,
    overflow: "hidden",
    maxWidth: screenWidth - 32,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  legendBadgeItem: {
    // borderColor, backgroundColor, and shadowColor are set dynamically based on theme in component
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  badgeIconCircle: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    alignItems: "center", 
    justifyContent: "center", 
    marginRight: 16, 
    borderWidth: 1
  },
  legendIconCircle: {
    // backgroundColor and borderColor will be set dynamically based on theme
  },
  badgeContent: {
    flex: 1
  },
  badgeName: { 
    fontWeight: "800", 
    fontSize: 16.5, 
    marginBottom: 4
  },
  legendBadgeName: {
    // color will be set dynamically based on theme
    fontSize: 17.5
  },
  badgeDesc: { 
    fontSize: 14, 
    lineHeight: 20
  },
  equippedIndicator: {
    position: "absolute",
    bottom: -8, 
    right: -8,
    // backgroundColor will be set dynamically based on theme
    borderRadius: 12,
    padding: 2
  },
  newIndicator: {
    position: "absolute",
    top: -8, 
    left: -8,
    // backgroundColor and shadowColor will be set dynamically based on theme
    borderRadius: 10,
    padding: 2,
    elevation: 4,
  },

  actionsRow: { 
    flexDirection: "row", 
    justifyContent: "center", 
    gap: 24, 
    marginTop: 24, 
    marginBottom: 12,
    paddingHorizontal: 16
  },
  profileBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8, 
    paddingVertical: 14, 
    paddingHorizontal: 20, 
    borderRadius: 14, 
    elevation: 4, 
    shadowColor: "#000", 
    shadowOpacity: 0.1, 
    shadowRadius: 8,
    borderWidth: 1
  },
  profileBtnText: { 
    fontWeight: "700", 
    fontSize: 16
  },

  settingsBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    alignSelf: "center", 
    marginTop: 28, 
    borderRadius: 12, 
    paddingHorizontal: 20, 
    paddingVertical: 12,
    borderWidth: 1
  },
  settingsLabel: { 
    fontWeight: "700", 
    fontSize: 15, 
    marginLeft: 8 
  },
  adminBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    alignSelf: "center", 
    marginTop: 12, 
    marginBottom: 20,
    borderRadius: 12, 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderWidth: 1,
    opacity: 0.7
  }, 
  adminLabel: { 
    fontWeight: "600", 
    fontSize: 13, 
    marginLeft: 8 
  },

  modalBg: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  modalCard: { 
    borderRadius: 20, 
    padding: 32, 
    minWidth: 280, 
    elevation: 10, 
    maxWidth: 340,
    borderWidth: 1
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: "800", 
    marginBottom: 20, 
    textAlign: "center"
  },
  input: { 
    borderRadius: 12, 
    padding: 16, 
    fontSize: 16, 
    borderWidth: 1, 
    marginBottom: 16 
  },
  modalButtons: {
    flexDirection: "row", 
    justifyContent: "space-between", 
    gap: 16
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1
  },
  saveButton: {
  },
  cancelButtonText: { 
    fontWeight: "600", 
    fontSize: 16 
  },
  saveButtonText: { 
    fontWeight: "700", 
    fontSize: 16 
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
    letterSpacing: 0.5,
  },
});
