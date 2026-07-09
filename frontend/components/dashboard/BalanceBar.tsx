/**
 * Diverging, center-anchored channel balance bar. Outbound (local, "can send")
 * fills leftward from center; inbound (remote, "can receive") fills rightward.
 * A balanced channel is symmetric. Driven by inboundRatio (0..1) — no BigInt in the view.
 */
export function BalanceBar({ inboundRatio, isUdt }: { inboundRatio: number; isUdt?: boolean }) {
  const clamp = (n: number) => Math.max(0, Math.min(1, n));
  const outPct = clamp(1 - inboundRatio) * 50;
  const inPct = clamp(inboundRatio) * 50;
  const inboundColor = isUdt ? 'bg-info-500' : 'bg-secondary-500';

  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
      <div className="absolute inset-y-0 right-1/2 bg-accent-500" style={{ width: `${outPct}%` }} title="outbound (local)" />
      <div className={`absolute inset-y-0 left-1/2 ${inboundColor}`} style={{ width: `${inPct}%` }} title="inbound (remote)" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-outline" aria-hidden />
    </div>
  );
}
