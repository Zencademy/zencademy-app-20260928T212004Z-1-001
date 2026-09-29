import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useScreensaver } from "../../components/ScreensaverContext";
import { useTheme } from "../../components/ThemeContext";
import { useXP } from "../../components/XPContext";
import { Breath, FadeRise } from "../../components/ui/motion";
import { avatarGlyph, avatarTone, getEquippedAvatar } from "../../lib/inventory";

const quotes = [
  "Standards over moods.",
  "Execute quietly. Win loudly.",
  "No soft days.",
  "Your future self is watching.",
  "Pressure builds the edge.",
  "Focus is a weapon.",
];

export default function MenuScreen({ interactionLocked = false }: { interactionLocked?: boolean }) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const quoteAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const { resetTimer } = useScreensaver();
  const { name } = useXP();
  const { theme, themeMode } = useTheme();

  useEffect(() => {
    void getEquippedAvatar().then(setAvatarId);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const animateQuote = () => {
      Animated.timing(quoteAnim, { toValue: 0, duration: 320, useNativeDriver: true }).start(() => {
        if (isMounted) {
          setQuoteIndex((prev) => (prev + 1) % quotes.length);
          Animated.timing(quoteAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        }
      });
    };
    const interval = setInterval(animateQuote, 3600);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  const guard = (fn: () => void) => () => {
    if (interactionLocked) return;
    fn();
  };

  // Navigare la pagini extra cu router.push()
  const goProfile = guard(() => router.push("/ProfileScreen"));
  const goJournalLocal = guard(() => {
    router.push({ pathname: "/(tabs)", params: { initialPage: 3 } });
  });
  const goDailyTasks = guard(() => {
    router.push({ pathname: "/(tabs)", params: { initialPage: 2 } });
  });
  const goTrainingHub = guard(() => router.push("/TrainingHub"));
  const goMentalTraining = guard(() => router.push("/MentalTrainingScreen"));
  const goPhysicalTraining = guard(() => router.push("/PhysicalTrainingScreen"));
  const goMeditate = guard(() => router.push("/MeditateScreen"));
  const goFocus = guard(() => router.push("/focus"));
  const goIntelligenceTest = guard(() => router.push("/IntelligenceTestScreen"));
  const goShop = guard(() => router.push("/ShopScreen"));
  const goCustomReminders = guard(() => router.push("/CustomRemindersScreen"));
  const goSettings = guard(() => router.push("/(tabs)/settings"));
  const goEbook = guard(() => router.push("/EbookScreen"));
  const goClubs = guard(() => router.push("/ClubsScreen"));
  const goLeaderboard = guard(() => {
    router.push({ pathname: "/(tabs)", params: { initialPage: 4 } });
  });
  const goCourses = guard(() => {
    Alert.alert("Coming Soon", "Courses feature will be available soon!");
  });

  useFocusEffect(
    React.useCallback(() => {
      resetTimer();
      void getEquippedAvatar().then(setAvatarId);
      return () => {};
    }, [resetTimer])
  );

  const letter = name && name.length > 0 ? name.charAt(0).toUpperCase() : "Z";
  const face = avatarGlyph(avatarId, letter);
  const tone = avatarTone(avatarId);

  return (
    <View style={{ flex: 1 }}>
      <Pressable
        style={{ flex: 1 }}
        onPress={resetTimer}
        onLongPress={resetTimer}
        onPressIn={resetTimer}
        onTouchStart={resetTimer}
        onStartShouldSetResponder={() => { resetTimer(); return false; }}
      >
      <LinearGradient
        colors={themeMode === 'dark' ? [theme.background, '#0A0A0A', theme.surface] : [theme.surface, theme.background]}
        style={styles.page}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <StatusBar barStyle={themeMode === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.background} />
        <View style={styles.header}>
          <Breath amount={1.04}>
            <View style={styles.avatarGlow}>
              <View style={[styles.avatarCircle, {
                backgroundColor: tone?.tone || theme.primary,
                borderColor: avatarId ? theme.primary : theme.border,
                borderWidth: avatarId ? 2 : 1,
              }]}>
                <Text style={[styles.avatarLetter, {
                  color: tone?.ink || theme.buttonText,
                  fontSize: avatarId ? 26 : 30,
                }]}>
                  {face}
                </Text>
              </View>
              {avatarId ? (
                <View style={{
                  position: 'absolute',
                  right: -2,
                  bottom: -2,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="checkmark" size={12} color={theme.primary} />
                </View>
              ) : null}
            </View>
          </Breath>
          <Animated.Text
            style={[
              styles.quoteText,
              { color: theme.text },
              {
                opacity: quoteAnim,
                transform: [
                  {
                    translateY: quoteAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {quotes[quoteIndex]}
          </Animated.Text>
        </View>

        <ScrollView style={styles.menuScroll} contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 0 }} scrollEnabled={!interactionLocked}>
          {[
            { icon: "person-outline", label: "Profile", onPress: goProfile },
            { icon: "checkmark-done-outline", label: "Daily Execution", onPress: goDailyTasks },
            { icon: "document-text-outline", label: "Journal", onPress: goJournalLocal },
            { icon: "trophy-outline", label: "Leaderboard", onPress: goLeaderboard },
            { icon: "cart-outline", label: "Shop", onPress: goShop },
            { icon: "barbell-outline", label: "Training Hub", onPress: goTrainingHub },
            { icon: "speedometer-outline", label: "Mental Training", onPress: goMentalTraining },
            { icon: "walk-outline", label: "Physical Training", onPress: goPhysicalTraining },
            { icon: "analytics-outline", label: "Cognitive Assessment", onPress: goIntelligenceTest },
            { icon: "flash-outline", label: "Focus", onPress: goFocus },
            { icon: "cloud-outline", label: "Meditate", onPress: goMeditate },
            { icon: "library-outline", label: "Ebook", onPress: goEbook },
            { icon: "alarm-outline", label: "Custom Reminders", onPress: goCustomReminders },
            { icon: "people-outline", label: "Clubs", onPress: goClubs },
            { icon: "school-outline", label: "Courses", onPress: goCourses },
            { icon: "settings-outline", label: "Settings", onPress: goSettings },
          ].map((item, i) => (
            <FadeRise key={item.label} delay={Math.min(i * 35, 280)}>
              <MenuButton icon={item.icon} label={item.label} onPress={item.onPress} />
            </FadeRise>
          ))}

          <FadeRise delay={300}>
            <View style={styles.upgradeSection}>
              <MenuButton
                icon="cash-outline"
                label="Upgrade Plan"
                onPress={guard(() => router.push('/PlansScreen'))}
                isUpgrade={true}
              />
            </View>
          </FadeRise>
        </ScrollView>

        <Text style={[styles.menuFooter, { color: theme.textTertiary }]}>© 2025 Zencademy</Text>
      </LinearGradient>
    </Pressable>
      {interactionLocked ? (
        <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 50 }} pointerEvents="auto" />
      ) : null}
    </View>
  );
}

function MenuButton({ icon, label, onPress, isUpgrade = false }: { icon: string; label: string; onPress: () => void; isUpgrade?: boolean }) {
  const { theme } = useTheme();
  
  return (
    <Pressable style={({ pressed }) => [
      styles.menuItem,
      { backgroundColor: theme.card, borderColor: theme.border },
      isUpgrade && styles.upgradeMenuItem,
      pressed && { backgroundColor: isUpgrade ? theme.accent + '20' : theme.surface, shadowOpacity: 0.16 }
    ]} onPress={onPress}>
      <Ionicons 
        name={icon as any} 
        size={28} 
        color={isUpgrade ? theme.accent : theme.text} 
        style={{ marginRight: 18, opacity: 0.82 }} 
      />
      <Text style={[styles.menuText, { color: theme.text }, isUpgrade && { color: theme.accent }]}>{label}</Text>
      <Ionicons 
        name="chevron-forward-outline" 
        size={22} 
        color={isUpgrade ? theme.accent : theme.textTertiary} 
        style={{ marginLeft: 'auto', opacity: 0.82 }} 
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: "100%",
    minHeight: "100%",
    paddingTop: Platform.OS === "android" ? 32 : 0,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 45,
    paddingBottom: 20,
  },
  avatarGlow: {
    position: "relative",
    shadowColor: "#333",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    marginBottom: 8,
    borderRadius: 32,
  },
  avatarCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.2,
    borderColor: "#e0e0e0",
  },
  avatarLetter: {
    fontSize: 30,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  quoteText: {
    fontSize: 17,
    fontStyle: "italic",
    textAlign: "center",
    minHeight: 44,
    marginVertical: 12,
    marginBottom: 18,
    lineHeight: 22,
    fontWeight: "400",
    paddingHorizontal: 18,
  },
  divider: {
    width: "84%",
    height: 1,
    alignSelf: "center",
    marginBottom: 16,
    borderRadius: 1,
  },
  menuScroll: {
    flex: 1,
    width: "100%",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 18,
    marginVertical: 13,
    shadowColor: "#222",
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 7,
    transitionDuration: "120ms",
    borderWidth: 1,
  },
  menuText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  menuFooter: {
    fontSize: 12,
    fontWeight: "400",
    textAlign: "center",
    paddingBottom: 32,
    marginTop: 10,
  },
  upgradeSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  upgradeMenuItem: {
    borderWidth: 1,
  },
  upgradeMenuText: {
    fontWeight: "800",
  },
});
