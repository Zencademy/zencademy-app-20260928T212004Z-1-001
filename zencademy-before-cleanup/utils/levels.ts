// Centralized level system aligned with website

export const MAX_LEVEL = 100;

// Level XP requirements:
// Level 1: 0-1000 XP (1000 XP needed)
// Level 2: 1001-2500 XP (1500 XP needed)
// Level 3: 2501-5000 XP (2500 XP needed)
// Level 4: 5001-8000 XP (3000 XP needed)
// Level 5: 8001-12000 XP (4000 XP needed)
// And continues with progressive increases

function calculateLevelXP(): number[] {
  const xpRequirements: number[] = [];
  
  // First 5 levels as specified
  xpRequirements.push(1000);  // Level 1: 0-1000 XP
  xpRequirements.push(1500); // Level 2: 1001-2500 XP (total 2500)
  xpRequirements.push(2500); // Level 3: 2501-5000 XP (total 5000)
  xpRequirements.push(3000); // Level 4: 5001-8000 XP (total 8000)
  xpRequirements.push(4000); // Level 5: 8001-12000 XP (total 12000)
  
  // Continue with progressive growth
  // Pattern: increment increases gradually
  let increment = 1000; // Start increment for level 6
  for (let i = 5; i < MAX_LEVEL; i++) {
    // Every 2 levels after level 5, increase the increment by 500
    if (i > 5 && (i - 5) % 2 === 0) {
      increment += 500;
    }
    const nextXP = xpRequirements[i - 1] + increment;
    xpRequirements.push(nextXP);
  }
  
  return xpRequirements;
}

export const LEVEL_UP_XP: number[] = calculateLevelXP();

export function getXpForLevel(level: number): number {
  if (level < 1) return LEVEL_UP_XP[0];
  if (level > MAX_LEVEL) return LEVEL_UP_XP[MAX_LEVEL - 1];
  return LEVEL_UP_XP[level - 1];
}

export function deriveLevelAndLevelXP(totalPoints: number): { level: number; levelXP: number } {
  if (totalPoints <= 0) return { level: 1, levelXP: 0 };
  let cumulative = 0;
  for (let i = 0; i < LEVEL_UP_XP.length; i++) {
    const threshold = LEVEL_UP_XP[i];
    if (totalPoints < cumulative + threshold) {
      return { level: i + 1, levelXP: totalPoints - cumulative };
    }
    cumulative += threshold;
  }
  return { level: MAX_LEVEL, levelXP: LEVEL_UP_XP[MAX_LEVEL - 1] };
}


