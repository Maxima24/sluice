'use client';

import Link from 'next/link';
import { Server } from 'lucide-react';
import { FiberLogo } from '@/components/brand/FiberLogo';
import { operatorNav, type AppRouteKey, focusWorkspaceModule } from '@/lib/workspace';
import { cn } from '@/lib/utils';

export function LeftSidebar({ active }: { active: AppRouteKey }) {
  return (
    <aside
      data-testid="left-sidebar"
      className="group/sidebar relative z-40 flex h-full w-[58px] shrink-0 flex-col overflow-hidden rounded-l-none border-r border-line bg-shell transition-[width] duration-300 ease-out sm:w-[72px] sm:rounded-l-[34px] lg:hover:w-[252px]"
    >
      <div className="flex h-14 items-center justify-center gap-3 border-b border-line px-2 sm:h-[72px] sm:px-4 lg:justify-start">
        <FiberLogo showWordmark markClassName="h-9 w-9 sm:h-10 sm:w-10" wordmarkClassName="hidden opacity-0 transition duration-200 lg:block lg:group-hover/sidebar:opacity-100" />
      </div>

      <nav className="flex flex-1 flex-col justify-center gap-1.5 overflow-y-auto px-2 py-3 sm:gap-2 sm:px-3 sm:py-4">
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
                'relative flex h-10 items-center justify-center gap-3 overflow-hidden rounded-[18px] border border-transparent px-2 text-sm transition sm:h-11 sm:rounded-[28px] sm:px-3 lg:justify-start',
                isActive ? 'border-ink-editorial bg-ink-editorial text-panel' : 'text-copy hover:border-line hover:bg-panel hover:text-ink-editorial',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="hidden truncate font-[var(--font-control)] text-[10px] font-semibold uppercase tracking-[0.18em] opacity-0 transition duration-200 lg:block lg:group-hover/sidebar:opacity-100">
                {item.label}
              </span>
              {isActive ? <span className="absolute right-2 h-1.5 w-1.5 rounded-full bg-panel group-hover/sidebar:right-3" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="m-2 flex h-10 items-center justify-center gap-3 rounded-[18px] border border-line bg-panel px-0 text-copy sm:m-3 sm:h-12 sm:rounded-[28px] lg:justify-start lg:px-3">
        <Server className="h-5 w-5 shrink-0" />
        <div className="hidden min-w-0 opacity-0 transition duration-200 lg:block lg:group-hover/sidebar:opacity-100">
          <p className="truncate font-[var(--font-control)] text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-editorial">NODE ALPHA</p>
          <p className="truncate font-[var(--font-control)] text-[9px] uppercase tracking-[0.22em] text-faint">NODE-ALPHA</p>
        </div>
      </div>
    </aside>
  );
}
