'use client';

import Link from 'next/link';
import { Hexagon, Plus, Server } from 'lucide-react';
import { operatorNav, type AppRouteKey, focusWorkspaceModule } from '@/lib/workspace';
import { cn } from '@/lib/utils';

export function LeftSidebar({ active }: { active: AppRouteKey }) {
  return (
    <aside
      data-testid="left-sidebar"
      className="group/sidebar relative z-40 flex h-screen w-[72px] shrink-0 flex-col border-r border-line bg-shell transition-[width] duration-300 ease-out hover:w-[252px]"
    >
      <div className="flex h-[72px] items-center gap-3 border-b border-line px-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] border border-ink-editorial bg-ink-editorial text-panel">
          <Hexagon className="h-5 w-5" />
        </div>
        <div className="min-w-0 opacity-0 transition duration-200 group-hover/sidebar:opacity-100">
          <p className="truncate text-sm font-black tracking-[-0.02em] text-ink-editorial">Fiber Liquidity</p>
          <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.22em] text-faint">mainnet operator</p>
        </div>
      </div>

      <button
        type="button"
        className="mx-4 mt-4 flex h-10 items-center justify-center gap-3 rounded-[4px] border border-line bg-panel text-ink-editorial transition hover:border-ink-editorial"
        onClick={() => focusWorkspaceModule('network')}
      >
        <Plus className="h-5 w-5 shrink-0" />
        <span className="hidden text-xs font-bold uppercase tracking-[0.12em] group-hover/sidebar:inline">New operation</span>
      </button>

      <nav className="mt-5 flex flex-1 flex-col gap-1 px-3">
        {operatorNav.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              onClick={() => {
                if (item.moduleId) focusWorkspaceModule(item.moduleId);
              }}
              className={cn(
                'relative flex h-11 items-center gap-3 overflow-hidden rounded-[4px] border border-transparent px-3 text-sm transition',
                isActive ? 'border-ink-editorial bg-ink-editorial text-panel' : 'text-copy hover:border-line hover:bg-panel hover:text-ink-editorial',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate font-mono text-[10px] uppercase tracking-[0.18em] opacity-0 transition duration-200 group-hover/sidebar:opacity-100">
                {item.label}
              </span>
              {isActive ? <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-panel group-hover/sidebar:right-3" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 flex h-12 items-center gap-3 rounded-[6px] border border-line bg-panel px-3 text-copy">
        <Server className="h-5 w-5 shrink-0" />
        <div className="min-w-0 opacity-0 transition duration-200 group-hover/sidebar:opacity-100">
          <p className="truncate text-xs font-bold text-ink-editorial">Node Alpha</p>
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-faint">node-alpha</p>
        </div>
      </div>
    </aside>
  );
}
