import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PageShellProps {
  sidebar: ReactNode;
  topBar: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Constrained-viewport shell: sidebar + topbar pinned, only `<main>` scrolls. */
export function PageShell({ sidebar, topBar, children, className }: PageShellProps) {
  return (
    <div className={cn('flex h-screen overflow-hidden bg-surface', className)}>
      {sidebar}
      <div className="flex h-full min-w-0 flex-1 flex-col">
        {topBar}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
