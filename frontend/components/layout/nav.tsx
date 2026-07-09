import { Gauge, Radar, Scale, ListChecks } from 'lucide-react';
import type { SidebarSection } from './Sidebar';

export const fiberNav: SidebarSection[] = [
  {
    items: [
      { label: 'Overview', href: '/', icon: Gauge },
      { label: 'Probe', href: '/probe', icon: Radar },
      { label: 'Rebalance', href: '/rebalance', icon: Scale },
      { label: 'Reconciliation', href: '/reconciliation', icon: ListChecks },
    ],
  },
];
