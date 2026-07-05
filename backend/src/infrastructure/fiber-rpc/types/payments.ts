import type { Hash256, Pubkey, U128Hex, U64Hex } from './json-rpc';

/** get_payment / send_payment* status walk. */
export type PaymentStatus = 'Created' | 'Inflight' | 'Success' | 'Failed';

export interface SendPaymentParams {
  target_pubkey?: Pubkey;
  invoice?: string;
  amount?: U128Hex;
  payment_hash?: Hash256;
  keysend?: boolean; // auto-generates a payment_hash when no invoice
  max_fee_amount?: U128Hex;
  allow_self_payment?: boolean;
  udt_type_script?: unknown;
  dry_run?: boolean;
  [k: string]: unknown;
}

export interface SessionRouteHop {
  target?: Pubkey;
  channel_outpoint?: string;
  amount?: U128Hex;
  [k: string]: unknown;
}

/** Shared shape for send_payment*, send_payment_with_router, and get_payment. */
export interface SendPaymentResponse {
  payment_hash: Hash256;
  status: PaymentStatus;
  fee?: U128Hex;
  created_at?: U64Hex | string;
  last_updated_at?: U64Hex | string;
  routers?: SessionRouteHop[];
  failed_error?: string;
  [k: string]: unknown;
}

export interface HopRequire {
  pubkey: Pubkey;
  channel_outpoint?: string;
}

export interface BuildRouterParams {
  amount?: U128Hex;
  udt_type_script?: unknown;
  hops_info: HopRequire[];
  final_tlc_expiry_delta?: U64Hex;
}

export interface RouterHop {
  target: Pubkey;
  channel_outpoint: string;
  amount_received: U128Hex;
  incoming_tlc_expiry?: U64Hex;
  [k: string]: unknown;
}

export interface BuildRouterResult {
  router_hops: RouterHop[];
}

export interface SendPaymentWithRouterParams {
  router: RouterHop[];
  payment_hash?: Hash256;
  invoice?: string;
  keysend?: boolean;
  udt_type_script?: unknown;
  dry_run?: boolean;
}
