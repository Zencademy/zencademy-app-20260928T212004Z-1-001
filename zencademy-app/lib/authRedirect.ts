import * as Linking from 'expo-linking';
import { supabase } from './supabase/client';

/** Deep link used in signup / recovery emails (Expo Go + standalone). */
export function authRedirectUrl(path = 'auth/callback') {
  return Linking.createURL(path);
}

function paramsFromUrl(url: string): Record<string, string> {
  const out: Record<string, string> = {};
  const push = (chunk: string) => {
    for (const part of chunk.split('&')) {
      const [rawKey, rawVal = ''] = part.split('=');
      if (!rawKey) continue;
      out[decodeURIComponent(rawKey)] = decodeURIComponent(rawVal.replace(/\+/g, ' '));
    }
  };
  const q = url.indexOf('?');
  const h = url.indexOf('#');
  if (q >= 0) {
    const end = h > q ? h : url.length;
    push(url.slice(q + 1, end));
  }
  if (h >= 0) push(url.slice(h + 1));
  return out;
}

/**
 * Completes email confirmation / password recovery when the OS opens the app via deep link.
 * Supports PKCE `code` and implicit `access_token` + `refresh_token` flows.
 */
export async function createSessionFromUrl(url: string) {
  if (!url || (!url.includes('access_token') && !url.includes('code=') && !url.includes('refresh_token'))) {
    return null;
  }
  const params = paramsFromUrl(url);
  if (params.error || params.error_code) {
    throw new Error(params.error_description || params.error || params.error_code || 'Auth link failed');
  }

  if (params.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
    return data.session;
  }

  if (params.access_token && params.refresh_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (error) throw error;
    return data.session;
  }

  return null;
}

export function isRecoveryUrl(url: string) {
  const params = paramsFromUrl(url);
  return params.type === 'recovery' || url.includes('type=recovery');
}

/**
 * Use the raw Supabase verify link from the email (do not open it in a browser).
 * Works even when redirect_to points at localhost.
 */
export async function sessionFromRecoveryLink(pasted: string) {
  const raw = pasted.trim().replace(/^<|>$/g, '');
  if (!raw) throw new Error('Paste the full reset link from your email.');

  if (raw.includes('access_token') || (raw.includes('code=') && !raw.includes('/auth/v1/verify'))) {
    const session = await createSessionFromUrl(raw);
    if (!session) throw new Error('Could not use that link. Request a new reset email.');
    return session;
  }

  const params = paramsFromUrl(raw);
  const token_hash = params.token_hash || params.token;
  const type = (params.type === 'signup' || params.type === 'email' ? params.type : 'recovery') as
    | 'recovery'
    | 'signup'
    | 'email';

  if (!token_hash) {
    throw new Error('Paste the full https://…supabase.co/auth/v1/verify… link from the email.');
  }

  const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
  if (error) throw error;
  return data.session;
}
