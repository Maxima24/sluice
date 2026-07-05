export interface ProbeHopDto {
  pubkey: string;
  channelOutpoint?: string;
  amountReceived?: string; // decimal
  availableOutbound?: string; // decimal, from graph_channels
}

/** "Can I pay?" answer — deterministic and safe (no funds move). */
export interface ProbeResultDto {
  payable: boolean;
  amount: string; // decimal echo
  fee?: string; // decimal, when payable
  reason?: string; // node explanation, when not payable (e.g. insufficient liquidity / no path)
  hops?: ProbeHopDto[];
  bottleneck?: ProbeHopDto | null; // hop with the least available outbound liquidity
}
