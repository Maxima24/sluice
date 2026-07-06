import { env } from '@/lib/env';
import type { Envelope } from '@/types/api';

const base = env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
const url = (path: string) => `${base}/${path.replace(/^\//, '')}`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url(path), {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
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
