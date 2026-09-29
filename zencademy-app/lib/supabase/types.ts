export interface UserData {
  id: string; username: string; points: number; coins: number; plan: string;
  brain_type: string; onboarding_checked: boolean; equipped_badge: string | null;
  daily_streak_count: number; streak_count: number; completed_games: number;
  session_time: number; timezone: string; last_training_day: string | null;
  created_at: string; updated_at: string; badges: string[];
}
export interface TrainingSession {
  id: string; user_id: string; activity_id: string; started_at: string;
  completed_at: string | null; duration_seconds: number; xp: number; coins: number;
  activity_day: string | null; score: number | null;
}
export interface LeaderboardUser {
  id: string; username: string; points: number; level: number; level_points: number;
  streak_count: number; daily_streak_count: number; plan: string; brain_type: string;
  badges: string[]; equipped_badge: string | null; rank: number; created_at?: string;
}
export interface JournalEntry {
  id?: string; user_id: string; date: string; mood: string;
  answers: Record<string, string>; timestamp: number; created_at?: string; updated_at?: string;
}
