'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Scale, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Badge } from '@/components/ui/Badge';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { StatusDot } from '@/components/ui/StatusDot';
import { EmptyState } from '@/components/ui/EmptyState';
import type { StatusTone } from '@/components/ui/types';
import { cn } from '@/lib/utils';
import { useChannelHealth } from '@/lib/queries/channels';
import { useCreateRebalance, useRebalanceJob } from '@/lib/queries/rebalance';
import { rebalanceSchema } from '@/lib/rebalance-schema';
import { formatCkb, truncateId } from '@/lib/format';
import type { RebalanceRequest } from '@/types/fiber';

const STEPS = ['PENDING', 'BUILDING', 'INFLIGHT', 'SUCCEEDED'] as const;

function statusTone(status: string): StatusTone {
  if (status === 'SUCCEEDED') return 'success';
  if (status === 'FAILED') return 'danger';
  return 'warning';
}

export default function RebalancePage() {
  const health = useChannelHealth();
  const channelIds = health.data?.channels.map((c) => c.channelId) ?? [];

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

  // client-only (avoids SSR/CSR hydration mismatch)
  useEffect(() => {
    if (!idempotencyKey) setKey(crypto.randomUUID());
  }, [idempotencyKey]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = rebalanceSchema.safeParse({ sourceChannelId, destChannelId, amount, maxFee });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) fe[String(issue.path[0])] = issue.message;
      setErrors(fe);
      return;
    }
    setErrors({});
    const body: RebalanceRequest = { ...parsed.data, idempotencyKey };
    create.mutate(body, { onSuccess: (d) => setJobId(d.id) });
  }

  const currentIdx = current ? STEPS.indexOf(current.status as (typeof STEPS)[number]) : -1;
  const running = !!current && ['PENDING', 'BUILDING', 'INFLIGHT'].includes(current.status);

  function stepTone(i: number): StatusTone {
    if (!current) return 'neutral';
    if (current.status === 'SUCCEEDED') return 'success';
    if (current.status === 'FAILED') return i <= 1 ? 'success' : i === 2 ? 'danger' : 'neutral';
    if (i < currentIdx) return 'success';
    if (i === currentIdx) return 'warning';
    return 'neutral';
  }

  return (
    <div>
      <PageHeader
        title="Rebalance"
        description="Move liquidity via a circular self-payment — runs off the request path, idempotent."
      />
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
        <Card className="self-start">
          <CardHeader>
            <CardTitle>New rebalance</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={submit} className="space-y-4">
              <FormField label="Source channel (over-funded)" required error={errors.sourceChannelId} htmlFor="src">
                <Input
                  id="src"
                  list="rb-channels"
                  value={sourceChannelId}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="0x…"
                  className="font-mono"
                  invalid={!!errors.sourceChannelId}
                />
              </FormField>
              <FormField label="Destination channel (depleted)" required error={errors.destChannelId} htmlFor="dst">
                <Input
                  id="dst"
                  list="rb-channels"
                  value={destChannelId}
                  onChange={(e) => setDest(e.target.value)}
                  placeholder="0x…"
                  className="font-mono"
                  invalid={!!errors.destChannelId}
                />
              </FormField>
              <datalist id="rb-channels">
                {channelIds.map((id) => (
                  <option key={id} value={id} />
                ))}
              </datalist>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Amount" required hint="shannon" error={errors.amount} htmlFor="amt">
                  <Input
                    id="amt"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100000000"
                    className="tabular-nums"
                    invalid={!!errors.amount}
                  />
                </FormField>
                <FormField label="Max fee" required hint="shannon" error={errors.maxFee} htmlFor="fee">
                  <Input
                    id="fee"
                    inputMode="numeric"
                    value={maxFee}
                    onChange={(e) => setMaxFee(e.target.value)}
                    placeholder="1000000"
                    className="tabular-nums"
                    invalid={!!errors.maxFee}
                  />
                </FormField>
              </div>

              <FormField
                label="Idempotency key"
                hint="Resubmitting the same key returns the same job — never executes twice."
              >
                <div className="flex items-center gap-2">
                  <Input value={idempotencyKey} onChange={(e) => setKey(e.target.value)} className="font-mono text-xs" />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setKey(crypto.randomUUID())}
                    leadingIcon={<RefreshCw className="h-3.5 w-3.5" />}
                  >
                    New
                  </Button>
                </div>
              </FormField>

              <Button type="submit" loading={create.isPending}>
                Queue rebalance
              </Button>
              {channelIds.length === 0 ? (
                <p className="text-xs text-neutral-500">
                  No channels detected — you can still submit to see the flow (it will fail “channel not found”).
                </p>
              ) : null}
            </form>
          </CardBody>
        </Card>

        <div className="space-y-4">
          {create.isError ? (
            <AlertBanner tone="danger" title="Could not queue" description={(create.error as Error)?.message} />
          ) : null}

          {current ? (
            <Card>
              <CardHeader>
                <CardTitle>Job {truncateId(current.id, 6, 4)}</CardTitle>
                <Badge tone={statusTone(current.status)}>{current.status}</Badge>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center gap-1.5">
                  {STEPS.map((s, i) => (
                    <div key={s} className="flex flex-1 items-center gap-1.5">
                      <StatusDot tone={stepTone(i)} pulse={i === currentIdx && running} />
                      <span className={cn('text-[11px]', stepTone(i) === 'neutral' ? 'text-neutral-500' : 'text-neutral-700')}>
                        {s}
                      </span>
                      {i < STEPS.length - 1 ? <span className="h-px flex-1 bg-outline" /> : null}
                    </div>
                  ))}
                </div>

                {current.status === 'FAILED' && current.error ? (
                  <AlertBanner tone="danger" title="Rebalance failed" description={current.error} />
                ) : null}

                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                  <dt className="text-neutral-500">Amount</dt>
                  <dd className="tabular-nums text-neutral-900" data-numeric>
                    {formatCkb(current.amount)}
                  </dd>
                  <dt className="text-neutral-500">Max fee</dt>
                  <dd className="tabular-nums text-neutral-900" data-numeric>
                    {formatCkb(current.maxFee)}
                  </dd>
                  {current.feePaid ? (
                    <>
                      <dt className="text-neutral-500">Fee paid</dt>
                      <dd className="tabular-nums text-success-600" data-numeric>
                        {formatCkb(current.feePaid)}
                      </dd>
                    </>
                  ) : null}
                  <dt className="text-neutral-500">Source</dt>
                  <dd className="truncate font-mono text-xs text-neutral-700">{truncateId(current.sourceChannelId)}</dd>
                  <dt className="text-neutral-500">Dest</dt>
                  <dd className="truncate font-mono text-xs text-neutral-700">{truncateId(current.destChannelId)}</dd>
                  {current.paymentHash ? (
                    <>
                      <dt className="text-neutral-500">Payment</dt>
                      <dd className="truncate font-mono text-xs text-neutral-700">{truncateId(current.paymentHash)}</dd>
                    </>
                  ) : null}
                </dl>
              </CardBody>
            </Card>
          ) : (
            <EmptyState
              icon={<Scale className="h-5 w-5" />}
              title="No job yet"
              description="Queue a rebalance to watch it progress here."
            />
          )}
        </div>
      </div>
    </div>
  );
}
