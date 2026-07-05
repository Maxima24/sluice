import type { U128Hex } from './types/json-rpc';

/**
 * Parse a node-encoded u128 (0x-hex or decimal string) to BigInt.
 * u128 far exceeds Number.MAX_SAFE_INTEGER — NEVER use Number() on these.
 */
export function u128FromHex(value: U128Hex): bigint {
  return BigInt(value);
}

/** Lossless decimal string for persistence into Postgres NUMERIC(40,0). */
export function toNumericString(value: U128Hex): string {
  return u128FromHex(value).toString(10);
}

/** Decimal (or hex) string -> 0x-hex u128 for node RPC params. */
export function toU128Hex(value: string): U128Hex {
  return `0x${BigInt(value).toString(16)}`;
}
