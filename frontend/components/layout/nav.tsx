import { Gauge, Radar, Scale, ListChecks } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { SidebarSection } from './Sidebar';

const soon = <Badge tone="neutral">Soon</Badge>;

export const fiberNav: SidebarSection[] = [
  {
    items: [
      { label: 'Overview', href: '/', icon: Gauge },
      { label: 'Probe', href: '/probe', icon: Radar },
    ],
  },
  {
    label: 'Coming soon',
    items: [
      { label: 'Rebalance', href: '/rebalance', icon: Scale, disabled: true, badge: soon },
      { label: 'Reconciliation', href: '/reconciliation', icon: ListChecks, disabled: true, badge: soon },
    ],
  },
];
