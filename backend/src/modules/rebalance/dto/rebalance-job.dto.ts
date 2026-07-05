export interface RebalanceJobDto {
  id: string;
  idempotencyKey: string;
  sourceChannelId: string;
  destChannelId: string;
  amount: string; // decimal
  maxFee: string; // decimal
  status: string; // PENDING | BUILDING | INFLIGHT | SUCCEEDED | FAILED
  paymentHash: string | null;
  feePaid: string | null; // decimal
  error: string | null;
  createdAt: string;
  updatedAt: string;
}
