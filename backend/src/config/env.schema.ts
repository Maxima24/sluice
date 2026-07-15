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

  // ── Security gate — break-glass fallback for mutations ──
  DASHBOARD_SECRET: z.string().min(1).optional(),

  // ── Operator wallet sign-in (Sign-In-With-CKB via CCC) ──
  // Allowlist of "<signType>:<identity>" operator keys (comma-separated). When
  // set, mutating endpoints require a session minted by a matching wallet.
  OPERATOR_KEYS: z.string().optional(),
  // HMAC secret for the session JWT — required once OPERATOR_KEYS is set.
  AUTH_JWT_SECRET: z.string().min(1).optional(),
  // Session lifetime, hours.
  AUTH_SESSION_TTL_H: z.coerce.number().int().positive().default(12),
}).superRefine((env, ctx) => {
  const hasOperators = (env.OPERATOR_KEYS ?? '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean).length > 0;
  if (hasOperators && !env.AUTH_JWT_SECRET) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['AUTH_JWT_SECRET'],
      message: 'AUTH_JWT_SECRET is required when OPERATOR_KEYS is set',
    });
  }
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
