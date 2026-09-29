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
import ScreensaverOverlay from "../../components/ScreensaverOverlay";
import { useTheme } from "../../components/ThemeContext";
import { useXP } from "../../components/XPContext";

const quotes = [
  "Train your mind. Elevate your life.",
  "Consistency beats intensity.",
  "The best investment is in yourself.",
  "Mindset is everything.",
  "Small habits, big results.",
  "Growth starts with a single thought.",
];

export default function MenuScreen() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const quoteAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const { resetTimer, setScreensaverActive } = useScreensaver();
  const { name } = useXP();
  const { theme, themeMode } = useTheme();

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

  // Navigare la pagini extra cu router.push()
  const goProfile = () => router.push("/ProfileScreen");
  const goJournalLocal = () => {
    // Navigate to the main app entry point with Journal as initial page
    router.push({
      pathname: "/(tabs)",
      params: { initialPage: 2 }
    });
  };
  const goTrainingHub = () => router.push("/TrainingHub");
  const goDailyTasks = () => router.push("/DailyTasksScreen");
  const goMentalTraining = () => router.push("/MentalTrainingScreen");
  const goPhysicalTraining = () => router.push("/PhysicalTrainingScreen");
  const goMeditate = () => router.push("/MeditateScreen");
  const goFocus = () => router.push("/focus");
  const goIntelligenceTest = () => router.push("/IntelligenceTestScreen");
  const goShop = () => router.push("/ShopScreen");
  const goCustomReminders = () => router.push("/CustomRemindersScreen");
  const goSettings = () => router.push("/(tabs)/settings");
  const goEbook = () => router.push("/EbookScreen");
  const goClubs = () => router.push("/ClubsScreen");
  const goCourses = () => {
    Alert.alert("Coming Soon", "Courses feature will be available soon!");
  };

  useFocusEffect(
    React.useCallback(() => {
      resetTimer();
      setScreensaverActive(false);
      return () => {
        setScreensaverActive(false);
      };
    }, [])
  );

  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={resetTimer}
      onLongPress={resetTimer}
      onPressIn={resetTimer}
      onTouchStart={resetTimer}
      onStartShouldSetResponder={() => { resetTimer(); return false; }}
    >
      <LinearGradient
        colors={themeMode === 'dark' ? [theme.surface, theme.background] : ["#f7f7f7", "#fff"]}
        style={styles.page}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <ScreensaverOverlay />
        <StatusBar barStyle={themeMode === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.background} />
        {/* Avatar + Quote */}
        <View style={styles.header}>
          <View style={styles.avatarGlow}>
            <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}>
              <Text style={[styles.avatarLetter, { color: theme.buttonText }]}>
                {name && name.length > 0 ? name.charAt(0).toUpperCase() : "Z"}
              </Text>
            </View>
          </View>
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

        <ScrollView style={styles.menuScroll} contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 0 }}>
          <MenuButton icon="person-outline" label="Profile" onPress={goProfile} />
          <MenuButton icon="cart-outline" label="Shop" onPress={goShop} />
          <MenuButton icon="document-text-outline" label="Journal" onPress={goJournalLocal} />
          <MenuButton icon="barbell-outline" label="Training Hub" onPress={goTrainingHub} />
          <MenuButton icon="speedometer-outline" label="Mental Training" onPress={goMentalTraining} />
          <MenuButton icon="walk-outline" label="Physical Training" onPress={goPhysicalTraining} />
          <MenuButton icon="analytics-outline" label="Intelligence Test" onPress={goIntelligenceTest} />
          <MenuButton icon="checkmark-done-outline" label="Daily Tasks" onPress={goDailyTasks} />
          <MenuButton icon="flash-outline" label="Focus" onPress={goFocus} />
          <MenuButton icon="cloud-outline" label="Meditate" onPress={goMeditate} />
          <MenuButton icon="library-outline" label="Ebook" onPress={goEbook} />
          <MenuButton icon="alarm-outline" label="Custom Reminders" onPress={goCustomReminders} />
          <MenuButton icon="people-outline" label="Clubs" onPress={goClubs} />
          <MenuButton icon="school-outline" label="Courses" onPress={goCourses} />
          <MenuButton icon="settings-outline" label="Settings" onPress={goSettings} />
          
          {/* Upgrade Plan Section */}
          <View style={styles.upgradeSection}>
            <MenuButton 
              icon="diamond-outline" 
              label="Upgrade Plan" 
              onPress={() => router.push('/PlansScreen')}
              isUpgrade={true}
            />
          </View>
        </ScrollView>

        <Text style={[styles.menuFooter, { color: theme.textTertiary }]}>© 2025 Zencademy</Text>
      </LinearGradient>
    </Pressable>
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
