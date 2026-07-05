export interface RebalanceInput {
  sourceChannelId: string;
  destChannelId: string;
  amount: string; // decimal
  maxFee: string; // decimal
  idempotencyKey: string;
}

/** BullMQ job payload — only the id; the row is the source of truth. */
export interface RebalanceJobData {
  jobId: string;
}
