import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useTheme } from "../../components/ThemeContext";

export default function ClubsScreen() {
  const router = useRouter();
  const { theme, themeMode } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header with Back Button */}
      <View style={[styles.topBar, { backgroundColor: theme.background, borderBottomColor: theme.borderLight }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Clubs</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Gradient */}
        <View style={[styles.heroSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <LinearGradient
            colors={themeMode === 'light' 
              ? ['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.05)']
              : ['rgba(139, 92, 246, 0.2)', 'rgba(99, 102, 241, 0.15)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}>
              <Ionicons name="people" size={56} color={theme.buttonText} />
            </View>
            <Text style={[styles.heroTitle, { color: theme.text }]}>Coming Soon</Text>
            <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
              Join exclusive clubs, compete with friends, and unlock special rewards together!
            </Text>
          </LinearGradient>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          <View style={[styles.featureCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: themeMode === 'light' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.2)' }]}>
              <Ionicons name="trophy" size={36} color={theme.warning} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.text }]}>Club Competitions</Text>
            <Text style={[styles.featureText, { color: theme.textSecondary }]}>
              Compete with other clubs in weekly challenges and climb the leaderboard
            </Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: themeMode === 'light' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.2)' }]}>
              <Ionicons name="people" size={36} color={theme.info} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.text }]}>Join Friends</Text>
            <Text style={[styles.featureText, { color: theme.textSecondary }]}>
              Create or join clubs with your friends and build a community together
            </Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: themeMode === 'light' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.2)' }]}>
              <Ionicons name="gift" size={36} color={theme.success} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.text }]}>Exclusive Rewards</Text>
            <Text style={[styles.featureText, { color: theme.textSecondary }]}>
              Unlock special badges, XP bonuses, and unique rewards only for club members
            </Text>
          </View>
        </View>

        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="information-circle-outline" size={24} color={theme.primary} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            We're working hard to bring you this exciting feature. Stay tuned for updates!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 18 : 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.5,
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  heroSection: {
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  heroGradient: {
    padding: 32,
    alignItems: "center",
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  featuresGrid: {
    gap: 20,
    marginBottom: 24,
  },
  featureCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    alignSelf: "center",
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  featureText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
