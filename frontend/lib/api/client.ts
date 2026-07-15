import { env } from '@/lib/env';
import type { Envelope } from '@/types/api';

const base = env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
const url = (path: string) => `${base}/${path.replace(/^\//, '')}`;

const SECRET_KEY = 'fiber-dashboard-secret';
const SESSION_KEY = 'fiber-operator-session';

export interface OperatorSession {
  token: string;
  expiresAt: string;
  address: string;
}

/**
 * Wallet sign-in session (Sign-In-With-CKB). Minted by the backend after
 * verifying a wallet signature; attached as `Authorization: Bearer <token>` on
 * mutations. Lives only in this browser's localStorage; auto-expires.
 */
export const operatorSession = {
  get(): OperatorSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as OperatorSession;
      if (new Date(session.expiresAt).getTime() <= Date.now()) {
        window.localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },
  set(session: OperatorSession): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      /* non-fatal */
    }
  },
  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      /* non-fatal */
    }
  },
};

/**
 * The operator secret for mutating calls (POST /rebalance) — the break-glass
 * fallback when wallet sign-in isn't used. When the API is locked
 * (DASHBOARD_SECRET set server-side), the operator enters this once; it lives
 * only in this browser's localStorage and is sent as `X-Dashboard-Secret` —
 * never baked into the public bundle. Reads never need it.
 */
export const dashboardAuth = {
  get(): string {
    if (typeof window === 'undefined') return '';
    try {
      return window.localStorage.getItem(SECRET_KEY) ?? '';
    } catch {
      return '';
    }
  },
  set(value: string): void {
    if (typeof window === 'undefined') return;
    try {
      const v = value.trim();
      if (v) window.localStorage.setItem(SECRET_KEY, v);
      else window.localStorage.removeItem(SECRET_KEY);
    } catch {
      /* private-mode / storage disabled — non-fatal */
    }
  },
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const session = operatorSession.get();
  const secret = dashboardAuth.get();
  const res = await fetch(url(path), {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(session ? { authorization: `Bearer ${session.token}` } : {}),
      ...(secret ? { 'x-dashboard-secret': secret } : {}),
      ...(init?.headers ?? {}),
    },
  });
  // A rejected session is stale/invalid — drop it so the UI re-prompts sign-in.
  if (res.status === 401) operatorSession.clear();
  const body = (await res.json().catch(() => null)) as (Envelope<T> & { message?: string }) | null;
  if (!res.ok) throw new Error(body?.message ?? `HTTP ${res.status}`);
  return (body as Envelope<T>).data;
}

/** Browser JSON client. Backend CORS must allow this origin for client-side calls. */
export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, json?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: json !== undefined ? JSON.stringify(json) : undefined,
    }),
};

/**
 * SSR-safe fetch: returns null on any failure so a down backend/node never
 * crashes a Server Component render (the page shows a "node down" state instead).
 */
export async function serverFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(url(path), { cache: 'no-store' });
    if (!res.ok) return null;
    const body = (await res.json()) as Envelope<T>;
    return body.data;
  } catch {
    return null;
  }
}
