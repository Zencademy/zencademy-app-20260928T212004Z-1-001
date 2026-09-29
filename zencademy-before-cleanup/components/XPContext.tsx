import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useLevelUp } from "../hooks/useLevelUp";
import { testSupabaseConnection, UserData, userDataService } from "../utils/supabase";
import { deriveLevelAndLevelXP, LEVEL_UP_XP, MAX_LEVEL } from "../utils/levels";
import { useAuth } from "./AuthContext";
import LevelUpModal from "./LevelUpModal";

const DEFAULT_NAME = "Guest";
const DEFAULT_BRAIN_TYPE = "Logic Guru";

// Minimal values for new accounts
const MINIMAL_LEVEL = 1;
const MINIMAL_XP = 0;
const MINIMAL_STREAK = 0;
const MINIMAL_COMPLETED = 0;

// Clean up old AsyncStorage data
const cleanupAsyncStorage = async () => {
  try {
    await AsyncStorage.removeItem("@xp_context");
    await AsyncStorage.removeItem("@equipped_badge");
    console.log("AsyncStorage cleaned up successfully");
  } catch (error) {
    console.error("Error cleaning up AsyncStorage:", error);
  }
};

const XPContext = createContext({
  name: DEFAULT_NAME,
  setName: (v: string) => {},
  brainType: DEFAULT_BRAIN_TYPE,
  setBrainType: (v: string) => {},
  level: 1,
  setLevel: (v: number) => {},
  xp: 0,
  setXP: (v: number) => {},
  // Total points from Supabase/website
  totalPoints: 0,
  plan: 'free' as any,
  addXP: (points: number) => {},
  addXp: (points: number) => {},
  setXPManual: (points: number) => {},
  levelUp: () => {},
  setLevelManual: (lvl: number) => {},
  streak: 0,
  setStreak: (v: number) => {},
  addStreak: () => {},
  resetStreak: () => {},
  updateDailyLoginStreak: () => {},
  onboardingChecked: false,
  setOnboardingChecked: (v: boolean) => {},
  resetAll: () => {},
  loading: true,
  unlockedBadges: [] as string[],
  unlockBadge: (badgeId: string) => {},
  xpHistory: [] as any[],
  timeHistory: [] as any[],
  addSessionTime: (hours: number) => {},
  completed: 0,
  completedStats: {} as any,
  incrementCompletedGame: ({ category, difficulty }: { category: string, difficulty: string }) => {},
  equippedBadge: null as string | null,
  setEquippedBadge: (badgeId: string | null) => {},
  shopItems: [] as any[],
  purchaseShopItem: (itemId: string, cost?: number) => {},
});

export function XPProvider({ children }: { children: React.ReactNode }) {
  const { user, isNewUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [streakCheckedToday, setStreakCheckedToday] = useState(false);
  
  const totalPointsLocal = userData?.points || 0;
  const derived = deriveLevelAndLevelXP(totalPointsLocal);
  // Always derive level points from authoritative total points for display
  const currentXP = derived.levelXP;
  const currentLevel = derived.level;

  const reconcileLevelPointsFromTotal = async (userId: string, total: number, currentLP?: number) => {
    try {
      const remainder = deriveLevelAndLevelXP(total).levelXP;
      if (currentLP !== remainder) {
        await userDataService.updateUserData(userId, { level_points: remainder });
        setUserData((prev) => prev ? ({ ...(prev as any), level_points: remainder }) : prev);
      }
    } catch {}
  };
  const { levelUpData, showLevelUpModal, closeLevelUpModal, dismissLevelUpModal, getLevelProgress } = useLevelUp(currentXP, currentLevel);

  // Initialize user data when user logs in
  useEffect(() => {
    if (!user) {
      setUserData(null);
      setLoading(false);
      return;
    }

    const userId = user.id;
    console.log("XPContext: Initializing data for user:", userId);
    
    // Initialize user data and clean up old AsyncStorage data
    const initializeData = async () => {
      try {
        // Test Supabase connection first
        console.log("Testing Supabase connection...");
        const connectionTest = await testSupabaseConnection();
        if (!connectionTest) {
          console.error("Supabase connection test failed!");
          // Continue anyway since we might have stored data
          console.log("Continuing with data initialization despite connection test failure");
        } else {
          console.log("Supabase connection test successful, proceeding with data initialization");
        }
        
        // Try to get existing data from Supabase
        console.log("Attempting to load existing user data from Supabase...");
        let existingData = await userDataService.getUserData(userId);
        if (existingData) {
          console.log("Successfully loaded existing user data from Supabase:", existingData);
          setUserData(existingData);
          setLoading(false);
          return; // Exit early since we have data
        }
        
        // Clean up old AsyncStorage data first
        await cleanupAsyncStorage();
        
        // Try again after cleanup
        existingData = await userDataService.getUserData(userId);
        if (!existingData) {
          console.log("No existing data found, initializing new user data in Supabase for:", userId);
          try {
            await userDataService.initializeUserData(userId, user.email || '', user.email?.split('@')[0] || 'Guest');
          } catch (error) {
            console.error("Error initializing user data:", error);
            // Continue anyway to prevent app from crashing
          }
        } else {
          console.log("Found existing user data in Supabase for:", userId);
          if (isNewUser) {
            console.log("New user registration - keeping minimal data");
            // For new users, keep the minimal data that was just initialized
          } else {
            console.log("Existing user login - loading saved progress");
            // For existing users logging in, keep their progress
          }
        }
      } catch (error) {
        console.error('Error initializing user data:', error);
      }
    };

    initializeData();

    // Subscribe to real-time updates
    const subscription = userDataService.subscribeToUserData(userId, (data) => {
      console.log("Received user data from Supabase:", data);
      if (data) {
        console.log("Successfully loaded user data from Supabase:", data);
        // Reconcile level_points with derived remainder to avoid drift
        const desiredLP = deriveLevelAndLevelXP(data.points || 0).levelXP;
        
        // Merge with current state to preserve optimistic updates
        setUserData((prev) => {
          if (!prev) return data;
          
          // If we have a more recent optimistic update, merge intelligently
          const prevUpdated = prev.updated_at ? new Date(prev.updated_at).getTime() : 0;
          const newUpdated = data.updated_at ? new Date(data.updated_at).getTime() : 0;
          const timeSincePrevUpdate = Date.now() - prevUpdated;
          
          // Always preserve equipped_badge from local state if it exists and is different from incoming data
          // This prevents real-time subscription from overwriting our recent equip action
          // Only use incoming data if local state doesn't have equipped_badge or it's been more than 10 seconds
          const localHasEquippedBadge = prev.equipped_badge !== undefined && prev.equipped_badge !== null;
          const incomingHasEquippedBadge = data.equipped_badge !== undefined && data.equipped_badge !== null;
          const equippedBadgesDiffer = prev.equipped_badge !== data.equipped_badge;
          
          // Preserve local equipped_badge if:
          // 1. We have one locally and it's different from incoming (our recent change)
          // 2. OR local state was updated recently (within 10 seconds)
          const shouldPreserveEquippedBadge = localHasEquippedBadge && 
            (equippedBadgesDiffer || timeSincePrevUpdate < 10000);
          
          // Preserve brain_type from local state if it's more recent
          const shouldPreserveBrainType = prev.brain_type && 
            (prev.brain_type !== data.brain_type || timeSincePrevUpdate < 10000);
          
          const finalEquippedBadge = shouldPreserveEquippedBadge ? prev.equipped_badge : data.equipped_badge;
          
          if (shouldPreserveEquippedBadge || shouldPreserveBrainType) {
            console.log('Preserving optimistic updates:', {
              equipped_badge: { local: prev.equipped_badge, incoming: data.equipped_badge, final: finalEquippedBadge },
              brain_type: shouldPreserveBrainType ? prev.brain_type : data.brain_type,
              timeSincePrevUpdate,
              equippedBadgesDiffer
            });
            return {
              ...data,
              equipped_badge: finalEquippedBadge,
              brain_type: shouldPreserveBrainType ? prev.brain_type : data.brain_type,
              level_points: desiredLP,
              updated_at: shouldPreserveEquippedBadge ? prev.updated_at : data.updated_at,
            } as UserData;
          }
          
          return { ...data, level_points: desiredLP } as UserData;
        });
        
        if ((data as any).level_points !== desiredLP) {
          userDataService.updateUserData(userId, { level_points: desiredLP }).catch(() => {});
        }
        setLoading(false);
        // Trigger auto streak check when user data arrives
        maybeIncrementStreakForNewDay(data).catch((e) => console.warn('Streak auto-check failed:', e));
      } else {
        console.log("No data received from Supabase, trying direct fetch...");
        // Try to get data directly from Supabase
        userDataService.getUserData(userId).then((directData) => {
          if (directData) {
            console.log("Successfully loaded user data directly from Supabase:", directData);
            setUserData(directData);
            setLoading(false);
          } else {
            console.log("No data from Supabase, using minimal data");
            const minimalData = {
              id: userId,
              username: user.email?.split('@')[0] || "Guest",
              email: user.email || '',
              points: 0,
              streak_count: 0,
              daily_streak_count: 0,
              last_training_at: new Date().toISOString(),
              plan: "free",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              brain_type: "balanced",
              onboarding_checked: false,
              badges: [],
              completed_games: 0,
              equipped_badge: undefined
            } as UserData;
            setUserData(minimalData);
            setLoading(false);
          }
        }).catch((error) => {
          console.error("Error getting user data directly:", error);
          const minimalData = {
            id: userId,
            username: user.email?.split('@')[0] || "Guest",
            email: user.email || '',
            points: 0,
            streak_count: 0,
            daily_streak_count: 0,
            last_training_at: new Date().toISOString(),
            plan: "free",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            brain_type: "balanced",
            onboarding_checked: false,
            badges: [],
            completed_games: 0,
            equipped_badge: undefined
          } as UserData;
          setUserData(minimalData);
          setLoading(false);
        });
      }
    });

    return () => {
      userDataService.unsubscribeFromUserData(subscription);
    };
  }, [user]);

  // Helper: increment streak if calendar day changed
  const maybeIncrementStreakForNewDay = async (data: UserData) => {
    if (!user) return;
    try {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      if (streakCheckedToday) return; // prevent duplicate during one session

      const last = data.last_training_at || null;
      if (last === today) {
        setStreakCheckedToday(true);
        return; // already counted today
      }

      // Compute difference in days between last and today
      const diffDays = last ? Math.floor((Date.parse(today) - Date.parse(last)) / (1000 * 60 * 60 * 24)) : 1;
      if (diffDays >= 1) {
        const newStreak = (diffDays === 1 ? (data.daily_streak_count || 0) + 1 : 1); // reset if gap > 1
        // Use updateStreak to keep both streak_count and daily_streak_count in sync
        await userDataService.updateStreak(user.id, newStreak, newStreak);
        // Also update last_training_at
        await userDataService.updateUserData(user.id, {
          last_training_at: today,
        });
        // Optimistically update local state
        setUserData((prev) => {
          if (!prev) return prev;
          return { ...prev, streak_count: newStreak, daily_streak_count: newStreak, last_training_at: today } as UserData;
        });
        // Re-fetch from Supabase to ensure consistency
        try {
          const fresh = await userDataService.getUserData(user.id);
          if (fresh) {
            setUserData(fresh);
          }
        } catch {}
        setStreakCheckedToday(true);
      }
    } catch (e) {
      console.error('Error in maybeIncrementStreakForNewDay:', e);
    }
  };

  // Helper function to get current user ID
  const getUserId = () => {
    if (!user) throw new Error('User not authenticated');
    return user.id;
  };

  // XP Management
  const addXP = async (points: number) => {
    if (!user) return;
    try {
      const uid = getUserId();
      const ok = await userDataService.addXP(uid, points);
      // Optimistic local update so UI reflects immediately even if RT event is delayed
      if (ok) {
        setUserData((prev) => {
          const prevPoints = prev?.points || 0;
          const prevLevelPoints = (prev as any)?.level_points || 0;
          const nextPoints = prevPoints + points;
          const nextLevelPoints = deriveLevelAndLevelXP(nextPoints).levelXP;
          return prev ? { ...prev, points: nextPoints, level_points: nextLevelPoints } as any : prev;
        });
        // Immediately re-fetch authoritative data from Supabase to eliminate any drift
        try {
          const fresh = await userDataService.getUserData(uid);
          if (fresh) {
            setUserData(fresh);
          } else {
            // Ensure DB remainder is consistent too
            await reconcileLevelPointsFromTotal(uid, (userData?.points || 0) + points, undefined);
          }
        } catch {}
      }
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  };

  const addXp = addXP; // Alias for compatibility

  const setXPManual = async (points: number) => {
    if (!user) return;
    try {
      await userDataService.updateUserData(getUserId(), { 
        // total points manual set
        points: points
      });
    } catch (error) {
      console.error('Error setting XP:', error);
    }
  };

  const setLevelManual = async (lvl: number) => {
    if (!user) return;
    try {
      // Reset per-level points when level is set manually
      await userDataService.updateUserData(getUserId(), { level_points: 0 });
    } catch (error) {
      console.error('Error setting level:', error);
    }
  };

  const levelUp = async () => {
    if (!user || !userData) return;
    const currentLevel = Math.floor((userData.points || 0) / 200) + 1;
    if (currentLevel < MAX_LEVEL) {
      try {
        // Reset points to 0 when leveling up
        await userDataService.updateUserData(getUserId(), {
          points: 0
        });
      } catch (error) {
        console.error('Error leveling up:', error);
      }
    }
  };

  // Streak Management
  const addStreak = async () => {
    if (!user || !userData) return;
    try {
      const newStreak = (userData.daily_streak_count || 0) + 1;
      await userDataService.updateStreak(getUserId(), newStreak, newStreak);
      // Optimistically update local state
      setUserData((prev) => {
        if (!prev) return prev;
        return { ...prev, streak_count: newStreak, daily_streak_count: newStreak } as UserData;
      });
      // Re-fetch from Supabase to ensure consistency
      try {
        const fresh = await userDataService.getUserData(getUserId());
        if (fresh) {
          setUserData(fresh);
        }
      } catch {}
    } catch (error) {
      console.error('Error adding streak:', error);
    }
  };

  const resetStreak = async () => {
    if (!user) return;
    try {
      await userDataService.updateStreak(getUserId(), 0, 0);
      // Optimistically update local state
      setUserData((prev) => {
        if (!prev) return prev;
        return { ...prev, streak_count: 0, daily_streak_count: 0 } as UserData;
      });
      // Re-fetch from Supabase to ensure consistency
      try {
        const fresh = await userDataService.getUserData(getUserId());
        if (fresh) {
          setUserData(fresh);
        }
      } catch {}
    } catch (error) {
      console.error('Error resetting streak:', error);
    }
  };

  // Daily Login Streak Management
  const updateDailyLoginStreak = async () => {
    if (!user || !userData) return;
    try {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const lastLogin = userData.last_training_at ? new Date(userData.last_training_at).toISOString().slice(0, 10) : null;
      
      // If already logged in today, don't update
      if (lastLogin === today) {
        return;
      }

      // Calculate days difference
      const diffDays = lastLogin ? Math.floor((Date.parse(today) - Date.parse(lastLogin)) / (1000 * 60 * 60 * 24)) : 1;
      
      let newStreak;
      if (diffDays === 1) {
        // Consecutive day - increment streak
        newStreak = (userData.daily_streak_count || 0) + 1;
      } else if (diffDays > 1) {
        // Gap in days - reset streak
        newStreak = 1;
      } else {
        // Same day - no change
        return;
      }

      // Update both streak_count and daily_streak_count to keep them in sync
      await userDataService.updateStreak(getUserId(), newStreak, newStreak);
      
      // Optimistically update local state
      setUserData((prev) => {
        if (!prev) return prev;
        return { ...prev, streak_count: newStreak, daily_streak_count: newStreak, last_training_at: new Date().toISOString() } as UserData;
      });
      
      // Re-fetch from Supabase to ensure consistency
      try {
        const fresh = await userDataService.getUserData(getUserId());
        if (fresh) {
          setUserData(fresh);
        }
      } catch {}

      console.log(`Daily login streak updated: ${newStreak} days`);
    } catch (error) {
      console.error('Error updating daily login streak:', error);
    }
  };

  // Badge Management
  const unlockBadge = async (badgeId: string) => {
    if (!user) return;
    try {
      const success = await userDataService.unlockBadge(getUserId(), badgeId);
      if (success) {
        // Optimistically update local state
        const updatedBadges = [...(userData?.badges || [])];
        if (!updatedBadges.includes(badgeId)) {
          updatedBadges.push(badgeId);
        }
        setUserData({ ...userData, badges: updatedBadges } as UserData);
        // Re-fetch from Supabase to ensure consistency
        const refreshedData = await userDataService.getUserData(getUserId());
        if (refreshedData) {
          setUserData(refreshedData);
        }
      }
    } catch (error) {
      console.error('Error unlocking badge:', error);
    }
  };

  // Session Time Management
  const addSessionTime = async (hours: number) => {
    if (!user) return;
    try {
      await userDataService.addSessionTime(getUserId(), hours);
    } catch (error) {
      console.error('Error adding session time:', error);
    }
  };

  // Completed Games Management
  const incrementCompletedGame = async ({ category, difficulty }: { category: string, difficulty: string }) => {
    if (!user) return;
    try {
      await userDataService.incrementCompletedGame(getUserId());
    } catch (error) {
      console.error('Error incrementing completed game:', error);
    }
  };

  // Shop Item Management
  const purchaseShopItem = async (itemId: string, cost: number = 0) => {
    if (!user) return;
    try {
      const success = await userDataService.purchaseShopItem(getUserId(), itemId, cost);
      if (success && cost > 0) {
        // Re-fetch user data to ensure points are updated
        const refreshedData = await userDataService.getUserData(getUserId());
        if (refreshedData) {
          setUserData(refreshedData);
        }
      }
    } catch (error) {
      console.error('Error purchasing shop item:', error);
    }
  };

  // Profile Management
  const setName = async (name: string) => {
    if (!user) return;
    try {
      await userDataService.updateUserData(getUserId(), { username: name });
    } catch (error) {
      console.error('Error setting name:', error);
    }
  };

  const setBrainType = async (brainType: string) => {
    if (!user) return;
    try {
      await userDataService.updateUserData(getUserId(), { brain_type: brainType });
      // Optimistically update local state
      setUserData((prev) => {
        if (!prev) return prev;
        return { ...prev, brain_type: brainType } as UserData;
      });
      // Re-fetch from Supabase to ensure consistency
      try {
        const fresh = await userDataService.getUserData(getUserId());
        if (fresh) {
          setUserData(fresh);
        }
      } catch {}
    } catch (error) {
      console.error('Error setting brain type:', error);
    }
  };

  const setStreak = async (streak: number) => {
    if (!user) return;
    try {
      // Update both streak_count and daily_streak_count to keep them in sync
      await userDataService.updateStreak(getUserId(), streak, streak);
      // Optimistically update local state
      setUserData((prev) => {
        if (!prev) return prev;
        return { ...prev, streak_count: streak, daily_streak_count: streak } as UserData;
      });
      // Re-fetch from Supabase to ensure consistency
      try {
        const fresh = await userDataService.getUserData(getUserId());
        if (fresh) {
          setUserData(fresh);
        }
      } catch {}
    } catch (error) {
      console.error('Error setting streak:', error);
    }
  };

  const setOnboardingChecked = async (checked: boolean) => {
    if (!user) return;
    try {
      await userDataService.updateUserData(getUserId(), { onboarding_checked: checked });
      // Optimistically update local state
      setUserData((prev) => {
        if (!prev) return prev;
        return { ...prev, onboarding_checked: checked } as UserData;
      });
      // Re-fetch from Supabase to ensure consistency
      try {
        const fresh = await userDataService.getUserData(getUserId());
        if (fresh) {
          setUserData(fresh);
        }
      } catch {}
    } catch (error) {
      console.error('Error setting onboarding checked:', error);
    }
  };

  const setEquippedBadge = async (badgeId: string | null) => {
    if (!user) {
      console.log('No user, cannot equip badge');
      return;
    }
    const previousData = userData;
    try {
      console.log('Setting equipped badge:', badgeId, 'for user:', user.id);
      // Optimistically update local state first for immediate UI feedback
      setUserData((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, equipped_badge: badgeId || undefined, updated_at: new Date().toISOString() } as UserData;
        console.log('Optimistic update - equipped_badge set to:', updated.equipped_badge);
        return updated;
      });
      
      // Save to Supabase
      const success = await userDataService.updateUserData(getUserId(), { equipped_badge: badgeId || undefined });
      console.log('Supabase update result:', success);
      
      // Note: Don't re-fetch immediately - let the real-time subscription handle the update
      // The subscription will merge intelligently with our optimistic update
      
    } catch (error) {
      console.error('Error setting equipped badge:', error);
      // Revert optimistic update on error
      if (previousData) {
        setUserData(previousData);
      }
    }
  };

  const setXP = async (xp: number) => {
    if (!user) return;
    try {
      // Interpret as setting per-level progress
      await userDataService.updateUserData(getUserId(), { level_points: xp });
    } catch (error) {
      console.error('Error setting XP:', error);
    }
  };

  const setLevel = async (level: number) => {
    if (!user) return;
    try {
      // When setting level, reset per-level points; total points come from website
      await userDataService.updateUserData(getUserId(), { level_points: 0 });
    } catch (error) {
      console.error('Error setting level:', error);
    }
  };

  // Reset all data to minimal values
  const resetAll = async () => {
    if (!user) return;
    try {
      await userDataService.resetUserDataToMinimal(getUserId());
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  // Get current values from userData or minimal defaults for new accounts
  const currentData = userData || {
    id: user?.id || '',
    username: user?.email?.split('@')[0] || DEFAULT_NAME,
    email: user?.email || '',
    points: MINIMAL_XP,
    streak_count: MINIMAL_STREAK,
    daily_streak_count: MINIMAL_STREAK,
    last_training_at: new Date().toISOString(),
    plan: "free",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return (
    <XPContext.Provider value={{
      name: currentData.username || DEFAULT_NAME,
      setName,
      brainType: (currentData as any).brain_type || DEFAULT_BRAIN_TYPE,
      setBrainType,
      level: deriveLevelAndLevelXP(currentData.points || 0).level,
      setLevel,
      xp: deriveLevelAndLevelXP(currentData.points || 0).levelXP || MINIMAL_XP,
      setXP,
      totalPoints: currentData.points || 0,
      plan: (currentData as any).plan || 'free',
      addXP,
      addXp,
      setXPManual,
      setLevelManual,
      levelUp,
      streak: currentData.daily_streak_count || MINIMAL_STREAK,
      setStreak,
      addStreak,
      resetStreak,
      updateDailyLoginStreak,
      onboardingChecked: (currentData as any).onboarding_checked || false,
      setOnboardingChecked,
      resetAll,
      loading,
      unlockedBadges: (currentData as any).badges || [],
      unlockBadge,
      xpHistory: [],
      timeHistory: [],
      addSessionTime,
      completed: (currentData as any).completed_games || MINIMAL_COMPLETED,
      completedStats: {},
      incrementCompletedGame,
      equippedBadge: (currentData as any).equipped_badge || null,
      setEquippedBadge,
      shopItems: [],
      purchaseShopItem,
    }}>
      {children}
      
      {/* Level Up Modal */}
      {levelUpData && (
        <LevelUpModal
          visible={showLevelUpModal}
          onClose={closeLevelUpModal}
          onDismiss={dismissLevelUpModal}
          currentLevel={levelUpData.currentLevel}
          previousLevel={levelUpData.previousLevel}
          unlockedFeatures={levelUpData.unlockedFeatures}
          upcomingFeatures={levelUpData.upcomingFeatures}
          xpGained={levelUpData.xpGained}
        />
      )}
    </XPContext.Provider>
  );
}

export function useXP() {
  const context = useContext(XPContext);
  if (context === undefined) {
    throw new Error('useXP must be used within an XPProvider');
  }
  return context;
}