'use client';

import { useState, type FormEvent } from 'react';
import { CircleCheck, CircleX } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { StatusDot } from '@/components/ui/StatusDot';
import { cn } from '@/lib/utils';
import { useProbe } from '@/lib/queries/probe';
import { probeSchema } from '@/lib/probe-schema';
import { formatCkb, truncateId } from '@/lib/format';
import type { ProbeRequest } from '@/types/fiber';

export default function ProbePage() {
  const [mode, setMode] = useState<'pubkey' | 'invoice'>('pubkey');
  const [targetPubkey, setTargetPubkey] = useState('');
  const [invoice, setInvoice] = useState('');
  const [amount, setAmount] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const probe = useProbe();

  function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = probeSchema.safeParse({ mode, targetPubkey, invoice, amount, maxFee });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) fe[String(issue.path[0])] = issue.message;
      setErrors(fe);
      return;
    }
    setErrors({});
    const v = parsed.data;
    const body: ProbeRequest = {
      amount: v.amount,
      ...(mode === 'pubkey' ? { targetPubkey: v.targetPubkey } : { invoice: v.invoice }),
      ...(v.maxFee ? { maxFee: v.maxFee } : {}),
    };
    probe.mutate(body);
  }

  const result = probe.data;

  return (
    <div>
      <PageHeader title="Can I pay?" description="Pre-flight a payment — real pathfinding, no funds move." />
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Probe route</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={submit} className="space-y-4">
              <div className="inline-flex rounded-lg border border-outline p-0.5">
                {(['pubkey', 'invoice'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={cn(
                      'rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors',
                      mode === m ? 'bg-accent-500 text-white' : 'text-neutral-500 hover:text-neutral-900',
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {mode === 'pubkey' ? (
                <FormField label="Target pubkey" required error={errors.targetPubkey} htmlFor="pk">
                  <Input
                    id="pk"
                    value={targetPubkey}
                    onChange={(e) => setTargetPubkey(e.target.value)}
                    placeholder="0x…"
                    className="font-mono"
                    invalid={!!errors.targetPubkey}
                  />
                </FormField>
              ) : (
                <FormField label="Invoice" required error={errors.invoice} htmlFor="inv">
                  <Input
                    id="inv"
                    value={invoice}
                    onChange={(e) => setInvoice(e.target.value)}
                    placeholder="fibb…"
                    className="font-mono"
                    invalid={!!errors.invoice}
                  />
                </FormField>
              )}

              <FormField label="Amount" required hint="in shannon (1 CKB = 100,000,000)" error={errors.amount} htmlFor="amt">
                <Input
                  id="amt"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputMode="numeric"
                  placeholder="100000000"
                  className="tabular-nums"
                  invalid={!!errors.amount}
                />
              </FormField>

              <FormField label="Max fee (optional)" hint="shannon" error={errors.maxFee} htmlFor="fee">
                <Input
                  id="fee"
                  value={maxFee}
                  onChange={(e) => setMaxFee(e.target.value)}
                  inputMode="numeric"
                  placeholder="1000000"
                  className="tabular-nums"
                  invalid={!!errors.maxFee}
                />
              </FormField>

              <Button type="submit" loading={probe.isPending}>
                Probe route
              </Button>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-4">
          {probe.isError ? (
            <AlertBanner tone="danger" title="Probe failed" description={(probe.error as Error)?.message} />
          ) : null}

          {result ? (
            result.payable ? (
              <AlertBanner
                tone="success"
                icon={<CircleCheck className="h-4 w-4" />}
                title="Payable"
                description={
                  <span>
                    Route found · fee{' '}
                    <span className="tabular-nums" data-numeric>
                      {formatCkb(result.fee ?? '0')}
                    </span>{' '}
                    for{' '}
                    <span className="tabular-nums" data-numeric>
                      {formatCkb(result.amount)}
                    </span>
                  </span>
                }
              />
            ) : (
              <AlertBanner
                tone="danger"
                icon={<CircleX className="h-4 w-4" />}
                title="Not payable"
                description={result.reason ?? 'No route found.'}
              />
            )
          ) : null}

          {result?.bottleneck ? (
            <Card>
              <CardHeader>
                <CardTitle>Bottleneck hop</CardTitle>
              </CardHeader>
              <CardBody>
                <p className="font-mono text-xs text-neutral-700">{truncateId(result.bottleneck.pubkey, 12, 8)}</p>
                {result.bottleneck.availableOutbound ? (
                  <p className="mt-1.5 text-xs text-neutral-500">
                    available outbound:{' '}
                    <span className="tabular-nums text-neutral-900" data-numeric>
                      {formatCkb(result.bottleneck.availableOutbound)}
                    </span>
                  </p>
                ) : null}
              </CardBody>
            </Card>
          ) : null}

          {result?.hops && result.hops.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Route · {result.hops.length} hops</CardTitle>
              </CardHeader>
              <ul className="divide-y divide-outline">
                {result.hops.map((h, i) => {
                  const isBottleneck =
                    !!result.bottleneck?.channelOutpoint && h.channelOutpoint === result.bottleneck.channelOutpoint;
                  return (
                    <li key={`${h.pubkey}-${i}`} className="flex items-center gap-3 px-5 py-3 text-xs">
                      <span className="tabular-nums text-neutral-500" data-numeric>
                        {i + 1}
                      </span>
                      {isBottleneck ? <StatusDot tone="danger" /> : null}
                      <span className="min-w-0 flex-1 truncate font-mono text-neutral-700">{truncateId(h.pubkey)}</span>
                      {h.availableOutbound ? (
                        <span className="tabular-nums text-neutral-500" data-numeric>
                          {formatCkb(h.availableOutbound)}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
