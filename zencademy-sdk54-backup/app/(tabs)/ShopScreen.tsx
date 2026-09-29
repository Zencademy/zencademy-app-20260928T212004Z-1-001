import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../components/AuthContext";
import { useTheme } from "../../components/ThemeContext";
import { useXP } from "../../components/XPContext";

export const PREMIUM_PLANS = [
  {
    id: "plan-lite",
    icon: "star-outline",
    title: "LITE Plan",
    desc: "Enhanced training with bonus points",
    price: "€4",
    priceInr: "₹399",
    features: [
      "All FREE Features",
      "+10 Points per Exercise",
      "+25 Points per Daily Login",
      "Premium Ebooks Collection",
      "Special Training Modules",
      "Advanced Progress Tracking"
    ],
    action: () => {
      Alert.alert("Upgrade to LITE", "Redirecting to payment...");
    }
  },
  {
    id: "plan-elite",
    icon: "diamond-outline",
    title: "ELITE Plan",
    desc: "Maximum points & exclusive content",
    price: "€8",
    priceInr: "₹799",
    features: [
      "All LITE Features",
      "+50 Points per Training",
      "+50 Points per Daily Login",
      "Extended Premium Ebooks",
      "Exclusive Elite Training",
      "Priority Support",
      "Early Access Features"
    ],
    action: () => {
      Alert.alert("Upgrade to ELITE", "Redirecting to payment...");
    }
  }
];

export const SHOP_BADGES = [
  {
    id: "badge-legend",
    icon: "medal-outline",
    title: "Legend Badge",
    desc: "Unlock the exclusive Zencademy Legend badge.",
    price: 520,
    action: (addXp: (xp: number) => void, unlockBadge: (id: string) => void) => {
      Alert.alert("Unlocked!", "You received the Legend badge!");
      unlockBadge("badge-legend");
    }
  },
  {
    id: "badge-focus",
    icon: "eye-outline",
    title: "Focus Master Badge",
    desc: "Show off your focus mastery with this unique badge.",
    price: 500,
    action: (addXp: (xp: number) => void, unlockBadge: (id: string) => void) => {
      Alert.alert("Unlocked!", "You received the Focus Master badge!");
      unlockBadge("badge-focus");
    }
  },
  {
    id: "badge-streak",
    icon: "flame-outline",
    title: "Streak Champion Badge",
    desc: "Awarded for dedication and daily streaks.",
    price: 480,
    action: (addXp: (xp: number) => void, unlockBadge: (id: string) => void) => {
      Alert.alert("Unlocked!", "You received the Streak Champion badge!");
      unlockBadge("badge-streak");
    }
  },
  {
    id: "badge-zen",
    icon: "leaf-outline",
    title: "Zen Spirit Badge",
    desc: "Symbol of calm and mindfulness.",
    price: 500,
    action: (addXp: (xp: number) => void, unlockBadge: (id: string) => void) => {
      Alert.alert("Unlocked!", "You received the Zen Spirit badge!");
      unlockBadge("badge-zen");
    }
  },
];

// Themes removed

const SHOP_BUNDLES = [
  {
    id: "points-1000",
    icon: "flash",
    title: "1000 Points",
    desc: "Instant boost for your progress!",
    price: 0, // Free with purchase
    realPrice: "€1",
    action: (addXp) => {
      Alert.alert("Purchase Points", "Buy 1000 points for €1?", [
        { text: "Cancel", style: "cancel" },
        { text: "Buy Now", onPress: () => {
          Alert.alert("Payment", "Redirecting to payment gateway...");
          // TODO: Implement real payment integration
        }}
      ]);
    }
  },
  {
    id: "ebook-bundle",
    icon: "library-outline",
    title: "Ebook Bundle",
    desc: "Access to 5 exclusive ebooks.",
    price: 1500,
    action: (addXp) => {
      Alert.alert("Congrats!", "You unlocked 5 ebooks!");
    }
  },
];

const SHOP_GAMES = [
  {
    id: "games-arcade",
    icon: "game-controller-outline",
    title: "Arcade Champions",
    desc: "Unlock premium brain games and challenges",
    comingSoon: true,
  },
  {
    id: "games-puzzles",
    icon: "grid-outline",
    title: "Puzzle Mastery",
    desc: "Advanced puzzle collections and competitions",
    comingSoon: true,
  },
];

const SHOP_COURSES = [
  {
    id: "courses-masterclass",
    icon: "school-outline",
    title: "Elite Masterclass",
    desc: "Premium courses from world-class instructors",
    comingSoon: true,
  },
  {
    id: "courses-certification",
    icon: "ribbon-outline",
    title: "Certification Programs",
    desc: "Get certified and boost your credentials",
    comingSoon: true,
  },
];

const SHOP_THEMES = [
  {
    id: "themes-premium",
    icon: "color-palette-outline",
    title: "Premium Themes",
    desc: "Customize your app with stunning themes",
    comingSoon: true,
  },
  {
    id: "themes-personalized",
    icon: "brush-outline",
    title: "Personalized Themes",
    desc: "Create your own unique color schemes",
    comingSoon: true,
  },
];

// Removed rewarded ads and XP via ads

// --- DUMMY BUTTON pentru "Unlock Everything" (8 euro, alb-negru) ---
function DummyUnlockEverythingButton({ theme }) {
  const [loading, setLoading] = useState(false);

  const simulatePurchase = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Success!", "All features and content have been unlocked (dummy).");
      // TODO: Integrare reală cu Stripe/Google/Apple Pay aici!
    }, 1600);
  };

  return (
    <Pressable
      onPress={simulatePurchase}
      disabled={loading}
      style={[
        styles.unlockBtn,
        { backgroundColor: theme.card, borderColor: theme.border },
        loading && { opacity: 0.5 }
      ]}
    >
      {loading && <ActivityIndicator size="small" color={theme.text} style={{ marginRight: 12 }} />}
      <Text style={[styles.unlockBtnText, { color: theme.text }]}>
        <Ionicons name="diamond-outline" size={18} color={theme.text} style={{ marginRight: 7, marginBottom: -2 }} />
        Unlock Everything
      </Text>
      <View style={[styles.priceTag, { backgroundColor: theme.primary }]}>
        <Text style={[styles.priceText, { color: theme.buttonText }]}>8&nbsp;€</Text>
      </View>
    </Pressable>
  );
}

function SectionDivider({ theme }) {
  return <View style={{ height: 1, backgroundColor: theme.borderLight, marginVertical: 18, width: '100%' }} />;
}

export default function ShopScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { xp, unlockedBadges, addXp, unlockBadge, purchaseShopItem } = useXP();
  const { theme } = useTheme();

  // XP bar anim
  const xpAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(xpAnim, {
      toValue: xp,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [xp]);

  // (No card animation, all cards are static for stability)

  // XP bar setup (max 5000 vizual)
  const maxXP = 5000;
  const barWidth = xpAnim.interpolate({
    inputRange: [0, maxXP],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  // Helper to render premium plans
function renderPlanCard(plan, theme) {
  const isCurrentPlan = plan.id === 'plan-lite'; // User has LITE plan
    
    return (
      <Pressable
        key={plan.id}
        style={[
          styles.planCard,
          { backgroundColor: theme.card, borderColor: theme.border },
          isCurrentPlan && [styles.currentPlanCard, { borderColor: "#FFD700", backgroundColor: theme.surface, shadowColor: "#FFD700" }]
        ]}
        onPress={plan.action}
      >
        <View style={styles.planHeader}>
          <View style={[styles.planIconContainer, { backgroundColor: theme.surface }]}>
            <Ionicons name={plan.icon} size={24} color={isCurrentPlan ? "#FFD700" : theme.primary} />
          </View>
          <View style={styles.planInfo}>
            <Text style={[styles.planTitle, { color: theme.text }]}>{plan.title}</Text>
            <Text style={[styles.planDesc, { color: theme.textSecondary }]}>{plan.desc}</Text>
          </View>
          <View style={styles.planPrice}>
            <Text style={[styles.planPriceText, { color: theme.primary }]}>{plan.price}</Text>
            <Text style={[styles.planPriceInr, { color: theme.textSecondary }]}>{plan.priceInr}</Text>
          </View>
        </View>
        
        <View style={styles.planFeatures}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.planFeature}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={[styles.planFeatureText, { color: theme.text }]}>{feature}</Text>
            </View>
          ))}
        </View>
        
        {isCurrentPlan && (
          <View style={styles.currentPlanBadge}>
            <Text style={styles.currentPlanBadgeText}>Current Plan</Text>
          </View>
        )}
      </Pressable>
    );
  }

  // Helper to render a shop section
  function renderSection(title, items, unlockedBadgesList = null, theme) {
    return (
      <View style={{ width: '100%' }}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
        {items.map((item, idx) => {
          const alreadyBought = unlockedBadgesList && item.id.startsWith('badge-') && unlockedBadgesList.includes(item.id);
          const isComingSoon = item.comingSoon;
          return (
            <View
              key={item.id}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={[styles.iconWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Ionicons
                  name={item.icon}
                  size={28}
                  color={theme.text}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
              </View>
              <View>
                <Pressable
                  style={[
                    styles.buyBtn,
                    { backgroundColor: isComingSoon ? theme.surface : theme.primary },
                    (item.realPrice ? false : (xp < item.price || alreadyBought)) && !isComingSoon && styles.buyBtnDisabled
                  ]}
                  onPress={async () => {
                    if (isComingSoon) {
                      Alert.alert("Coming Soon", "This feature will be available soon!");
                      return;
                    }
                    if (item.id.startsWith('badge-')) {
                      if (!alreadyBought && xp >= item.price) {
                        // First unlock the badge in Supabase
                        await unlockBadge(item.id);
                        // Then deduct points
                        addXp(-item.price);
                        // Show success message
                        item.action(addXp, unlockBadge);
                      }
                    } else if (item.realPrice) {
                      // Real money purchase - no XP check needed
                      item.action(addXp, unlockBadge);
                    } else {
                      if (xp >= item.price) {
                        addXp(-item.price);
                        item.action(addXp, unlockBadge);
                      }
                    }
                  }}
                  disabled={isComingSoon ? false : (item.realPrice ? false : (xp < item.price || alreadyBought))}
                >
                  <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 80, maxWidth: 140 }}>
                    <Text
                      style={[
                        styles.buyBtnText,
                        { color: isComingSoon ? theme.textSecondary : theme.buttonText },
                        (xp < item.price || alreadyBought) && !isComingSoon && { color: theme.textTertiary },
                        { textAlign: 'center', fontSize: 13.5 }
                      ]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {isComingSoon
                        ? "Coming"
                        : alreadyBought
                          ? "Owned"
                          : item.realPrice
                            ? "Buy"
                            : xp < item.price
                              ? "Need Points"
                              : "Buy"
                      }
                    </Text>
                    <Text
                      style={[
                        styles.buyBtnPrice,
                        { color: isComingSoon ? theme.textSecondary : theme.buttonText },
                        (item.realPrice ? false : (xp < item.price || alreadyBought)) && !isComingSoon && { color: theme.textTertiary },
                        { textAlign: 'center', fontSize: 12 }
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {isComingSoon ? "Soon" : (item.realPrice || `${item.price} Points`)}
                    </Text>
                  </View>
                </Pressable>
              </View>
              {/* OVERLAY BLUR + TEXT dacă e deja cumpărat */}
              {alreadyBought && !isComingSoon && (
                <>
                  <BlurView
                    intensity={10}
                    tint="light"
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={[styles.overlay, { backgroundColor: theme.overlay }]}> 
                    <Ionicons name="checkmark-circle" size={27} color={theme.primary} style={{ marginBottom: 4 }} />
                    <Text style={[styles.overlayText, { color: theme.primary }]}>Owned</Text>
                  </View>
                </>
              )}
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.borderLight }]}>
        <Pressable style={[styles.backBtn, { backgroundColor: theme.surface }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Shop</Text>
      </View>
      <View style={styles.xpWrap}>
        <Text style={[styles.xpText, { color: theme.text }]}>Points</Text>
        <View style={[styles.xpBarBg, { backgroundColor: theme.surface }]}>
          <Animated.View style={[styles.xpBarFill, { width: barWidth, backgroundColor: theme.primary }]} />
        </View>
        <Animated.Text style={[styles.xpValue, { color: theme.text }]}>
          {xp} Points
        </Animated.Text>
      </View>
      <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: theme.background }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Premium Plans</Text>
        {PREMIUM_PLANS.map(plan => renderPlanCard(plan, theme))}
        
        <SectionDivider theme={theme} />
        {renderSection('Badges', SHOP_BADGES, unlockedBadges, theme)}
        <SectionDivider theme={theme} />
        
        {renderSection('Bundles', SHOP_BUNDLES, null, theme)}
        
        <SectionDivider theme={theme} />
        {renderSection('Game Arena', SHOP_GAMES, null, theme)}
        
        <SectionDivider theme={theme} />
        {renderSection('Knowledge Hub', SHOP_COURSES, null, theme)}
        
        <SectionDivider theme={theme} />
        {renderSection('Style Studio', SHOP_THEMES, null, theme)}
        
        <SectionDivider theme={theme} />
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Info</Text>
        <View style={[styles.infoBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            • Earn Points from daily training and activities.{"\n"}
            • Badges are unique and visible on your profile.{"\n"}
            • All purchases are permanent for your account.{"\n"}
            • More rewards and features coming soon!
          </Text>
        </View>
      </ScrollView>
      <Text style={[styles.footer, { color: theme.textTertiary }]}>More exclusive rewards coming soon</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 12 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 15,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1.2,
  },
  backBtn: {
    padding: 6,
    marginRight: 5,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1,
    marginLeft: 10,
  },
  xpWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 15,
    paddingLeft: 23,
    paddingRight: 18,
    gap: 11,
  },
  xpText: {
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
    marginRight: 2,
  },
  xpBarBg: {
    flex: 1,
    height: 12,
    borderRadius: 7,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  xpBarFill: {
    height: 12,
    borderRadius: 7,
  },
  xpValue: {
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 2,
    letterSpacing: 0.5,
  },
  scroll: {
    padding: 19,
    paddingBottom: 25,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 17,
    marginBottom: 22,
    shadowColor: "#222",
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1.1,
    minHeight: 78,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.2,
    shadowColor: "#222",
    shadowOpacity: 0.08,
    shadowRadius: 7,
    marginRight: 0,
    marginLeft: 0,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 1,
    letterSpacing: 0.3,
  },
  cardDesc: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.7,
    letterSpacing: 0.07,
  },
  buyBtn: {
    marginLeft: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
    maxWidth: 140,
    alignSelf: "flex-end",
    flexShrink: 0,
  },
  buyBtnDisabled: {
    backgroundColor: "#ededed",
  },
  buyBtnText: {
    fontWeight: "800",
    fontSize: 14.5,
    letterSpacing: 0.7,
    flexShrink: 1,
  },
  buyBtnPrice: {
    fontSize: 12.5,
    fontWeight: "700",
    marginTop: 0,
    letterSpacing: 0.4,
    flexShrink: 1,
  },
  adBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 19,
    marginTop: 17,
    shadowColor: "#191919",
    shadowOpacity: 0.08,
    shadowRadius: 7,
  },
  adBtnText: {
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.2,
  },
  unlockBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 17,
    paddingHorizontal: 28,
    marginBottom: 20,
    marginTop: 6,
    shadowColor: "#111",
    shadowOpacity: 0.09,
    shadowRadius: 8,
    justifyContent: "center"
  },
  unlockBtnText: {
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 0.25,
    marginRight: 11,
    flexDirection: "row",
    alignItems: "center"
  },
  priceTag: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: 6,
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center"
  },
  priceText: {
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 0.7,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  overlayText: {
    fontSize: 16.5,
    fontWeight: "700",
    letterSpacing: 0.7,
    textAlign: "center",
    opacity: 0.88,
  },
  footer: {
    textAlign: "center",
    fontSize: 13,
    marginTop: 0,
    marginBottom: 13,
    fontWeight: "500",
    letterSpacing: 1,
  },
  sectionTitleWrap: {
    marginTop: 8,
    marginBottom: 2,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginTop: 6,
    marginBottom: 18,
    marginHorizontal: 2,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  // Premium Plan Styles
  planCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  currentPlanCard: {
    shadowOpacity: 0.2,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  planIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  planDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  planPrice: {
    alignItems: "flex-end",
  },
  planPriceText: {
    fontSize: 24,
    fontWeight: "900",
  },
  planPriceInr: {
    fontSize: 14,
    marginTop: 2,
  },
  planFeatures: {
    marginBottom: 16,
  },
  planFeature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  planFeatureText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  currentPlanBadge: {
    backgroundColor: "#FFD700",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  currentPlanBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000",
  },
});
