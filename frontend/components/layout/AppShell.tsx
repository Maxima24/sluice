'use client';

import { type ReactNode } from 'react';
import { Waypoints } from 'lucide-react';
import { PageShell } from './PageShell';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { fiberNav } from './nav';
import { LiveStatus } from '@/components/live-status';

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500 text-white">
        <Waypoints className="h-4 w-4" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-neutral-900">Fiber</p>
        <p className="text-[10px] uppercase tracking-wider text-neutral-500">Liquidity Layer</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <PageShell
      sidebar={<Sidebar brand={<Brand />} sections={fiberNav} />}
      topBar={<TopBar end={<LiveStatus />} />}
    >
      {children}
    </PageShell>
  );
}
