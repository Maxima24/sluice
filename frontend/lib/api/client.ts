import ky, { HTTPError } from 'ky';
import { env } from '@/lib/env';
import type { Envelope } from '@/types/api';

/** Browser JSON client. Backend CORS must allow this origin for client-side calls. */
const apiClient = ky.create({
  prefixUrl: env.NEXT_PUBLIC_API_URL,
  retry: { limit: 0 },
  timeout: 20_000,
});

/** Envelope-unwrapping helpers ({ statusCode, message, data } -> data). */
export const api = {
  get: <T>(path: string, options?: Parameters<typeof apiClient.get>[1]) =>
    apiClient.get(path, options).json<Envelope<T>>().then((r) => r.data),
  post: <T>(path: string, json?: unknown, options?: Parameters<typeof apiClient.post>[1]) =>
    apiClient
      .post(path, { json, ...options })
      .json<Envelope<T>>()
      .then((r) => r.data),
};

/**
 * SSR-safe fetch: returns null on any failure so a down backend/node never
 * crashes a Server Component render (the page shows a "node down" state instead).
 */
export async function serverFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/${path.replace(/^\//, '')}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const body = (await res.json()) as Envelope<T>;
    return body.data;
  } catch {
    return null;
  }
}

export { HTTPError };
