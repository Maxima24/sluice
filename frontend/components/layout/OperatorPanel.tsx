'use client';

import { type CSSProperties, type ReactNode } from 'react';

export function OperatorPanel({ width, children }: { width: number; children: ReactNode }) {
  return (
    <aside
      data-testid="operator-panel"
      className="min-h-0 w-full flex-1 overflow-hidden bg-panel text-ink-editorial lg:h-full lg:w-[var(--operator-panel-width)] lg:flex-none lg:border-l lg:border-t-0"
      style={{ '--operator-panel-width': `${width}px` } as CSSProperties}
    >
      {children}
    </aside>
  );
}
