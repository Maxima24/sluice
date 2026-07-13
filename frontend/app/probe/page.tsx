'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, CircleCheck, CircleX, Gauge, Radar } from 'lucide-react';
import { CanvasAppShell, CanvasWorkspace, WorkspaceHeader, WorkspacePanel } from '@/components/canvas-dashboard/CanvasAppShell';
import { useProbe } from '@/lib/queries/probe';
import { probeSchema } from '@/lib/probe-schema';
import { focusWorkspaceModule } from '@/lib/workspace';
import { formatCkb, truncateId } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ProbeRequest } from '@/types/fiber';

export default function ProbePage() {
  const [mode, setMode] = useState<'pubkey' | 'invoice'>('pubkey');
  const [targetPubkey, setTargetPubkey] = useState('');
  const [invoice, setInvoice] = useState('');
  const [amount, setAmount] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const probe = useProbe();
  const result = probe.data;

  function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = probeSchema.safeParse({ mode, targetPubkey, invoice, amount, maxFee });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) nextErrors[String(issue.path[0])] = issue.message;
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    const value = parsed.data;
    const body: ProbeRequest = {
      amount: value.amount,
      ...(mode === 'pubkey' ? { targetPubkey: value.targetPubkey } : { invoice: value.invoice }),
      ...(value.maxFee ? { maxFee: value.maxFee } : {}),
    };
    focusWorkspaceModule('route-probe');
    probe.mutate(body);
  }

  return (
    <CanvasAppShell active="probe" breadcrumb="Liquidity Layer / Route Probe">
      <CanvasWorkspace>
        <WorkspaceHeader
          eyebrow="can i pay"
          title="Route Probe"
          description="Check whether a payment will actually route before committing funds. The workspace focuses the route simulation while this console handles the probe request."
          action={<StatusBadge payable={result?.payable} pending={probe.isPending} />}
        />

        <WorkspacePanel>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-faint">input</p>
              <h2 className="mt-1 text-lg font-black uppercase tracking-[0.04em]">Payment target</h2>
            </div>
            <Radar className="h-5 w-5 text-copy" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-1 rounded-[4px] border border-line bg-shell-muted p-1">
              {(['pubkey', 'invoice'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={cn(
                    'rounded-[3px] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition',
                    mode === item ? 'bg-ink-editorial text-panel' : 'text-copy hover:text-ink-editorial',
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            {mode === 'pubkey' ? (
              <ConsoleField label="Target pubkey" error={errors.targetPubkey}>
                <ConsoleInput value={targetPubkey} onChange={setTargetPubkey} placeholder="0x..." />
              </ConsoleField>
            ) : (
              <ConsoleField label="Invoice" error={errors.invoice}>
                <ConsoleInput value={invoice} onChange={setInvoice} placeholder="fibb..." />
              </ConsoleField>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <ConsoleField label="Amount" hint="shannon" error={errors.amount}>
                <ConsoleInput value={amount} onChange={setAmount} placeholder="100000000" inputMode="numeric" />
              </ConsoleField>
              <ConsoleField label="Max fee" hint="optional" error={errors.maxFee}>
                <ConsoleInput value={maxFee} onChange={setMaxFee} placeholder="1000000" inputMode="numeric" />
              </ConsoleField>
            </div>

            <button
              type="submit"
              disabled={probe.isPending}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-[4px] border border-ink-editorial bg-ink-editorial text-sm font-black uppercase tracking-[0.12em] text-panel transition hover:bg-ink-hover disabled:opacity-55"
            >
              {probe.isPending ? 'Probing route' : 'Probe route'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </WorkspacePanel>

        <WorkspacePanel className="mt-4">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-faint">result</p>
              <h2 className="mt-1 text-lg font-black uppercase tracking-[0.04em]">Payment readiness</h2>
            </div>
            <Gauge className="h-5 w-5 text-faint" />
          </div>

          {probe.isError ? (
            <ResultBanner tone="danger" title="Probe failed" body={(probe.error as Error)?.message} />
          ) : result ? (
            result.payable ? (
              <ResultBanner
                tone="success"
                title="Payable"
                body={`Route found with fee ${formatCkb(result.fee ?? '0')} for ${formatCkb(result.amount)}.`}
              />
            ) : (
              <ResultBanner tone="danger" title="Not payable" body={result.reason ?? 'No route found.'} />
            )
          ) : (
            <div className="rounded-[4px] border border-dashed border-line bg-shell-muted p-4 text-sm leading-6 text-copy">
              Submit a pubkey or invoice to simulate the path. The center workspace will fly to the Route Simulation module.
            </div>
          )}

          {result?.bottleneck ? (
            <button
              type="button"
              onClick={() => focusWorkspaceModule('route-probe')}
              className="mt-4 block w-full rounded-[4px] border border-line bg-panel p-4 text-left transition hover:border-ink-editorial"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint">bottleneck hop</p>
              <p className="mt-2 truncate font-mono text-sm font-semibold text-ink-editorial">{truncateId(result.bottleneck.pubkey, 12, 8)}</p>
              {result.bottleneck.availableOutbound ? (
                <p className="mt-1 text-xs text-copy">available outbound: {formatCkb(result.bottleneck.availableOutbound)}</p>
              ) : null}
            </button>
          ) : null}
        </WorkspacePanel>

        <WorkspacePanel className="mt-4">
          <h2 className="text-sm font-black uppercase tracking-[0.08em]">Route analysis</h2>
          <div className="mt-4 space-y-2">
            {(result?.hops?.length ? result.hops : Array.from({ length: 4 }, (_, index) => ({ pubkey: `pending-hop-${index}` }))).map(
              (hop, index) => (
                <button
                  key={`${hop.pubkey}-${index}`}
                  type="button"
                  onClick={() => focusWorkspaceModule('route-probe')}
                  className="flex w-full items-center justify-between rounded-[4px] border border-line bg-panel px-3 py-3 text-left transition hover:border-ink-editorial"
                >
                  <span className="min-w-0">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-faint">hop {index + 1}</span>
                    <span className="mt-1 block truncate font-mono text-xs text-copy">{truncateId(hop.pubkey, 8, 4)}</span>
                  </span>
                  <span className="h-2 w-2 rounded-full bg-ink-editorial" />
                </button>
              ),
            )}
          </div>
        </WorkspacePanel>
      </CanvasWorkspace>
    </CanvasAppShell>
  );
}

function ConsoleField({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-faint">
        {label}
        {hint ? <span className="font-normal normal-case tracking-normal text-faint">{hint}</span> : null}
      </span>
      <span className="mt-2 block">{children}</span>
      {error ? <span className="mt-1 block text-xs text-ink-editorial">{error}</span> : null}
    </label>
  );
}

function ConsoleInput({
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputMode?: 'numeric';
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      inputMode={inputMode}
      className="h-11 w-full rounded-[4px] border border-line bg-panel px-3 font-mono text-sm text-ink-editorial outline-none transition placeholder:text-faint focus:border-ink-editorial"
    />
  );
}

function StatusBadge({ payable, pending }: { payable?: boolean; pending: boolean }) {
  const label = pending ? 'Running' : payable === undefined ? 'Idle' : payable ? 'Payable' : 'Blocked';
  return <span className="hidden rounded-[4px] border border-line bg-panel px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-copy sm:inline-flex">{label}</span>;
}

function ResultBanner({ tone, title, body }: { tone: 'success' | 'danger'; title: string; body: string }) {
  const Icon = tone === 'success' ? CircleCheck : CircleX;
  return (
    <div className="flex gap-3 rounded-[4px] border border-line bg-shell-muted p-4">
      <Icon className="mt-0.5 h-5 w-5 text-ink-editorial" />
      <div>
        <p className="font-black uppercase tracking-[0.04em] text-ink-editorial">{title}</p>
        <p className="mt-1 text-sm leading-6 text-copy">{body}</p>
      </div>
    </div>
  );
}
