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
    if (error) throw new Error(error.message || 'Purchase failed');
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
    const rows = (data || []) as (LeaderboardUser & { total_count?: number; points: number | string })[];
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
export type TrainingTotals = {
  session_count: number;
  total_xp: number;
  total_coins: number;
  total_duration_seconds: number;
};

export type UserBoost = { boost_id: string; expires_at: string };

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
  /** Idempotent server-owned payout. Client never chooses XP/coins. */
  async claimReward(attemptId: string, activityId: string, score: number | null = null): Promise<TrainingSession> {
    const { data, error } = await supabase.rpc('claim_activity_reward', {
      p_attempt_id: attemptId,
      p_activity_id: activityId,
      p_score: score,
    });
    if (error) throw error;
    return data as TrainingSession;
  },
  /** @deprecated Disabled server-side after 202609300002 — throws on purpose. */
  async recordReward(_xp: number, _coins: number): Promise<never> {
    throw new Error('record_reward is disabled; use claim_activity_reward');
  },
  async list(userId: string): Promise<TrainingSession[]> {
    const { data, error } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    return data || [];
  },
  async days(): Promise<{ day: string; sessions: number; xp: number; duration_seconds: number }[]> {
    const { data, error } = await supabase.rpc('get_training_days', { p_days: 7 });
    if (error) {
      // Fallback when RPC is not deployed yet — derive from recent sessions.
      const { data: rows, error: listError } = await supabase
        .from('training_sessions')
        .select('activity_day, xp, duration_seconds')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(100);
      if (listError) throw error;
      const byDay = new Map<string, { sessions: number; xp: number; duration_seconds: number }>();
      for (const row of rows || []) {
        if (!row.activity_day) continue;
        const cur = byDay.get(row.activity_day) || { sessions: 0, xp: 0, duration_seconds: 0 };
        cur.sessions += 1;
        cur.xp += Number(row.xp) || 0;
        cur.duration_seconds += Number(row.duration_seconds) || 0;
        byDay.set(row.activity_day, cur);
      }
      return Array.from(byDay, ([day, v]) => ({ day, ...v })).sort((a, b) => a.day.localeCompare(b.day));
    }
    return (data || []).map((row: { day?: string; activity_day?: string; sessions?: number; xp?: number; duration_seconds?: number }) => ({
      day: String(row.day ?? row.activity_day ?? ''),
      sessions: Number(row.sessions) || 0,
      xp: Number(row.xp) || 0,
      duration_seconds: Number(row.duration_seconds) || 0,
    }));
  },
  async totals(): Promise<TrainingTotals> {
    const { data, error } = await supabase.rpc('get_training_totals');
    if (error) throw error;
    const row = (data || {}) as Partial<TrainingTotals>;
    return {
      session_count: Number(row.session_count) || 0,
      total_xp: Number(row.total_xp) || 0,
      total_coins: Number(row.total_coins) || 0,
      total_duration_seconds: Number(row.total_duration_seconds) || 0,
    };
  },
  async listBoosts(): Promise<UserBoost[]> {
    const { data, error } = await supabase
      .from('user_boosts')
      .select('boost_id, expires_at')
      .gt('expires_at', new Date().toISOString());
    if (error) throw error;
    return (data || []) as UserBoost[];
  },
  async purchaseBoost(requestId: string, boostId: string) {
    const { error } = await supabase.rpc('purchase_boost', { p_request_id: requestId, p_boost_id: boostId });
    if (error) throw new Error(error.message || 'Boost purchase failed');
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
