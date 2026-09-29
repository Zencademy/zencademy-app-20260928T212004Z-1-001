import { useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { useAuth } from "../../components/AuthContext";
import SideMenuDrawer from "../../components/SideMenuDrawer";
import { useXP } from "../../components/XPContext"; // Ajustează calea dacă trebuie!
import HomeScreen from "./HomeScreen";
import JournalScreen from "./JournalScreen";
import LeaderboardScreen from "./LeaderboardScreen";
import MenuScreen from "./MenuScreen";
import OnboardingQuizScreen from "./OnboardingQuizScreen";

const { width, height } = Dimensions.get("window");

// ------ SwipeContainer neschimbat -------
function SwipeContainer({ initialPage = 1 }: { initialPage?: number }) {
  const scrollRef = useRef<ScrollView>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ x: initialPage * width, animated: false });
    }, 10);
    return () => clearTimeout(timer);
  }, [initialPage]);

  const goMenu = () => scrollRef.current?.scrollTo({ x: 0, animated: true });
  const goHome = () => scrollRef.current?.scrollTo({ x: width, animated: true });
  const goJournal = () => scrollRef.current?.scrollTo({ x: 2 * width, animated: true });
  const goLeaderboard = () => scrollRef.current?.scrollTo({ x: 3 * width, animated: true });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        style={{ flex: 1, backgroundColor: "#fff" }}
        contentContainerStyle={styles.container}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        scrollEnabled={!menuOpen}
      >
      {/* 0: Menu */}
      <View style={styles.page}>
        <MenuScreen />
      </View>
      {/* 1: Home */}
      <View style={styles.page}>
        <HomeScreen goLeaderboard={goLeaderboard} openMenu={() => setMenuOpen(true)} />
      </View>
      {/* 2: Journal */}
      <View style={styles.page}>
        <JournalScreen goHome={goHome} goMenu={goMenu} goJournal={goJournal} openMenu={() => setMenuOpen(true)} />
      </View>
      {/* 3: Leaderboard */}
      <View style={styles.page}>
        <LeaderboardScreen goHome={goHome} goMenu={goMenu} goJournal={goJournal} openMenu={() => setMenuOpen(true)} />
      </View>
      </ScrollView>
      {/* Render the drawer last so it appears above everything */}
      <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 3000 }} pointerEvents={menuOpen ? 'auto' : 'none'}>
        <SideMenuDrawer visible={menuOpen} onClose={() => setMenuOpen(false)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: "100%" },
  page: { width, height },
});

// ------- Aici e noul entry-point -------
export default function AppEntry() {
  const { onboardingChecked, setOnboardingChecked, loading } = useXP();
  const { isNewUser } = useAuth();
  const params = useLocalSearchParams();
  const initialPage = params.initialPage ? parseInt(params.initialPage as string) : 1;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#232323" />
      </View>
    );
  }

  // Show onboarding only for new users who haven't completed it
  if (isNewUser && !onboardingChecked) {
    console.log("Showing onboarding for new user");
    return (
      <OnboardingQuizScreen
        onFinish={() => setOnboardingChecked(true)}
      />
    );
  }

  console.log("Showing main app - user is not new or has completed onboarding");
  return <SwipeContainer initialPage={initialPage} />;
}
