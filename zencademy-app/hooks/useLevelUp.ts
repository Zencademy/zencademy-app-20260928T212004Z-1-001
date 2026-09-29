import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';

export interface LevelUpData {
  currentLevel: number;
  previousLevel: number;
  unlockedFeatures: string[];
  upcomingFeatures: string[];
  xpGained: number;
}

// Feature definitions by level (real features from the app)
const FEATURES_BY_LEVEL: { [key: number]: string[] } = {
  1: ['Basic Meditation', 'Simple Breathing Exercises', 'Daily Tasks', 'Progress Tracking'],
  2: ['Advanced Breathing Techniques', 'Focus Training Games', 'Custom Reminders'],
  3: ['Body Scan Meditation', 'Memory Training Games', 'Statistics Dashboard'],
  4: ['Guided Imagery', 'Logic Training Games', 'Achievement System'],
  5: ['Mindful Movement', 'Creativity Training', 'Social Features'],
  6: ['Loving-Kindness Meditation', 'Critical Thinking Games', 'Community Challenges'],
  7: ['Transcendental Techniques', 'Executive Training', 'Personal Coaching'],
  8: ['Advanced Visualization', 'Metacognition Training', 'Advanced Analytics'],
  9: ['Zen Meditation', 'Speed Training', 'Premium Features'],
  10: ['Master Level Access', 'All Training Modules', 'Exclusive Content'],
  11: ['Advanced Intelligence Tests', 'Personalized Coaching', 'Advanced Statistics'],
  12: ['Custom Training Programs', 'Progress Insights', 'Performance Analytics'],
  13: ['Expert-Level Challenges', 'Advanced Meditation', 'Mind Mastery'],
  14: ['Elite Training Modules', 'Advanced Brain Games', 'Peak Performance'],
  15: ['Master Meditation', 'Advanced Logic Games', 'Elite Features'],
  16: ['Ultimate Training', 'Advanced Memory Games', 'Premium Coaching'],
  17: ['Expert Challenges', 'Advanced Focus Training', 'Elite Analytics'],
  18: ['Master Level Games', 'Advanced Creativity', 'Ultimate Features'],
  19: ['Elite Intelligence', 'Advanced Spatial Training', 'Master Coaching'],
  20: ['Legendary Status', 'All Premium Features', 'Ultimate Mastery'],
};

// XP required for each level (aligned with existing system)
const XP_REQUIREMENTS: { [key: number]: number } = {
  1: 0,
  2: 1000,
  3: 1500,
  4: 2000,
  5: 2500,
  6: 3000,
  7: 3500,
  8: 4000,
  9: 4500,
  10: 5000,
  11: 5500,
  12: 6000,
  13: 6500,
  14: 7000,
  15: 7500,
  16: 8000,
  17: 8500,
  18: 9000,
  19: 9500,
  20: 10000,
};

export const useLevelUp = (currentXP: number, currentLevel?: number) => {
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastKnownLevelRef = useRef<number | null>(null);
  const dismissedLevelsRef = useRef<Set<number>>(new Set());

  // Calculate current level based on XP
  const calculateLevel = (xp: number): number => {
    for (let level = 20; level >= 1; level--) {
      if (xp >= XP_REQUIREMENTS[level]) {
        return level;
      }
    }
    return 1;
  };

  // Get features for a specific level
  const getFeaturesForLevel = (level: number): string[] => {
    const features: string[] = [];
    for (let i = 1; i <= level; i++) {
      if (FEATURES_BY_LEVEL[i]) {
        features.push(...FEATURES_BY_LEVEL[i]);
      }
    }
    return features;
  };

  // Get upcoming features for next level
  const getUpcomingFeatures = (currentLevel: number): string[] => {
    const nextLevel = currentLevel + 1;
    return FEATURES_BY_LEVEL[nextLevel] || [];
  };

  // Initialize last known level and dismissed levels from AsyncStorage
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Load last known level
        const storedLevel = await AsyncStorage.getItem('@last_known_level');
        if (storedLevel) {
          lastKnownLevelRef.current = parseInt(storedLevel, 10);
        }

        // Load dismissed levels
        const storedDismissedLevels = await AsyncStorage.getItem('@dismissed_levels');
        if (storedDismissedLevels) {
          const dismissedLevels = JSON.parse(storedDismissedLevels);
          dismissedLevelsRef.current = new Set(dismissedLevels);
        }

        setIsInitialized(true);
      } catch (error) {
        setIsInitialized(true);
      }
    };

    initializeData();
  }, []);

  // Check for level up - only trigger when level actually increases
  useEffect(() => {
    if (!isInitialized) return; // Wait for initialization

    // Use provided currentLevel if available, otherwise calculate from XP
    const actualCurrentLevel = currentLevel || calculateLevel(currentXP);
    
    // If this is the first time we're seeing this level, just store it and don't trigger
    if (lastKnownLevelRef.current === null) {
      lastKnownLevelRef.current = actualCurrentLevel;
      // Store the current level for future reference
      AsyncStorage.setItem('@last_known_level', actualCurrentLevel.toString()).catch(console.error);
      return;
    }
    
    // Only trigger if we have a real level increase and the level hasn't been dismissed
    if (actualCurrentLevel > lastKnownLevelRef.current && !dismissedLevelsRef.current.has(actualCurrentLevel)) {
      const unlockedFeatures = getFeaturesForLevel(actualCurrentLevel);
      const previousFeatures = getFeaturesForLevel(lastKnownLevelRef.current);
      const newlyUnlocked = unlockedFeatures.filter(feature => !previousFeatures.includes(feature));
      
      const upcomingFeatures = getUpcomingFeatures(actualCurrentLevel);
      
      const xpGained = currentXP - XP_REQUIREMENTS[lastKnownLevelRef.current];
      
      setLevelUpData({
        currentLevel: actualCurrentLevel,
        previousLevel: lastKnownLevelRef.current,
        unlockedFeatures: newlyUnlocked,
        upcomingFeatures,
        xpGained,
      });
      
      setShowLevelUpModal(true);
    }
    
    // Update last known level reference and store it
    lastKnownLevelRef.current = actualCurrentLevel;
    AsyncStorage.setItem('@last_known_level', actualCurrentLevel.toString()).catch(console.error);
  }, [currentXP, currentLevel, isInitialized]);

  const closeLevelUpModal = () => {
    setShowLevelUpModal(false);
    setLevelUpData(null);
  };

  const dismissLevelUpModal = async () => {
    if (levelUpData) {
      // Add current level to dismissed levels
      dismissedLevelsRef.current.add(levelUpData.currentLevel);
      
      // Save dismissed levels to AsyncStorage
      try {
        const dismissedLevelsArray = Array.from(dismissedLevelsRef.current);
        await AsyncStorage.setItem('@dismissed_levels', JSON.stringify(dismissedLevelsArray));
      } catch (error) {
        // Error saving dismissed levels
      }
    }
    
    closeLevelUpModal();
  };

  // Get progress to next level
  const getLevelProgress = (xp: number) => {
    const currentLevel = calculateLevel(xp);
    const currentLevelXP = XP_REQUIREMENTS[currentLevel];
    const nextLevelXP = XP_REQUIREMENTS[currentLevel + 1] || currentLevelXP;
    const progress = (xp - currentLevelXP) / (nextLevelXP - currentLevelXP);
    
    return {
      currentLevel,
      currentXP: xp,
      nextLevelXP,
      progress: Math.min(progress, 1),
      xpNeeded: Math.max(0, nextLevelXP - xp),
    };
  };

  return {
    levelUpData,
    showLevelUpModal,
    closeLevelUpModal,
    dismissLevelUpModal,
    getLevelProgress,
    calculateLevel,
  };
};
