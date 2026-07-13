'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, RefreshCw, Scale } from 'lucide-react';
import { CanvasAppShell, CanvasWorkspace, WorkspaceHeader, WorkspacePanel } from '@/components/canvas-dashboard/CanvasAppShell';
import { useChannelHealth } from '@/lib/queries/channels';
import { useCreateRebalance, useRebalanceJob } from '@/lib/queries/rebalance';
import { rebalanceSchema } from '@/lib/rebalance-schema';
import { focusWorkspaceModule } from '@/lib/workspace';
import { formatCkb, truncateId } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { RebalanceRequest } from '@/types/fiber';

const STEPS = ['PENDING', 'BUILDING', 'INFLIGHT', 'SUCCEEDED'] as const;

export default function RebalancePage() {
  const health = useChannelHealth();
  const channelIds = health.data?.channels.map((channel) => channel.channelId) ?? [];
  const channels = health.data?.channels ?? [];
  const [sourceChannelId, setSource] = useState('');
  const [destChannelId, setDest] = useState('');
  const [amount, setAmount] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [idempotencyKey, setKey] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [jobId, setJobId] = useState<string | null>(null);

  const create = useCreateRebalance();
  const job = useRebalanceJob(jobId);
  const current = job.data ?? create.data ?? null;
  const currentIndex = current ? STEPS.indexOf(current.status as (typeof STEPS)[number]) : -1;

  useEffect(() => {
    if (idempotencyKey) return;
    const timer = window.setTimeout(() => setKey(crypto.randomUUID()), 0);
    return () => window.clearTimeout(timer);
  }, [idempotencyKey]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = rebalanceSchema.safeParse({ sourceChannelId, destChannelId, amount, maxFee });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) nextErrors[String(issue.path[0])] = issue.message;
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    focusWorkspaceModule('rebalance');
    const body: RebalanceRequest = { ...parsed.data, idempotencyKey };
    create.mutate(body, { onSuccess: (data) => setJobId(data.id) });
  }

  return (
    <CanvasAppShell active="rebalance" breadcrumb="Liquidity Layer / Rebalancing">
      <CanvasWorkspace>
        <WorkspaceHeader
          eyebrow="circular self-payment"
          title="Rebalancing"
          description="Move liquidity from over-funded channels to depleted channels while keeping every circular payment idempotent and auditable."
          action={
            <button
              type="button"
              onClick={() => {
                setKey(crypto.randomUUID());
                focusWorkspaceModule('rebalance');
              }}
              className="hidden h-11 shrink-0 items-center gap-2 rounded-[4px] border border-line bg-panel px-3 text-xs font-black uppercase tracking-[0.12em] text-ink-editorial transition hover:border-ink-editorial sm:flex"
            >
              <RefreshCw className="h-4 w-4" />
              New key
            </button>
          }
        />

        <WorkspacePanel>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-faint">input</p>
              <h2 className="mt-1 text-lg font-black uppercase tracking-[0.04em]">Queue movement</h2>
            </div>
            <Scale className="h-5 w-5 text-copy" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <ConsoleField label="Source channel" hint="over-funded" error={errors.sourceChannelId}>
              <ConsoleInput value={sourceChannelId} onChange={setSource} placeholder="0x..." list="rb-channels" />
            </ConsoleField>
            <ConsoleField label="Destination channel" hint="depleted" error={errors.destChannelId}>
              <ConsoleInput value={destChannelId} onChange={setDest} placeholder="0x..." list="rb-channels" />
            </ConsoleField>
            <datalist id="rb-channels">
              {channelIds.map((id) => (
                <option key={id} value={id} />
              ))}
            </datalist>

            <div className="grid gap-3 sm:grid-cols-2">
              <ConsoleField label="Amount" hint="shannon" error={errors.amount}>
                <ConsoleInput value={amount} onChange={setAmount} placeholder="100000000" inputMode="numeric" />
              </ConsoleField>
              <ConsoleField label="Max fee" hint="shannon" error={errors.maxFee}>
                <ConsoleInput value={maxFee} onChange={setMaxFee} placeholder="1000000" inputMode="numeric" />
              </ConsoleField>
            </div>

            <ConsoleField label="Idempotency key">
              <ConsoleInput value={idempotencyKey} onChange={setKey} placeholder="request key" />
            </ConsoleField>

            <button
              type="submit"
              disabled={create.isPending}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-[4px] border border-ink-editorial bg-ink-editorial text-sm font-black uppercase tracking-[0.12em] text-panel transition hover:bg-ink-hover disabled:opacity-55"
            >
              {create.isPending ? 'Queuing rebalance' : 'Queue rebalance'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </WorkspacePanel>

        <WorkspacePanel className="mt-4">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-faint">job</p>
              <h2 className="mt-1 truncate text-lg font-black uppercase tracking-[0.04em]">{current ? `Job ${truncateId(current.id, 6, 4)}` : 'No job queued'}</h2>
            </div>
            <JobBadge status={current?.status} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {STEPS.map((step, index) => {
              const active = current ? index <= currentIndex || current.status === 'SUCCEEDED' : false;
              const failed = current?.status === 'FAILED' && index >= 2;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => focusWorkspaceModule('rebalance')}
                  className={cn(
                    'rounded-[4px] border p-3 text-left transition hover:border-ink-editorial',
                    active ? 'border-ink-editorial bg-shell-muted' : failed ? 'border-ink-editorial bg-shell-muted' : 'border-line bg-panel',
                  )}
                >
                  <span className={cn('block h-2 w-2 rounded-full', active || failed ? 'bg-ink-editorial' : 'bg-faint')} />
                  <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-copy">{step}</p>
                </button>
              );
            })}
          </div>

          {create.isError ? <ResultMessage title="Could not queue" body={(create.error as Error)?.message} /> : null}
          {current?.status === 'FAILED' && current.error ? <ResultMessage title="Rebalance failed" body={current.error} /> : null}

          {current ? (
            <div className="mt-4 grid gap-3 rounded-[4px] border border-line bg-shell-muted p-3 sm:grid-cols-2">
              <DataLine label="Amount" value={formatCkb(current.amount)} />
              <DataLine label="Max fee" value={formatCkb(current.maxFee)} />
              <DataLine label="Source" value={truncateId(current.sourceChannelId)} />
              <DataLine label="Destination" value={truncateId(current.destChannelId)} />
            </div>
          ) : (
            <p className="mt-4 rounded-[4px] border border-dashed border-line bg-shell-muted p-4 text-sm leading-6 text-copy">
              Queue a rebalance to watch liquidity movement animate in the center workspace.
            </p>
          )}
        </WorkspacePanel>

        <WorkspacePanel className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.08em]">Channel candidates</h2>
            <span className="rounded-[4px] border border-line px-2 py-1 font-mono text-[10px] text-copy">
              {channels.length} channels
            </span>
          </div>
          <div className="space-y-2">
            {channels.length === 0 ? (
              <p className="rounded-[4px] border border-dashed border-line bg-shell-muted p-4 text-sm leading-6 text-copy">
                No channels open yet — fund and open a channel to see candidates here.
              </p>
            ) : (
              channels.slice(0, 6).map((channel) => (
                <button
                  key={channel.channelId}
                  type="button"
                  onClick={() => focusWorkspaceModule('channels')}
                  className="block w-full rounded-[4px] border border-line bg-panel p-3 text-left transition hover:border-ink-editorial"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-mono text-xs font-bold text-ink-editorial">{truncateId(channel.channelId)}</span>
                    <span className="text-xs text-copy">{formatCkb(channel.outbound, { withUnit: !channel.isUdt })}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-none bg-shell-muted">
                    <span className="block h-full rounded-none bg-ink-editorial" style={{ width: `${Math.round((1 - channel.inboundRatio) * 100)}%` }} />
                  </div>
                </button>
              ))
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
  list,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputMode?: 'numeric';
  list?: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      inputMode={inputMode}
      list={list}
      className="h-11 w-full rounded-[4px] border border-line bg-panel px-3 font-mono text-sm text-ink-editorial outline-none transition placeholder:text-faint focus:border-ink-editorial"
    />
  );
}

function JobBadge({ status }: { status?: string }) {
  return (
    <span className="rounded-[4px] border border-line bg-panel px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-copy">
      {status ?? 'Idle'}
    </span>
  );
}

function ResultMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-4 rounded-[4px] border border-line bg-shell-muted p-4">
      <p className="font-black uppercase tracking-[0.04em] text-ink-editorial">{title}</p>
      <p className="mt-1 text-sm leading-6 text-copy">{body}</p>
    </div>
  );
}

function DataLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">{label}</p>
      <p className="mt-1 truncate font-mono text-sm font-semibold text-ink-editorial">{value}</p>
    </div>
  );
}
