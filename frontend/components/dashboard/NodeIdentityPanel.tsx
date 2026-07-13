import { Fragment, type ReactNode } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { truncateId } from '@/lib/format';
import type { NodeInfo } from '@/types/fiber';

export function NodeIdentityPanel({
  info,
  isPending,
  isError,
}: {
  info?: NodeInfo;
  isPending: boolean;
  isError: boolean;
}) {
  const rows: [string, ReactNode][] = info
    ? [
        ['Version', info.version],
        ['Node', info.nodeName || '—'],
        ['Pubkey', <span key="pubkey" className="font-mono">{truncateId(info.pubkey, 10, 8)}</span>],
        ['Chain', <span key="chain" className="font-mono">{truncateId(info.chainHash, 10, 8)}</span>],
        ['Addresses', String(info.addresses?.length ?? 0)],
      ]
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Node</CardTitle>
      </CardHeader>
      <div className="p-5">
        {isPending ? (
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : isError || !info ? (
          <p className="text-sm text-danger-600">Node unreachable.</p>
        ) : (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {rows.map(([k, v]) => (
              <Fragment key={k}>
                <dt className="text-neutral-500">{k}</dt>
                <dd className="min-w-0 truncate tabular-nums text-neutral-900" data-numeric>
                  {v}
                </dd>
              </Fragment>
            ))}
          </dl>
        )}
      </div>
    </Card>
  );
}
