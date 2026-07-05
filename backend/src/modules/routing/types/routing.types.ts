/** Service input for a probe (from the validated ProbeRequestDto). */
export interface ProbeInput {
  targetPubkey?: string;
  invoice?: string;
  amount: string; // decimal
  maxFee?: string; // decimal
}

/** channel_outpoint -> available outbound liquidity (decimal), from graph_channels. */
export type LiquidityByOutpoint = Map<string, string>;
