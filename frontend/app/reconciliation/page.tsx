'use client';

import { ListChecks, ShieldAlert, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusDot } from '@/components/ui/StatusDot';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { cn } from '@/lib/utils';
import { useReconciliation } from '@/lib/queries/reconciliation';
import { formatCkb, truncateId } from '@/lib/format';

export default function ReconciliationPage() {
  const recon = useReconciliation();
  const data = recon.data;

  return (
    <div>
      <PageHeader
        title="Reconciliation"
        description="Snapshot vs node — drift is surfaced, never corrected (the node is always the source of truth)."
      />
      <div className="space-y-6 p-6">
        {recon.isError ? (
          <AlertBanner tone="danger" title="Reconciliation unavailable" description={(recon.error as Error)?.message} />
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Status</p>
              <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-neutral-900">
                {data ? (
                  data.inSync ? (
                    <>
                      <ShieldCheck className="h-6 w-6 text-success-500" /> In sync
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-6 w-6 text-warning-500" /> Drift
                    </>
                  )
                ) : (
                  '—'
                )}
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Tolerance</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-neutral-900" data-numeric>
                {data ? formatCkb(data.tolerance) : '—'}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Last checked</p>
              <p className="mt-2 text-sm text-neutral-700">
                {data ? new Date(data.checkedAt).toLocaleTimeString() : '—'}
              </p>
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Per-channel drift</CardTitle>
          </CardHeader>
          <div className="p-4">
            {recon.isPending ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : !data || data.channels.length === 0 ? (
              <EmptyState
                icon={<ListChecks className="h-5 w-5" />}
                title="Nothing to reconcile"
                description="No channels or snapshots yet."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-neutral-500">
                      <th className="px-3 py-2 font-medium">Channel</th>
                      <th className="px-3 py-2 text-right font-medium">Snapshot</th>
                      <th className="px-3 py-2 text-right font-medium">Node</th>
                      <th className="px-3 py-2 text-right font-medium">Drift</th>
                      <th className="px-3 py-2 font-medium">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline">
                    {data.channels.map((c) => (
                      <tr key={c.channelId}>
                        <td className="px-3 py-2.5 font-mono text-xs text-neutral-700">{truncateId(c.channelId)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-neutral-700" data-numeric>
                          {c.snapshotOutbound ? formatCkb(c.snapshotOutbound) : '—'}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-neutral-700" data-numeric>
                          {c.nodeOutbound ? formatCkb(c.nodeOutbound) : '—'}
                        </td>
                        <td
                          className={cn(
                            'px-3 py-2.5 text-right tabular-nums',
                            c.inSync ? 'text-neutral-500' : 'text-warning-600',
                          )}
                          data-numeric
                        >
                          {formatCkb(c.drift)}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-1.5 text-xs text-neutral-600">
                            <StatusDot tone={c.inSync ? 'success' : 'warning'} />
                            {c.inSync ? 'in sync' : 'drift'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
