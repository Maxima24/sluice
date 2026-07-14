import { MetricStrip } from './shared';

export function ReconciliationModule() {
  const steps = ['snapshot', 'node rpc', 'double-entry', 'operator view'];

  return (
    <div className="flex h-full min-h-[260px] flex-col gap-5 bg-transparent">
      <MetricStrip
        items={[
          ['SNAPSHOT', 'synced'],
          ['NODE DRIFT', '0.02 CKB'],
          ['AUTHORITY', 'fiber node'],
        ]}
      />

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">ledger trace</p>
        <div className="mt-3">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-3 border-b border-white/[0.06] py-2.5 last:border-0">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/16 bg-white/[0.04] font-mono text-[10px] text-white/44">
                {index + 1}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">{step}</span>
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
