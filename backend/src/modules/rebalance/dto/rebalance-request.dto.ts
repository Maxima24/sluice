import { z } from 'zod';

export const RebalanceRequestSchema = z
  .object({
    sourceChannelId: z.string().min(1),
    destChannelId: z.string().min(1),
    amount: z.string().regex(/^\d+$/, 'amount must be a decimal string'),
    maxFee: z.string().regex(/^\d+$/, 'maxFee must be a decimal string'),
    idempotencyKey: z.string().min(8),
  })
  .refine((d) => d.sourceChannelId !== d.destChannelId, {
    message: 'sourceChannelId and destChannelId must differ',
  });

export type RebalanceRequestDto = z.infer<typeof RebalanceRequestSchema>;
