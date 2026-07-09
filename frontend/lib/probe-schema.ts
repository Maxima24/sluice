import { z } from 'zod';

export const probeSchema = z
  .object({
    mode: z.enum(['pubkey', 'invoice']),
    targetPubkey: z.string().trim().optional(),
    invoice: z.string().trim().optional(),
    amount: z.string().regex(/^\d+$/, 'Amount must be a positive integer (shannon)'),
    maxFee: z.union([z.string().regex(/^\d+$/, 'Max fee must be a positive integer'), z.literal('')]).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.mode === 'pubkey' && !v.targetPubkey) {
      ctx.addIssue({ code: 'custom', path: ['targetPubkey'], message: 'Target pubkey is required' });
    }
    if (v.mode === 'invoice' && !v.invoice) {
      ctx.addIssue({ code: 'custom', path: ['invoice'], message: 'Invoice is required' });
    }
  });

export type ProbeForm = z.infer<typeof probeSchema>;
