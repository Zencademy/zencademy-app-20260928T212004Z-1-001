import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Dimensions, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from "../../components/AuthContext";
import { useTheme } from "../../components/ThemeContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;

const PLANS = [
  {
    id: "lite",
    title: "Lite Plan",
    price: "€4",
    priceInr: "₹399",
    color: "#6366F1", // Indigo
    description: "Perfect to get started. Build consistent habits with essential training.",
    websiteBenefits: [
      {
        icon: "library",
        text: "25 courses (Free + Lite)"
      },
      {
        icon: "school",
        text: "16 exclusive Lite courses"
      },
      {
        icon: "book",
        text: "Lite ebooks collection"
      },
      {
        icon: "play-circle",
        text: "Premium Lite tutorials"
      }
    ],
    appBenefits: [
      {
        icon: "game-controller",
        text: "7 cognitive games (3 basic + 4 Lite)"
      },
      {
        icon: "trophy",
        text: "Progress tracking & analytics"
      },
      {
        icon: "flame",
        text: "Daily streak rewards"
      },
      {
        icon: "medal",
        text: "Achievement badges"
      }
    ],
    fomoText: "Perfect to get started. Don't fall behind.",
    buttonText: "Choose Lite",
    isPopular: false
  },
  {
    id: "elite",
    title: "Elite Plan",
    price: "€8",
    priceInr: "₹799",
    color: "#8B5CF6", // Purple
    description: "Unlock everything. Join thousands leveling up with Elite training.",
    websiteBenefits: [
      {
        icon: "library",
        text: "37 courses (All tiers)"
      },
      {
        icon: "school",
        text: "12 exclusive Elite courses"
      },
      {
        icon: "person",
        text: "1-on-1 coaching session included"
      },
      {
        icon: "book",
        text: "2000+ ebooks (multi-language)"
      },
      {
        icon: "play-circle",
        text: "All Elite tutorials"
      }
    ],
    appBenefits: [
      {
        icon: "game-controller",
        text: "11 total games (all Lite + 4 Elite)"
      },
      {
        icon: "trophy",
        text: "Advanced progress tracking"
      },
      {
        icon: "flame",
        text: "Enhanced streak rewards"
      },
      {
        icon: "medal",
        text: "Exclusive Elite badges"
      },
      {
        icon: "star",
        text: "Priority support"
      }
    ],
    fomoText: "Best value. Join thousands leveling up with Elite.",
    buttonText: "Go Elite",
    isPopular: true
  }
];

export default function PlansScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleUpgrade = (planId: string) => {
    // Redirect to website pricing page
    const pricingUrl = "https://zencademy.site/pricing";
    Alert.alert(
      "Complete Your Upgrade", 
      `You'll be redirected to our website to complete your ${planId.toUpperCase()} plan upgrade.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Continue to Website", onPress: () => {
          // In a real app, you would use Linking.openURL(pricingUrl)
          Alert.alert("Redirect", `Opening ${pricingUrl}`);
        }}
      ]
    );
  };

  const renderPlanCard = (plan: any, index: number) => {
    const isCurrentPlan = plan.id === 'lite'; // User has LITE plan
    const isSelected = selectedPlan === plan.id;
    
    const cardAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      }).start();
    }, []);
    
    return (
      <Animated.View
        key={plan.id}
        style={[
          {
            opacity: cardAnim,
            transform: [
              { translateY: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [40, 0]
              })},
              { scale: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1]
              })}
            ]
          }
        ]}
      >
        <View style={[
          styles.planCard,
          { backgroundColor: theme.card, borderColor: theme.border },
          plan.isPopular && styles.popularCard,
          isCurrentPlan && styles.currentPlanCard,
          isSelected && styles.selectedCard
        ]}>
          {plan.isPopular && (
            <View style={[styles.popularRibbon, { backgroundColor: plan.color }]}>
              <Ionicons name="star" size={14} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.popularRibbonText}>Most Popular</Text>
            </View>
          )}
          
          <View style={styles.cardHeader}>
            <Text style={[styles.planTitle, { color: plan.color }]}>{plan.title}</Text>
            <View style={styles.priceContainer}>
              <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
              <Text style={[styles.planPriceInr, { color: theme.textSecondary }]}>{plan.priceInr}</Text>
            </View>
            <Text style={[styles.planDescription, { color: theme.textSecondary }]}>{plan.description}</Text>
          </View>

          {isSelected && (
            <View style={styles.benefitsContainer}>
              <View style={styles.benefitsSection}>
                <Text style={[styles.benefitsSectionTitle, { color: plan.color }]}>
                  <Ionicons name="globe" size={16} color={plan.color} /> Website Benefits
                </Text>
                {plan.websiteBenefits.map((benefit: any, benefitIndex: number) => (
                  <View key={`website-${benefitIndex}`} style={styles.benefitItem}>
                    <View style={[styles.benefitIconContainer, { backgroundColor: plan.color + '20' }]}>
                      <Ionicons name={benefit.icon as any} size={18} color={plan.color} />
                    </View>
                    <Text style={[styles.benefitText, { color: theme.text }]}>{benefit.text}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.benefitsSection}>
                <Text style={[styles.benefitsSectionTitle, { color: plan.color }]}>
                  <Ionicons name="phone-portrait" size={16} color={plan.color} /> App Benefits
                </Text>
                {plan.appBenefits.map((benefit: any, benefitIndex: number) => (
                  <View key={`app-${benefitIndex}`} style={styles.benefitItem}>
                    <View style={[styles.benefitIconContainer, { backgroundColor: plan.color + '20' }]}>
                      <Ionicons name={benefit.icon as any} size={18} color={plan.color} />
                    </View>
                    <Text style={[styles.benefitText, { color: theme.text }]}>{benefit.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.fomoContainer}>
            <Text style={[styles.fomoText, { color: theme.textSecondary }]}>{plan.fomoText}</Text>
          </View>

          {isCurrentPlan && (
            <View style={[styles.currentPlanBadge, { backgroundColor: plan.color }]}>
              <Text style={styles.currentPlanBadgeText}>Current Plan</Text>
            </View>
          )}

          {!isCurrentPlan && (
            <Pressable
              style={({ pressed }) => [
                styles.upgradeButton,
                { 
                  backgroundColor: plan.color,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }]
                }
              ]}
              onPress={() => {
                if (isSelected) {
                  handleUpgrade(plan.id);
                } else {
                  handlePlanSelect(plan.id);
                }
              }}
            >
              <Text style={[
                styles.upgradeButtonText,
                { color: '#fff' }
              ]}>
                {isSelected ? 'Continue to Website' : plan.buttonText}
              </Text>
            </Pressable>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
      <Animated.View 
        style={[
          styles.header, 
          { 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }],
            backgroundColor: theme.background,
            borderBottomColor: theme.borderLight
          }
        ]}
      >
        <View style={styles.headerTop}>
          <Pressable style={[styles.backBtn, { backgroundColor: theme.surface }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Choose Your Plan</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Unlock your potential today. Upgrade anytime.</Text>
      </Animated.View>

      <ScrollView 
        style={[styles.scrollView, { backgroundColor: theme.background }]} 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.plansContainer}>
          {PLANS.map((plan, index) => renderPlanCard(plan, index))}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textTertiary }]}>Cancel anytime. Upgrade whenever you want.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: "900",
    textAlign: "center",
    flex: 1,
    fontFamily: "System",
  },
  headerSubtitle: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  plansContainer: {
    marginBottom: 30,
  },
  planCard: {
    borderRadius: 25,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },
  popularCard: {
    borderWidth: 3,
    shadowOpacity: 0.15,
    transform: [{ scale: 1.02 }],
  },
  currentPlanCard: {
  },
  selectedCard: {
    transform: [{ scale: 1.01 }],
  },
  popularRibbon: {
    position: "absolute",
    top: -1,
    left: 20,
    right: 20,
    borderRadius: 0,
    paddingVertical: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 1,
  },
  popularRibbonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
  },
  cardHeader: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  planTitle: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: "900",
    marginBottom: 12,
    textAlign: "center",
  },
  priceContainer: {
    alignItems: "center",
  },
  planPrice: {
    fontSize: isSmallScreen ? 36 : 42,
    fontWeight: "900",
    marginBottom: 4,
  },
  planPriceInr: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: "600",
  },
  planDescription: {
    fontSize: isSmallScreen ? 14 : 16,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
    fontWeight: "500",
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitsSection: {
    marginBottom: 20,
  },
  benefitsSectionTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: "700",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  benefitText: {
    fontSize: isSmallScreen ? 15 : 16,
    flex: 1,
    fontWeight: "500",
    lineHeight: 22,
  },
  fomoContainer: {
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  fomoText: {
    fontSize: isSmallScreen ? 13 : 14,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 20,
  },
  currentPlanBadge: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "center",
    marginBottom: 16,
  },
  currentPlanBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  upgradeButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  upgradeButtonText: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: "center",
    paddingTop: 20,
  },
  footerText: {
    fontSize: isSmallScreen ? 12 : 14,
    textAlign: "center",
    lineHeight: 20,
  },
});