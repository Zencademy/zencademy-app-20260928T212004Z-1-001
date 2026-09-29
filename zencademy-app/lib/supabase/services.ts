import { supabase, requireBackend } from './client';
import { deriveLevelAndLevelXP } from '../../utils/levels';
import type { UserData, JournalEntry, TrainingSession, LeaderboardUser } from './types';
export const userDataService = {
  async getUserData(userId: string): Promise<UserData> {
    requireBackend();
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    const badges = await supabase.from('user_badges').select('badge_id').eq('user_id', userId);
    if (badges.error) throw badges.error;
    return { ...data, badges: badges.data.map(b => b.badge_id) } as UserData;
  },
  async updateUserData(userId: string, updates: Partial<Pick<UserData, 'username' | 'brain_type' | 'onboarding_checked'>>) {
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) throw error;
    return true;
  },
  subscribeToUserData(userId: string, callback: () => void) {
    return supabase.channel(`profile:${userId}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` }, callback).subscribe();
  },
  async equipBadge(badgeId: string | null) {
    const { error } = await supabase.rpc('equip_badge', { p_badge_id: badgeId });
    if (error) throw error;
  },
  async purchaseShopItem(_userId: string, itemId: string) {
    const { error } = await supabase.rpc('purchase_badge', { p_item_id: itemId });
    if (error) throw error;
    return true;
  },
  async getLeaderboard(limit = 50): Promise<{ users: LeaderboardUser[]; totalCount: number }> {
    const { data, error } = await supabase.rpc('get_leaderboard', { p_limit: limit });
    if (error) throw error;
    const users: LeaderboardUser[] = (data || []).map((row: LeaderboardUser) => ({ ...row, level: deriveLevelAndLevelXP(row.points).level, level_points: deriveLevelAndLevelXP(row.points).levelXP, plan: 'free', badges: [] }));
    return { users, totalCount: Number(data?.[0]?.total_count || 0) };
  },
  async getUserRank(_userId: string): Promise<number | null> {
    const { data, error } = await supabase.rpc('my_rank');
    if (error) throw error;
    return data;
  },
};
export const trainingService = {
  async start(id: string, activity: string) {
    const { error } = await supabase.rpc('start_activity', { p_session_id: id, p_activity_id: activity });
    if (error) throw error;
  },
  async complete(id: string, score: number | null = null): Promise<TrainingSession> {
    const { data, error } = await supabase.rpc('complete_activity', { p_session_id: id, p_score: score });
    if (error) throw error;
    return data as TrainingSession;
  },
  async list(userId: string): Promise<TrainingSession[]> {
    const { data, error } = await supabase.from('training_sessions').select('*').eq('user_id', userId).not('completed_at', 'is', null).order('completed_at', { ascending: false }).limit(1000);
    if (error) throw error;
    return data || [];
  },
};
export const journalService = {
  async saveJournalEntry(userId: string, entry: Omit<JournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { error } = await supabase.from('journal_entries').upsert({ ...entry, user_id: userId }, { onConflict: 'user_id,date' });
    if (error) throw error;
    return true;
  },
  async getJournalEntry(userId: string, date: string): Promise<JournalEntry | null> {
    const { data, error } = await supabase.from('journal_entries').select('*').eq('user_id', userId).eq('date', date).maybeSingle();
    if (error) throw error;
    return data;
  },
};
