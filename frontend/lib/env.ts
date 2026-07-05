import { z } from 'zod';

/**
 * Public env (NEXT_PUBLIC_*). These must be referenced as literal
 * `process.env.NEXT_PUBLIC_X` so Next inlines them at build time.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url(),
  NEXT_PUBLIC_WS_URL: z.url().optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3000',
});

if (!parsed.success) {
  console.error('Invalid public environment configuration:', z.treeifyError(parsed.error));
  throw new Error('Invalid public environment configuration');
}

export const env: PublicEnv = parsed.data;
