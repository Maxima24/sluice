import { z } from 'zod';

export const rebalanceSchema = z
  .object({
    sourceChannelId: z.string().trim().min(1, 'Source channel is required'),
    destChannelId: z.string().trim().min(1, 'Destination channel is required'),
    amount: z.string().regex(/^\d+$/, 'Amount must be a positive integer (shannon)'),
    maxFee: z.string().regex(/^\d+$/, 'Max fee must be a positive integer (shannon)'),
  })
  .refine((d) => d.sourceChannelId !== d.destChannelId, {
    path: ['destChannelId'],
    message: 'Must differ from the source channel',
  });

export type RebalanceForm = z.infer<typeof rebalanceSchema>;
