import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, View } from "react-native";
import { useAuth } from "../../components/AuthContext";
import SideMenuDrawer from "../../components/SideMenuDrawer";
import { useScreensaver } from "../../components/ScreensaverContext";
import { useTheme } from "../../components/ThemeContext";
import { useXP } from "../../components/XPContext";
import DailyTasksScreen from "./DailyTasksScreen";
import HomeScreen from "./HomeScreen";
import JournalScreen from "./JournalScreen";
import LeaderboardScreen from "./LeaderboardScreen";
import MenuScreen from "./MenuScreen";
import OnboardingQuizScreen from "./OnboardingQuizScreen";

const { width, height } = Dimensions.get("window");

/** 0 Menu · 1 Home · 2 Daily Tasks · 3 Journal · 4 Leaderboard */
const PAGE = {
  menu: 0,
  home: 1,
  tasks: 2,
  journal: 3,
  leaderboard: 4,
} as const;

function SwipeContainer({ initialPage = PAGE.home }: { initialPage?: number }) {
  const scrollRef = useRef<ScrollView>(null);
  const { theme } = useTheme();
  const { setEnabled, dismiss, resetTimer } = useScreensaver();
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [menuLocked, setMenuLocked] = useState(false);
  const menuLockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ x: initialPage * width, animated: false });
      setPage(initialPage);
    }, 10);
    return () => clearTimeout(timer);
  }, [initialPage]);

  // Screensaver only on Home — and only while this swipe shell is focused
  // (navigating into a game keeps Home mounted underneath otherwise).
  useFocusEffect(
    useCallback(() => {
      const onHome = page === PAGE.home;
      setEnabled(onHome);
      if (!onHome) dismiss();
      return () => {
        setEnabled(false);
        dismiss();
      };
    }, [page, setEnabled, dismiss])
  );

  useEffect(() => {
    if (page === PAGE.menu) {
      setMenuLocked(true);
      if (menuLockTimer.current) clearTimeout(menuLockTimer.current);
      menuLockTimer.current = setTimeout(() => setMenuLocked(false), 450);
    } else {
      setMenuLocked(false);
    }
    return () => {
      if (menuLockTimer.current) clearTimeout(menuLockTimer.current);
    };
  }, [page]);

  const goTo = useCallback((index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setPage(index);
  }, []);

  const goMenu = () => goTo(PAGE.menu);
  const goHome = () => goTo(PAGE.home);
  const goJournal = () => goTo(PAGE.journal);
  const goLeaderboard = () => goTo(PAGE.leaderboard);

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setPage(next);
    resetTimer();
  };

  const mounted = useMemo(() => {
    const set = new Set<number>([PAGE.home, page, page - 1, page + 1, initialPage]);
    return set;
  }, [page, initialPage]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={styles.container}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        scrollEnabled={!menuOpen}
        onScrollBeginDrag={resetTimer}
        onMomentumScrollEnd={onMomentumEnd}
      >
        <View style={styles.page}>
          {mounted.has(PAGE.menu) ? <MenuScreen interactionLocked={menuLocked} /> : null}
        </View>
        <View style={styles.page}>
          {mounted.has(PAGE.home) ? (
            <HomeScreen
              goLeaderboard={goLeaderboard}
              openMenu={() => setMenuOpen(true)}
            />
          ) : null}
        </View>
        <View style={styles.page}>
          {mounted.has(PAGE.tasks) ? <DailyTasksScreen embedded /> : null}
        </View>
        <View style={styles.page}>
          {mounted.has(PAGE.journal) ? (
            <JournalScreen goHome={goHome} goMenu={goMenu} goJournal={goJournal} openMenu={() => setMenuOpen(true)} />
          ) : null}
        </View>
        <View style={styles.page}>
          {mounted.has(PAGE.leaderboard) ? (
            <LeaderboardScreen goHome={goHome} goMenu={goMenu} goJournal={goJournal} openMenu={() => setMenuOpen(true)} />
          ) : null}
        </View>
      </ScrollView>
      <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 3000 }} pointerEvents={menuOpen ? "auto" : "none"}>
        <SideMenuDrawer visible={menuOpen} onClose={() => setMenuOpen(false)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: "100%" },
  page: { width, height, backgroundColor: "transparent" },
});

export default function AppEntry() {
  const { onboardingChecked, setOnboardingChecked, loading } = useXP();
  const { clearNewUserFlag } = useAuth();
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const initialPage = params.initialPage ? parseInt(params.initialPage as string, 10) : PAGE.home;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Gate: any signed-in user without completed onboarding (new signup or unfinished).
  if (!onboardingChecked) {
    return (
      <OnboardingQuizScreen
        onFinish={async () => {
          await setOnboardingChecked(true);
          await clearNewUserFlag();
        }}
      />
    );
  }

  return <SwipeContainer initialPage={Number.isFinite(initialPage) ? initialPage : PAGE.home} />;
}
