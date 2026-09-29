import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated, Dimensions,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet, Text, TouchableOpacity,
    View
} from 'react-native';
import { useScreensaver } from "../../components/ScreensaverContext";
import { useTheme } from '../../components/ThemeContext';
import { useXP } from '../../components/XPContext';
import { type } from '../../components/ui/type';
import { AnimatedXpBar, FadeRise, FlameStreak, SpinCoin, ThunderBolt } from '../../components/ui/motion';
import useResponsive from '../../hooks/useResponsive';
import { getXpForLevel } from '../../utils/levels';
// duplicate import removed

const { width } = Dimensions.get('window');
const MAX_LEVEL = 100;
const REWARD_THRESHOLDS = [5000, 10000, 20000, 35000, 50000];
const RANDOM_FACTS = [
  "Neuroplasticity means your brain can change at any age.",
  "The brain's plasticity is lifelong—never stop learning!",
  "Every belief you challenge rewires your brain.",
  "Discomfort is often a sign you are growing.",
  "Physical exercise also improves brain power.",
  "Hydration is key to optimal brain function.",
  "Gratitude practices are proven to lower stress.",
  "Visualization enhances performance in any skill.",
  "Reading 15 minutes a day adds up to over 1 million words a year.",
  "Writing goals increases your chance of achievement by 42%.",
  "A positive mindset enhances your physical health.",
  "Walking in nature can boost creativity by 60%.",
  "Setting daily intentions improves productivity.",
  "Consistent routines lower stress and enhance results.",
  "Deep work can triple your daily output.",
  "Solving logic puzzles boosts IQ and reasoning.",
  "A good question is more powerful than a quick answer.",
  "The act of writing by hand boosts learning and memory.",
  "Reading fiction increases empathy.",
];

type Props = {
  goLeaderboard?: () => void;
  openMenu?: () => void;
};

// Available menu options for customization (mirrors MenuScreen)
const MENU_OPTIONS = [
  { id: 1, title: 'Profile', subtitle: 'Your profile & settings', route: '/ProfileScreen', icon: 'person-outline' },
  { id: 2, title: 'Shop', subtitle: 'Badges for coins', route: '/ShopScreen', icon: 'cart-outline' },
  { id: 3, title: 'Journal', subtitle: 'Private log of the day', route: '/(tabs)?initialPage=3', icon: 'document-text-outline' },
  { id: 4, title: 'Training Hub', subtitle: 'Mental & physical training', route: '/TrainingHub', icon: 'barbell-outline' },
  { id: 5, title: 'Mental Training', subtitle: 'Cognitive workouts', route: '/MentalTrainingScreen', icon: 'speedometer-outline' },
  { id: 6, title: 'Physical Training', subtitle: 'Body performance', route: '/PhysicalTrainingScreen', icon: 'walk-outline' },
  { id: 7, title: 'Intelligence Test', subtitle: 'Measure and improve', route: '/IntelligenceTestScreen', icon: 'analytics-outline' },
  { id: 8, title: 'Daily Execution', subtitle: 'Lock in today’s targets', route: '/(tabs)?initialPage=2', icon: 'checkmark-done-outline' },
  { id: 9, title: 'Focus', subtitle: 'Focus training', route: '/focus', icon: 'flash-outline' },
  { id: 10, title: 'Meditate', subtitle: 'Reset under pressure', route: '/MeditateScreen', icon: 'cloud-outline' },
  { id: 11, title: 'Ebook', subtitle: 'Buy with coins', route: '/EbookScreen', icon: 'library-outline' },
  { id: 12, title: 'Custom Reminders', subtitle: 'Build your routine', route: '/CustomRemindersScreen', icon: 'alarm-outline' },
  { id: 13, title: 'Leaderboard', subtitle: 'Where you stand', route: '/(tabs)?initialPage=4', icon: 'trophy-outline' },
  { id: 14, title: 'Clubs', subtitle: 'Join clubs & compete', route: '/ClubsScreen', icon: 'people-outline' },
  { id: 15, title: 'Settings', subtitle: 'App preferences', route: '/(tabs)/settings', icon: 'settings-outline' },
];

interface CustomizationModalProps {
  visible: boolean;
  onClose: () => void;
  customButtons: any[];
  setCustomButtons: (buttons: any[]) => void;
  showMonthlyChallenge: boolean;
  setShowMonthlyChallenge: (show: boolean) => void;
  onSave: () => void;
}

const CustomizationModal: React.FC<CustomizationModalProps> = ({
  visible,
  onClose,
  customButtons,
  setCustomButtons,
  showMonthlyChallenge,
  setShowMonthlyChallenge,
  onSave,
}) => {
  const { theme } = useTheme();
  const [selectedButtonIndex, setSelectedButtonIndex] = useState<number | null>(null);
  const [showReplacementPopup, setShowReplacementPopup] = useState<boolean>(false);

  const handleButtonChange = (buttonIndex: number, newOption: any) => {
    const newButtons = [...customButtons];
    newButtons[buttonIndex] = { ...newOption, id: buttonIndex + 1 };
    setCustomButtons(newButtons);
    setSelectedButtonIndex(null);
    setShowReplacementPopup(false);
  };

  const handleSave = () => {
    onSave();
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
      <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Customize Home Screen</Text>
          <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: theme.surface }]}>
            <Ionicons name="close" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Monthly Challenge Toggle */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Content Display</Text>
          <TouchableOpacity
            style={styles.toggleContainer}
            onPress={() => setShowMonthlyChallenge(!showMonthlyChallenge)}
          >
            <Text style={[styles.toggleLabel, { color: theme.text }]}>
              {showMonthlyChallenge ? 'Monthly Challenge' : 'Daily Wisdom'}
            </Text>
            <View style={[styles.toggle, { backgroundColor: theme.surface }, showMonthlyChallenge && { backgroundColor: theme.primary }]}>
              <View style={[styles.toggleThumb, { backgroundColor: theme.textTertiary }, showMonthlyChallenge && { backgroundColor: theme.buttonText }]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Button Customization */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Customize Buttons</Text>
          <View style={styles.buttonGrid}>
            {customButtons.map((button, index) => (
              <TouchableOpacity
                key={button.id}
                style={[styles.customButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => { setSelectedButtonIndex(index); setShowReplacementPopup(true); }}
              >
                <Ionicons name={button.icon as any} size={24} color={theme.primary} />
                <Text style={[styles.customButtonTitle, { color: theme.text }]}>{button.title}</Text>
                <Text style={[styles.customButtonSubtitle, { color: theme.textSecondary }]}>{button.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Replacement Popup */}
        {showReplacementPopup && selectedButtonIndex !== null && (
          <View style={[styles.popupOverlay, { backgroundColor: theme.overlay }]}>
            <View style={[styles.popupContainer, { backgroundColor: theme.card }]}>
              <View style={styles.popupHeader}>
                <Text style={[styles.popupTitle, { color: theme.text }]}>Choose replacement</Text>
                <TouchableOpacity onPress={() => { setShowReplacementPopup(false); setSelectedButtonIndex(null); }} style={[styles.closeButton, { backgroundColor: theme.surface }]}>
                  <Ionicons name="close" size={22} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
                <View style={styles.optionsGrid}>
                  {MENU_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[styles.optionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                      onPress={() => handleButtonChange(selectedButtonIndex, option)}
                    >
                      <Ionicons name={option.icon as any} size={20} color={theme.primary} />
                      <Text style={[styles.optionTitle, { color: theme.text }]}>{option.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleSave}>
          <Text style={[styles.saveButtonText, { color: theme.buttonText }]}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function HomeScreen({ goLeaderboard, openMenu }: Props) {
  const { xp = 0, level = 1, streak = 0, brainType = "", name = "", updateDailyLoginStreak, totalPoints = 0, coins = 0 } = useXP();
  const router = useRouter();
  const { insets, breakpoint, isTablet } = (useResponsive as any)();
  const { theme } = useTheme();
  const [factIdx, setFactIdx] = useState(0);
  const factFade = useRef(new Animated.Value(1)).current;
  const totalXp = totalPoints;

  // Update daily login streak when component mounts
  useEffect(() => {
    if (updateDailyLoginStreak) {
      updateDailyLoginStreak();
    }
  }, [updateDailyLoginStreak]);
  const { resetTimer } = useScreensaver();

  // Onboarding status (NEBLOCANT!)
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  // Customization state
  const [showSettingsButton, setShowSettingsButton] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [showHelpButton, setShowHelpButton] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [screenLongPressTimer, setScreenLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [customButtons, setCustomButtons] = useState([
    { id: 1, title: 'Daily Execution', subtitle: 'Lock in today’s targets', route: '/(tabs)?initialPage=2', icon: 'checkmark-done-outline' },
    { id: 2, title: 'Training Hub', subtitle: 'Mental & physical training', route: '/TrainingHub', icon: 'barbell-outline' },
    { id: 3, title: 'Shop', subtitle: 'Badges for coins', route: '/ShopScreen', icon: 'cart-outline' },
    { id: 4, title: 'Leaderboard', subtitle: 'Where you stand', route: '/(tabs)?initialPage=4', icon: 'trophy-outline' }
  ]);
  const [showMonthlyChallenge, setShowMonthlyChallenge] = useState(false);

  useEffect(() => {
    // Marchează doar dacă s-a trecut vreodată de onboarding, dar nu mai blochează accesul!
    AsyncStorage.getItem("@onboarding_done").then((val) => {
      setOnboardingChecked(true);
      // poți adăuga aici orice logică suplimentară, dar nu mai face redirect!
    });
  }, []);

  // Load customization settings
  useEffect(() => {
    const loadCustomization = async () => {
      try {
        const savedButtons = await AsyncStorage.getItem('@custom_buttons');
        const savedChallenge = await AsyncStorage.getItem('@show_monthly_challenge');
        
        if (savedButtons) {
          setCustomButtons(JSON.parse(savedButtons));
        }
        if (savedChallenge) {
          setShowMonthlyChallenge(JSON.parse(savedChallenge));
        }
      } catch (error) {
        console.error('Error loading customization:', error);
      }
    };
    
    loadCustomization();
  }, []);

  // Save customization settings
  const saveCustomization = async () => {
    try {
      await AsyncStorage.setItem('@custom_buttons', JSON.stringify(customButtons));
      await AsyncStorage.setItem('@show_monthly_challenge', JSON.stringify(showMonthlyChallenge));
    } catch (error) {
      console.error('Error saving customization:', error);
    }
  };

  // Long press handler
  const handleLongPress = () => {
    setShowSettingsButton(true);
    // Keep in sync with help button visibility duration
    setTimeout(() => setShowSettingsButton(false), 5000); // Hide after 5 seconds
  };

  // Load help button visibility (permanently hidden state)
  useEffect(() => {
    const loadHelpVisibility = async () => {
      try {
        await AsyncStorage.getItem('@help_button_hidden');
      } catch (error) {
        console.error('Error loading help visibility:', error);
      }
    };
    loadHelpVisibility();
  }, []);

  // Handle screen long press (show help button if not permanently hidden)
  const handleScreenLongPress = async () => {
    try {
      const hidden = await AsyncStorage.getItem('@help_button_hidden');
      if (hidden !== 'true') {
        setShowHelpButton(true);
        setTimeout(() => {
          setShowHelpButton(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error checking help visibility:', error);
    }
  };

  // Handle help button long press (3 seconds to hide permanently)
  const handleHelpLongPress = () => {
    const timer = setTimeout(async () => {
      try {
        await AsyncStorage.setItem('@help_button_hidden', 'true');
        setShowHelpButton(false);
      } catch (error) {
        console.error('Error hiding help button:', error);
      }
    }, 3000);
    setLongPressTimer(timer);
  };

  const handleHelpPressOut = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      resetTimer();
      return () => {};
    }, [resetTimer])
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
    }).start();
  }, []);

  // Rotate wisdom facts only while the Home screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const interval = setInterval(() => {
        Animated.timing(factFade, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => {
          setFactIdx(prev => {
            let nextIdx = Math.floor(Math.random() * RANDOM_FACTS.length);
            if (nextIdx === prev && RANDOM_FACTS.length > 1) {
              nextIdx = (nextIdx + 1) % RANDOM_FACTS.length;
            }
            return nextIdx;
          });
          setTimeout(() => {
            Animated.timing(factFade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
          }, 150);
        });
      }, 15000);
      return () => clearInterval(interval);
    }, [])
  );

  const currentLevelXp = level < MAX_LEVEL ? getXpForLevel(level) : getXpForLevel(MAX_LEVEL);
  // Use authoritative total points from Supabase/website
  const totalXp = totalPoints;

  // UI principal: NU mai există fallback/redirect, aplicația rulează orice ar fi!
  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={resetTimer}
      onLongPress={() => {
        handleLongPress();
        handleScreenLongPress();
      }}
      onPressOut={() => {
        // no-op for help button timer on release
      }}
      onPressIn={() => {
        resetTimer();
      }}
      onTouchStart={resetTimer}
      onStartShouldSetResponder={() => { resetTimer(); return false; }}
      delayLongPress={1000}
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <Animated.View style={[styles.container, { opacity: fadeAnim, width, backgroundColor: theme.background }]}>
          {/* Settings Button */}
          {showSettingsButton && (
            <TouchableOpacity
              style={[styles.settingsButton, { backgroundColor: theme.surface }]}
              onPress={() => setShowCustomizationModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={20} color={theme.text} />
            </TouchableOpacity>
          )}
          {/* Header Section */}
          <FadeRise>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={styles.headerTopLeft} />
                <View style={styles.titleContainer}>
                  <Text style={[type.brand, { color: theme.text, textAlign: 'center' }]}>ZENCADEMY</Text>
                  <View style={{ height: 2, width: 36, marginTop: 6, alignSelf: 'center', backgroundColor: theme.primary }} />
                </View>
                {showHelpButton ? (
                  <Pressable
                    onPress={() => setShowHelpModal(true)}
                    onLongPress={handleHelpLongPress}
                    onPressOut={handleHelpPressOut}
                    style={[styles.helpButton, { backgroundColor: theme.surface }]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="help-circle-outline" size={20} color={theme.textSecondary} />
                  </Pressable>
                ) : (
                  <View style={styles.headerTopLeft} />
                )}
              </View>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Focus. Execute. Ascend.</Text>
            </View>
          </FadeRise>

          {/* Progress Card */}
          <FadeRise delay={60}>
            <View style={[styles.progressCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
              <View style={styles.progressHeader}>
                <Text style={[styles.levelText, { color: theme.text }]}>
                  Level {level}{level >= MAX_LEVEL ? ' · MAX' : ''}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, height: 18 }}>
                  <FlameStreak size={18} color={theme.flame} active={streak > 0} />
                  <Text style={[styles.streakText, { color: theme.flame, lineHeight: 18, includeFontPadding: false }]}>
                    {streak} day streak
                  </Text>
                </View>
              </View>

              <AnimatedXpBar
                progress={level >= MAX_LEVEL ? 1 : (currentLevelXp > 0 ? xp / currentLevelXp : 0)}
                trackColor={theme.surface}
                fillColor={theme.primary}
                height={10}
                style={{ marginVertical: 12 }}
              />

              <View style={styles.progressStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textTertiary }]}>XP in Level</Text>
                  {level < MAX_LEVEL ? (
                    <Text style={[styles.statValue, { color: theme.text }]}>
                      {xp}/{currentLevelXp}
                    </Text>
                  ) : (
                    <Text style={[styles.statValue, { color: theme.text }]}>MAX</Text>
                  )}
                </View>
                <View style={styles.statItem}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, height: 16, marginBottom: 5 }}>
                    <ThunderBolt size={13} color={theme.primary} />
                    <Text style={[styles.statLabel, { color: theme.textTertiary, marginBottom: 0, lineHeight: 16, includeFontPadding: false }]}>Total XP</Text>
                  </View>
                  <Text style={[styles.statValue, { color: theme.text }]}>{totalXp.toLocaleString()}</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, height: 16, marginBottom: 5 }}>
                    <SpinCoin size={13} color={theme.coin} />
                    <Text style={[styles.statLabel, { color: theme.coin, marginBottom: 0, lineHeight: 16, includeFontPadding: false }]}>Coins</Text>
                  </View>
                  <Text style={[styles.statValue, { color: theme.text }]}>{coins.toLocaleString()}</Text>
                </View>
              </View>

              <Text style={[type.label, { color: theme.textTertiary, textAlign: 'center', marginTop: 12, fontWeight: '600' }]}>
                {level < 2
                  ? `Medium unlocks at level 2 · ${2 - level} level to go`
                  : level < 5
                    ? `Hard unlocks at level 5 · ${5 - level} level${5 - level === 1 ? '' : 's'} to go`
                    : 'All difficulty tiers unlocked'}
              </Text>
            </View>
          </FadeRise>

          {/* Wisdom Card or Monthly Challenge */}
          <FadeRise delay={100}>
            <View style={[styles.wisdomCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.wisdomHeader}>
                <Ionicons
                  name={showMonthlyChallenge ? 'trophy-outline' : 'flash-outline'}
                  size={22}
                  color={theme.primary}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.wisdomTitle, { color: theme.text }]}>{showMonthlyChallenge ? 'Monthly Challenge' : 'Daily Edge'}</Text>
              </View>
              <Animated.Text style={[styles.wisdomText, { opacity: factFade, color: theme.textSecondary }]}>
                {showMonthlyChallenge
                  ? "Complete 30 days of consistent training to unlock exclusive rewards and achievements!"
                  : RANDOM_FACTS[factIdx]
                }
              </Animated.Text>
            </View>
          </FadeRise>

          {/* Quick Actions Grid */}
          <View style={[styles.actionsGrid, isTablet && { justifyContent: 'space-between' }]}>
            {customButtons.map((button, index) => {
              const actionStyles = [
                styles.action1,
                styles.action2,
                styles.action3,
                styles.action4
              ];
              return (
                <FadeRise key={button.id} delay={40 + index * 30} style={{ width: '48%', marginBottom: 12 }}>
                  <TouchableOpacity
                    style={[styles.actionCard, actionStyles[index], { backgroundColor: theme.card, borderColor: theme.border, width: '100%', marginBottom: 0 }]}
                    activeOpacity={0.8}
                    onPress={() => {
                      const route = String(button.route || '');
                      const match = route.match(/initialPage=(\d+)/);
                      if (match) {
                        const page = Number(match[1]);
                        if (page === 4 && goLeaderboard) {
                          goLeaderboard();
                          return;
                        }
                        router.push({ pathname: '/(tabs)', params: { initialPage: String(page) } });
                        return;
                      }
                      router.push(route as any);
                    }}
                  >
                    <Ionicons name={button.icon as any} size={28} color={theme.primary} style={styles.actionIcon} />
                    <Text style={[styles.actionTitle, { color: theme.text }]}>{button.title}</Text>
                    <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>{button.subtitle}</Text>
                  </TouchableOpacity>
                </FadeRise>
              );
            })}
          </View>

          {/* Reward Progress removed by request */}

          <View style={{ flex: 1 }} />
          <Text style={[styles.footer, { color: theme.textTertiary }]}>© 2025 Zencademy</Text>
        </Animated.View>
      </SafeAreaView>

      {/* Help Modal */}
      <Modal
        visible={showHelpModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowHelpModal(false)} />
          <View style={[styles.helpModal, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.helpModalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.helpModalTitle, { color: theme.text }]}>How Zencademy Works</Text>
              <TouchableOpacity
                onPress={() => setShowHelpModal(false)}
                style={[styles.helpModalClose, { backgroundColor: theme.surface }]}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.helpModalContent}
              contentContainerStyle={styles.helpModalContentContainer}
              showsVerticalScrollIndicator={true}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={true}
              bounces={true}
              nestedScrollEnabled={true}
            >
              <View style={styles.helpSection}>
                <View style={[styles.helpIconContainer, { backgroundColor: theme.surface }]}>
                  <Ionicons name="star-outline" size={24} color={theme.primary} />
                </View>
                <Text style={[styles.helpSectionTitle, { color: theme.text }]}>XP unlocks training</Text>
                <Text style={[styles.helpSectionText, { color: theme.textSecondary }]}>
                  Finish sets to earn XP and coins. Medium opens at level 2, hard at level 5. XP is never spent.
                </Text>
              </View>

              <View style={styles.helpSection}>
                <View style={[styles.helpIconContainer, { backgroundColor: theme.surface }]}>
                  <Ionicons name="cash-outline" size={24} color={theme.primary} />
                </View>
                <Text style={[styles.helpSectionTitle, { color: theme.text }]}>Coins</Text>
                <Text style={[styles.helpSectionText, { color: theme.textSecondary }]}>
                  Coins buy store badges and ebooks. They do not unlock training.
                </Text>
              </View>

              <View style={styles.helpSection}>
                <View style={[styles.helpIconContainer, { backgroundColor: theme.surface }]}>
                  <Ionicons name="flame-outline" size={24} color={theme.error} />
                </View>
                <Text style={[styles.helpSectionTitle, { color: theme.text }]}>Daily Streak</Text>
                <Text style={[styles.helpSectionText, { color: theme.textSecondary }]}>
                  Maintain your streak by training every day. Longer streaks unlock bonus rewards!
                </Text>
              </View>

              <View style={styles.helpSection}>
                <View style={[styles.helpIconContainer, { backgroundColor: theme.surface }]}>
                  <Ionicons name="barbell-outline" size={24} color={theme.primary} />
                </View>
                <Text style={[styles.helpSectionTitle, { color: theme.text }]}>Training Hub</Text>
                <Text style={[styles.helpSectionText, { color: theme.textSecondary }]}>
                  Access mental and physical training exercises to improve your cognitive abilities and fitness.
                </Text>
              </View>

              <View style={styles.helpSection}>
                <View style={[styles.helpIconContainer, { backgroundColor: theme.surface }]}>
                  <Ionicons name="trophy-outline" size={24} color={theme.warning} />
                </View>
                <Text style={[styles.helpSectionTitle, { color: theme.text }]}>Leaderboard</Text>
                <Text style={[styles.helpSectionText, { color: theme.textSecondary }]}>
                  Swipe past Journal to see ranks. XP decides position — coins never do.
                </Text>
              </View>

              <View style={styles.helpSection}>
                <View style={[styles.helpIconContainer, { backgroundColor: theme.surface }]}>
                  <Ionicons name="checkmark-done-outline" size={24} color={theme.success} />
                </View>
                <Text style={[styles.helpSectionTitle, { color: theme.text }]}>Daily Execution</Text>
                <Text style={[styles.helpSectionText, { color: theme.textSecondary }]}>
                  Swipe left from Home for today’s targets. Journal is the next swipe. No soft exits.
                </Text>
              </View>

              <View style={[styles.helpTip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
                <Text style={[styles.helpTipText, { color: theme.textSecondary }]}>
                  Tip: Long press the help button (3 seconds) to hide it permanently.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Customization Modal */}
      {showCustomizationModal && (
        <CustomizationModal
          visible={showCustomizationModal}
          onClose={() => setShowCustomizationModal(false)}
          customButtons={customButtons}
          setCustomButtons={setCustomButtons}
          showMonthlyChallenge={showMonthlyChallenge}
          setShowMonthlyChallenge={setShowMonthlyChallenge}
          onSave={saveCustomization}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  headerTopLeft: {
    width: 32,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  helpButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  helpModal: {
    width: "90%",
    maxWidth: 500,
    height: "85%",
    maxHeight: "85%",
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
    flexDirection: "column",
  },
  helpModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    flexShrink: 0,
  },
  helpModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  helpModalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  helpModalContent: {
    flex: 1,
  },
  helpModalContentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  helpSection: {
    marginBottom: 24,
  },
  helpIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  helpSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  helpSectionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  helpTip: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginTop: 8,
  },
  helpTipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#181828',
    letterSpacing: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 2,
  },
  progressCard: {
    width: '100%',
    backgroundColor: '#181828',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#222',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  levelText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  crownIcon: {
    fontSize: 20,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffd700',
    letterSpacing: 1,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#2e2e44',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 6,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#b2b2b2',
    marginBottom: 5,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  wisdomCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#222',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  wisdomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'flex-start',
  },
  wisdomTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181828',
    letterSpacing: 1,
  },
  wisdomText: {
    fontSize: 16,
    color: '#444',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  actionCard: {
    width: '48%',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 15,
    shadowColor: '#222',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  action1: {
    backgroundColor: '#fff',
    borderColor: '#181828',
    borderWidth: 2,
  },
  action2: {
    backgroundColor: '#fff',
    borderColor: '#181828',
    borderWidth: 2,
  },
  action3: {
    backgroundColor: '#fff',
    borderColor: '#181828',
    borderWidth: 2,
  },
  action4: {
    backgroundColor: '#fff',
    borderColor: '#181828',
    borderWidth: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181828',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 5,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  rewardCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#222',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181828',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 15,
  },
  rewardBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  rewardFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 5,
  },
  rewardText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#181828',
  },
  closeButton: {
    padding: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181828',
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#181828',
  },
  toggle: {
    width: 50,
    height: 28,
    backgroundColor: '#e0e0e0',
    borderRadius: 14,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#181828',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  customButton: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  customButtonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#181828',
    marginTop: 8,
    textAlign: 'center',
  },
  customButtonSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  optionsContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#181828',
    marginBottom: 10,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#181828',
    marginTop: 5,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#181828',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Replacement popup styles
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,
    padding: 20,
  },
  popupContainer: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '75%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181828',
  },
});

