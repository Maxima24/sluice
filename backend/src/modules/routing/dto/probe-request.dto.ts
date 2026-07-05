import { z } from 'zod';

/** "Can I pay?" request. Amounts are decimal strings (shannons / UDT units). */
export const ProbeRequestSchema = z
  .object({
    targetPubkey: z.string().min(1).optional(),
    invoice: z.string().min(1).optional(),
    amount: z.string().regex(/^\d+$/, 'amount must be a decimal string'),
    maxFee: z.string().regex(/^\d+$/).optional(),
  })
  .refine((d) => !!d.targetPubkey || !!d.invoice, {
    message: 'targetPubkey or invoice is required',
  });

export type ProbeRequestDto = z.infer<typeof ProbeRequestSchema>;
