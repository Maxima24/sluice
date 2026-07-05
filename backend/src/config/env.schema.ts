import { z } from 'zod';

/**
 * Environment contract for the Fiber Liquidity Layer backend.
 * Validated at boot (fail-fast) — a missing/invalid key throws during module
 * init and the process never binds a port.
 */
export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  // Render injects PORT in production.
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGINS: z.string().default('*'),

  DATABASE_URL: z.string().min(1),

  // ── Fiber node (FNN) — REQUIRED ──
  FIBER_RPC_URL: z.string().url(),
  FIBER_WS_URL: z.string().url(),
  FIBER_RPC_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),

  // ── Realtime / worker (used from Step 4 / Step 6) ──
  POLL_INTERVAL_MS: z.coerce.number().int().positive().default(15_000),
  REDIS_URL: z.string().url().optional(),
  // string→boolean so "false" is honoured (z.coerce.boolean treats any non-empty string as true).
  RUN_WORKER_INLINE: z
    .string()
    .default('true')
    .transform((v) => v.toLowerCase() === 'true'),

  // ── Security gate (replaces auth) ──
  DASHBOARD_SECRET: z.string().min(1).optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = EnvSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}
