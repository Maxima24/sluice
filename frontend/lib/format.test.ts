import { describe, expect, it } from 'vitest';
import { formatCkb, formatPercent, sumShannon, truncateId } from './format';

describe('formatCkb', () => {
  it('formats whole CKB with grouping and unit', () => {
    expect(formatCkb('990100000000')).toBe('9,901 CKB');
  });

  it('formats fractional CKB, trimming trailing zeros', () => {
    expect(formatCkb('100000000')).toBe('1 CKB');
    expect(formatCkb('150000000')).toBe('1.5 CKB');
    expect(formatCkb('100000001')).toBe('1.00000001 CKB');
  });

  it('handles zero and sub-CKB amounts', () => {
    expect(formatCkb('0')).toBe('0 CKB');
    expect(formatCkb('1')).toBe('0.00000001 CKB');
  });

  it('omits the unit when withUnit is false (UDT)', () => {
    expect(formatCkb('150000000', { withUnit: false })).toBe('1.5');
  });

  it('stays exact well beyond Number.MAX_SAFE_INTEGER', () => {
    // 10^30 shannon = 10^22 CKB — Number() would lose precision here.
    expect(formatCkb('1000000000000000000000000000000')).toBe('10,000,000,000,000,000,000,000 CKB');
  });

  it('passes through non-numeric input untouched', () => {
    expect(formatCkb('not-a-number')).toBe('not-a-number');
  });
});

describe('sumShannon', () => {
  it('sums decimal strings with BigInt precision', () => {
    expect(sumShannon(['990100000000', '990100000000'])).toBe('1980200000000');
  });

  it('ignores non-numeric entries and returns "0" for empty', () => {
    expect(sumShannon([])).toBe('0');
    expect(sumShannon(['5', 'x', '5'])).toBe('10');
  });
});

describe('truncateId', () => {
  it('truncates long ids and leaves short ones intact', () => {
    expect(truncateId('0xaaeb53b17734eecf9c9c11a0c557cbc5', 6, 4)).toBe('0xaaeb…cbc5');
    expect(truncateId('0x1234', 6, 4)).toBe('0x1234');
    expect(truncateId('')).toBe('');
  });
});

describe('formatPercent', () => {
  it('formats a 0..1 ratio', () => {
    expect(formatPercent(0.625)).toBe('62.5%');
    expect(formatPercent(0)).toBe('0%');
  });

  it('returns a dash for non-finite input', () => {
    expect(formatPercent(Number.NaN)).toBe('—');
  });
});
