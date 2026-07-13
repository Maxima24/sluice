'use client';

import { type ReactNode } from 'react';

export function OperatorPanel({ width, children }: { width: number; children: ReactNode }) {
  return (
    <aside
      data-testid="operator-panel"
      className="h-full shrink-0 overflow-hidden border-l border-line bg-panel text-ink-editorial"
      style={{ width }}
    >
      {children}
    </aside>
  );
}
