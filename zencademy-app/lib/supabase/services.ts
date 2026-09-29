import { supabase, requireBackend } from './client';
import { deriveLevelAndLevelXP } from '../../utils/levels';
import type { UserData, JournalEntry, TrainingSession, LeaderboardUser } from './types';
export const userDataService = {
  async getUserData(userId: string): Promise<UserData> {
    requireBackend();
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    const [badges, ebooks] = await Promise.all([
      supabase.from('user_badges').select('badge_id').eq('user_id', userId),
      supabase.from('user_ebooks').select('ebook_id').eq('user_id', userId),
    ]);
    if (badges.error) throw badges.error;
    if (ebooks.error) throw ebooks.error;
    return {
      ...data,
      badges: badges.data.map(b => b.badge_id),
      owned_ebooks: (ebooks.data || []).map(row => row.ebook_id),
    } as UserData;
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
  async spendCoins(amount: number, reason = 'spend') {
    const { error } = await supabase.rpc('spend_coins', { p_amount: amount, p_reason: reason });
    if (error) throw error;
  },
  async purchaseEbook(ebookId: string) {
    const { error } = await supabase.rpc('purchase_ebook', { p_ebook_id: ebookId });
    if (error) throw error;
    return true;
  },
  async getLeaderboard(limit = 50): Promise<{ users: LeaderboardUser[]; totalCount: number }> {
    const { data, error } = await supabase.rpc('get_leaderboard', { p_limit: limit });
    if (error) throw error;
    const rows = (data || []) as Array<LeaderboardUser & { total_count?: number; points: number | string }>;
    const users: LeaderboardUser[] = rows.map((row) => {
      const points = Number(row.points) || 0;
      const derived = deriveLevelAndLevelXP(points);
      return {
        id: row.id,
        username: row.username || 'Member',
        points,
        level: derived.level,
        level_points: derived.levelXP,
        streak_count: Number(row.streak_count) || 0,
        daily_streak_count: Number(row.daily_streak_count) || 0,
        plan: row.plan || 'free',
        brain_type: row.brain_type || '',
        badges: row.badges || [],
        equipped_badge: row.equipped_badge || null,
        rank: Number(row.rank) || 0,
      };
    });
    return { users, totalCount: Number(rows[0]?.total_count || users.length || 0) };
  },
  async getUserRank(_userId: string): Promise<number | null> {
    const { data, error } = await supabase.rpc('my_rank');
    if (error) throw error;
    return data == null ? null : Number(data);
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
  async recordReward(xp: number, coins: number) {
    const { error } = await supabase.rpc('record_reward', { p_xp: xp, p_coins: coins });
    if (error) throw error;
  },
  async list(userId: string): Promise<TrainingSession[]> {
    const { data, error } = await supabase.from('training_sessions').select('*').eq('user_id', userId).not('completed_at', 'is', null).order('completed_at', { ascending: false }).limit(200);
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

export type PracticeKind = 'focus' | 'meditate';
export type PracticeLog = {
  id: string;
  user_id: string;
  kind: PracticeKind;
  duration_seconds: number;
  note: string;
  meta: Record<string, unknown>;
  created_at: string;
};

export const practiceService = {
  async log(kind: PracticeKind, durationSeconds: number, note = '', meta: Record<string, unknown> = {}) {
    const { data, error } = await supabase.rpc('log_practice', {
      p_kind: kind,
      p_duration_seconds: durationSeconds,
      p_note: note,
      p_meta: meta,
    });
    if (error) throw error;
    return data as PracticeLog;
  },
  async list(userId: string, kind?: PracticeKind, limit = 20): Promise<PracticeLog[]> {
    let q = supabase
      .from('practice_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (kind) q = q.eq('kind', kind);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []) as PracticeLog[];
  },
};
