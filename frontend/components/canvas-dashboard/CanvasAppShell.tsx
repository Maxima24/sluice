'use client';

import { type ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { OperatorPanel } from '@/components/layout/OperatorPanel';
import { ResizeHandle } from '@/components/layout/ResizeHandle';
import { Workspace } from '@/components/layout/Workspace';
import { useResizePanel } from '@/hooks/useResizePanel';
import { type AppRouteKey } from '@/lib/workspace';
import { cn } from '@/lib/utils';

export type CanvasRouteKey = AppRouteKey;

interface CanvasAppShellProps {
  active?: CanvasRouteKey;
  title?: string;
  breadcrumb?: string;
  children: ReactNode;
  rightPanel?: ReactNode;
  className?: string;
}

export function CanvasAppShell({
  active = 'overview',
  breadcrumb = 'Liquidity Layer / Operational Workspace',
  children,
  rightPanel,
}: CanvasAppShellProps) {
  const { width, startResize } = useResizePanel();

  return (
    <div className="h-screen w-screen overflow-hidden bg-shell text-ink-editorial">
      <div className="flex h-full">
        <LeftSidebar active={active} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header breadcrumb={breadcrumb} />
          <div className="flex min-h-0 flex-1">
            <Workspace />
            <ResizeHandle onPointerDown={startResize} />
            <OperatorPanel width={width}>
              {children}
              {rightPanel}
            </OperatorPanel>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CanvasWorkspace({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <main className={cn('h-full overflow-y-auto bg-panel p-6 text-ink-editorial', className)}>{children}</main>;
}

export function WorkspacePanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={cn('rounded-[6px] border border-line bg-panel p-4 text-ink-editorial', className)}>{children}</section>;
}

export function WorkspaceHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 border-b border-line pb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-faint">{eyebrow}</p>
          <h1 className="mt-2 truncate text-[clamp(2rem,4vw,3.75rem)] font-black leading-none tracking-[-0.035em] text-ink-editorial">{title}</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-copy">{description}</p>
        </div>
        {action}
      </div>
    </div>
  );
}
