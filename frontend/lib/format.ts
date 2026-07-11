const GROUP = new Intl.NumberFormat('en-US');
const SHANNON_PER_CKB = BigInt(100000000);
const ZERO = BigInt(0);

/**
 * shannon decimal-string → "12,345.6789 CKB". Amounts are u128 and can exceed
 * Number.MAX_SAFE_INTEGER, so all math is BigInt. Non-CKB (UDT) callers pass
 * `withUnit:false` (the value is token units, not shannon).
 */
export function formatCkb(shannon: string, opts?: { withUnit?: boolean }): string {
  let s = shannon.trim();
  const neg = s.startsWith('-');
  if (neg) s = s.slice(1);
  if (!/^\d+$/.test(s)) return shannon; // passthrough garbage
  const v = BigInt(s);
  const whole = v / SHANNON_PER_CKB;
  const frac = (v % SHANNON_PER_CKB).toString().padStart(8, '0').replace(/0+$/, '');
  const body = frac ? `${GROUP.format(whole)}.${frac}` : GROUP.format(whole);
  const unit = opts?.withUnit === false ? '' : ' CKB';
  return `${neg ? '-' : ''}${body}${unit}`;
}

/** Sum shannon decimal strings safely → decimal string. */
export function sumShannon(values: readonly string[]): string {
  return values.reduce((a, v) => a + (/^\d+$/.test(v) ? BigInt(v) : ZERO), ZERO).toString();
}

/** 0x1234abcd…9f2c for long pubkeys / channelIds / outpoints. */
export function truncateId(id: string, head = 8, tail = 6): string {
  if (!id) return '';
  return id.length <= head + tail + 1 ? id : `${id.slice(0, head)}…${id.slice(-tail)}`;
}

/** ratio 0..1 → "62.5%". */
export function formatPercent(ratio: number, digits = 1): string {
  if (!Number.isFinite(ratio)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: digits }).format(ratio);
}
