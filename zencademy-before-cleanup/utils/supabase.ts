import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { deriveLevelAndLevelXP, MAX_LEVEL, LEVEL_UP_XP } from './levels';

// Supabase configuration
const supabaseUrl = 'https://hxgomcsqkwdobhdvvpek.supabase.co';
const supabaseAnonKey = 'sb_publishable_ofd42jFy0CZNeakPA4hEhA_NYlc9zyy';

// Create Supabase client with AsyncStorage for persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// User data interface - matches profiles table structure
export interface UserData {
  id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  // Total points (shared with website)
  points: number;
  // Per-level points from website schema
  level_points?: number;
  streak_count: number;
  daily_streak_count: number;
  last_training_at?: string;
  last_login_at?: string;
  plan: string;
  subscription_id?: string;
  created_at: string;
  updated_at: string;
  // Additional fields that might be added later
  brain_type?: string;
  onboarding_checked?: boolean;
  equipped_badge?: string;
  badges?: string[];
  session_time?: number;
  completed_games?: number;
  ebooks?: any;
}

// Leaderboard user interface
export interface LeaderboardUser {
  id: string;
  username: string;
  // Total accumulated points
  points: number;
  // Optional per-level points
  level_points?: number;
  level: number;
  streak_count: number;
  daily_streak_count: number;
  plan: string;
  brain_type?: string | null;
  badges?: string[];
  equipped_badge?: string | null;
  rank: number;
  created_at?: string;
}

// User data service
export class UserDataService {
  async getUserData(userId: string): Promise<UserData | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  async saveUserData(userData: Partial<UserData>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert(userData);

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async updateUserData(userId: string, updates: Partial<UserData>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Supabase updateUserData error:', error);
        console.error('Update payload:', updates);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Supabase updateUserData exception:', error);
      return false;
    }
  }

  async subscribeToUserData(userId: string, callback: (data: UserData | null) => void) {
    return supabase
      .channel('profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as UserData);
        }
      )
      .subscribe();
  }

  unsubscribeFromUserData(subscription: any) {
    if (subscription && subscription.unsubscribe) {
      subscription.unsubscribe();
    }
  }

  async initializeUserData(userId: string, email: string, name: string): Promise<UserData> {
    const minimalData: Partial<UserData> = {
      id: userId,
      username: name,
      email,
      points: 0,
      level_points: 0,
      streak_count: 0,
      daily_streak_count: 0,
      last_training_at: new Date().toISOString(),
      plan: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await this.saveUserData(minimalData);
    return minimalData as UserData;
  }

  async resetUserDataToMinimal(userId: string): Promise<boolean> {
    const minimalData: Partial<UserData> = {
      points: 0,
      streak_count: 0,
      daily_streak_count: 0,
      last_training_at: new Date().toISOString(),
      plan: 'free',
      updated_at: new Date().toISOString(),
    };

    return await this.updateUserData(userId, minimalData);
  }

  async isNewUser(userId: string): Promise<boolean> {
    const userData = await this.getUserData(userId);
    return userData === null;
  }

  async forceResetUserData(userId: string): Promise<boolean> {
    try {
      // Delete existing user data
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (deleteError) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async addXP(userId: string, xpToAdd: number): Promise<boolean> {
    try {
      const userData = await this.getUserData(userId);
      if (!userData) {
        // Initialize minimal row then retry
        await this.initializeUserData(userId, '', 'Guest');
      }

      const basePoints = userData?.points ?? 0;
      const newPoints = basePoints + xpToAdd; // total

      // Recompute per-level points from total using centralized thresholds
      const { levelXP: newLevelPoints } = deriveLevelAndLevelXP(newPoints);

      const { data, error } = await supabase
        .from('profiles')
        .update({
          points: newPoints,
          level_points: newLevelPoints,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select('id, points, level_points')
        .single();

      if (error) {
        console.error('addXP update error:', error);
        return false;
      }

      if (!data) {
        console.warn('addXP: update returned no data for user', userId);
        return false;
      }

      return true;
    } catch (error) {
      console.error('addXP exception:', error);
      return false;
    }
  }

  async unlockBadge(userId: string, badgeId: string): Promise<boolean> {
    try {
      const userData = await this.getUserData(userId);
      if (!userData) return false;

      const updatedBadges = [...(userData.badges || [])];
      if (!updatedBadges.includes(badgeId)) {
        updatedBadges.push(badgeId);
      }

      return await this.updateUserData(userId, {
        badges: updatedBadges,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      return false;
    }
  }

  async purchaseShopItem(userId: string, itemId: string, cost: number): Promise<boolean> {
    try {
      const userData = await this.getUserData(userId);
      if (!userData) return false;
      
      // If cost > 0, verify user has enough points
      if (cost > 0 && userData.points < cost) return false;

      const updates: Partial<UserData> = {
        updated_at: new Date().toISOString(),
      };

      // If cost > 0, deduct points
      if (cost > 0) {
        const newPoints = userData.points - cost;
        const { levelXP: newLevelPoints } = deriveLevelAndLevelXP(newPoints);
        updates.points = newPoints;
        updates.level_points = newLevelPoints;
      }

      // Note: Badge unlocking is handled separately by unlockBadge
      // This function is kept for future shop items that aren't badges
      
      return await this.updateUserData(userId, updates);
    } catch (error) {
      console.error('Error purchasing shop item:', error);
      return false;
    }
  }

  async updateStreak(userId: string, streakCount: number, dailyStreakCount: number): Promise<boolean> {
    return await this.updateUserData(userId, {
      streak_count: streakCount,
      daily_streak_count: dailyStreakCount,
      last_training_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  async addSessionTime(userId: string, sessionTime: number): Promise<boolean> {
    try {
      const userData = await this.getUserData(userId);
      if (!userData) return false;

      const newSessionTime = (userData.session_time || 0) + sessionTime;
      return await this.updateUserData(userId, {
        session_time: newSessionTime,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      return false;
    }
  }

  async incrementCompletedGame(userId: string): Promise<boolean> {
    try {
      const userData = await this.getUserData(userId);
      if (!userData) return false;

      const newCompletedGames = (userData.completed_games || 0) + 1;
      return await this.updateUserData(userId, {
        completed_games: newCompletedGames,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      return false;
    }
  }

  async getLeaderboard(limit: number = 50): Promise<{ users: LeaderboardUser[], totalCount: number }> {
    try {
      // Get total count first
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get top users - use total points for ranking, include brain_type and badges
      // Note: brain_type and badges might not exist in all databases, so we select all columns
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Leaderboard error:', error);
        return { users: [], totalCount: 0 };
      }

      const users = data.map((user, index) => ({
        id: user.id,
        username: user.username || 'Anonymous',
        points: user.points || 0,
        level_points: (user as any).level_points || 0,
        level: Math.floor((user.points || 0) / 200) + 1, // level from total points
        streak_count: user.streak_count || 0,
        daily_streak_count: user.daily_streak_count || 0,
        plan: user.plan || 'free',
        brain_type: (user as any).brain_type || null,
        badges: (user as any).badges || [],
        equipped_badge: (user as any).equipped_badge || null,
        rank: index + 1,
        created_at: user.created_at,
      }));

      return { users, totalCount: count || 0 };
    } catch (error) {
      console.error('Leaderboard error:', error);
      return { users: [], totalCount: 0 };
    }
  }

  async getUserRank(userId: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('points', data.points);

      return (count || 0) + 1;
    } catch (error) {
      return null;
    }
  }
}

// Create user data service instance
export const userDataService = new UserDataService();

// Journal Entry interface
export interface JournalEntry {
  id?: string;
  user_id: string;
  date: string; // YYYY-MM-DD format
  mood: string;
  answers: Record<string, string>; // JSON object with question keys and answers
  timestamp: number;
  created_at?: string;
  updated_at?: string;
}

// Journal service methods
export class JournalService {
  // Save or update a journal entry for a specific date
  async saveJournalEntry(userId: string, entry: Omit<JournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      // First check if entry exists
      const existing = await this.getJournalEntry(userId, entry.date);
      
      if (existing) {
        // Update existing entry
        const { error } = await supabase
          .from('journal_entries')
          .update({
            mood: entry.mood,
            answers: entry.answers,
            timestamp: entry.timestamp,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('date', entry.date);

        if (error) {
          console.error('Error updating journal entry:', error);
          return false;
        }
      } else {
        // Insert new entry
        const { error } = await supabase
          .from('journal_entries')
          .insert({
            user_id: userId,
            date: entry.date,
            mood: entry.mood,
            answers: entry.answers,
            timestamp: entry.timestamp,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error inserting journal entry:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error saving journal entry:', error);
      return false;
    }
  }

  // Get journal entry for a specific date
  async getJournalEntry(userId: string, date: string): Promise<JournalEntry | null> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No entry found - return null
          return null;
        }
        console.error('Error getting journal entry:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting journal entry:', error);
      return null;
    }
  }

  // Get all journal entries for a user (optional date range)
  async getJournalEntries(userId: string, startDate?: string, endDate?: string): Promise<JournalEntry[]> {
    try {
      let query = supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting journal entries:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting journal entries:', error);
      return [];
    }
  }

  // Delete a journal entry
  async deleteJournalEntry(userId: string, date: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('user_id', userId)
        .eq('date', date);

      if (error) {
        console.error('Error deleting journal entry:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      return false;
    }
  }
}

export const journalService = new JournalService();

// Test Supabase connection
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

