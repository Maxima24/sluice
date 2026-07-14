import { describe, expect, it } from 'vitest';
import { toNumericString, toU128Hex, u128FromHex } from './u128';

describe('u128 conversions (money parsing — never Number())', () => {
  it('parses 0x-hex to BigInt', () => {
    expect(u128FromHex('0x0')).toBe(0n);
    expect(u128FromHex('0xff')).toBe(255n);
    expect(u128FromHex('0x2540be400')).toBe(10_000_000_000n);
  });

  it('renders a lossless decimal string for NUMERIC(40,0) persistence', () => {
    expect(toNumericString('0xde0b6b3a7640000')).toBe('1000000000000000000'); // 1e18
  });

  it('encodes a decimal (or hex) string back to 0x-hex for RPC params', () => {
    expect(toU128Hex('255')).toBe('0xff');
    expect(toU128Hex('1000000000000000000')).toBe('0xde0b6b3a7640000');
  });

  it('round-trips the full u128 range without precision loss', () => {
    const maxU128Hex = '0x' + 'f'.repeat(32); // 2^128 - 1, far beyond Number.MAX_SAFE_INTEGER
    const dec = toNumericString(maxU128Hex);
    expect(dec).toBe('340282366920938463463374607431768211455');
    expect(toU128Hex(dec)).toBe(maxU128Hex);
  });
});
