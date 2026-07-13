'use client';

import { useState, type FormEvent } from 'react';
import { Bell, Command, Crosshair, Network, Search, ShieldCheck, Zap } from 'lucide-react';
import { focusWorkspaceModule, focusWorkspaceSearch } from '@/lib/workspace';

export function Header({ breadcrumb }: { breadcrumb: string }) {
  const [query, setQuery] = useState('');
  const [lastHit, setLastHit] = useState<string | null>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    const hit = focusWorkspaceSearch(query);
    setLastHit(hit ? hit.label : 'No target');
  }

  return (
    <header
      data-testid="top-bar"
      className="flex h-[72px] shrink-0 items-center gap-4 border-b border-line bg-shell px-5 text-ink-editorial"
    >
      <form onSubmit={submit} className="flex h-11 min-w-[260px] flex-1 items-center gap-3 rounded-[4px] border border-line bg-panel px-3 transition focus-within:border-ink-editorial">
        <Search className="h-4 w-4 text-faint" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search nodes, channels, routes..."
          className="min-w-0 flex-1 bg-transparent text-sm text-ink-editorial outline-none placeholder:text-faint"
        />
        <kbd className="hidden rounded-[2px] border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint md:block">Enter</kbd>
      </form>

      <div className="hidden items-center gap-2 rounded-[4px] border border-line bg-panel px-3 py-2 xl:flex">
        <Network className="h-4 w-4 text-copy" />
        <span className="font-mono text-xs text-copy">Node Alpha</span>
      </div>
      <div className="hidden items-center gap-2 rounded-[4px] border border-line bg-panel px-3 py-2 lg:flex">
        <ShieldCheck className="h-4 w-4 text-copy" />
        <span className="font-mono text-xs text-copy">CKB Fiber</span>
      </div>
      <button
        type="button"
        onClick={() => focusWorkspaceModule('route-probe')}
        className="hidden h-11 items-center gap-2 rounded-[4px] border border-ink-editorial bg-ink-editorial px-4 text-xs font-black uppercase tracking-[0.12em] text-panel transition hover:bg-ink-hover md:flex"
      >
        <Crosshair className="h-4 w-4" />
        Quick probe
      </button>
      <button type="button" className="relative flex h-11 w-11 items-center justify-center rounded-[4px] border border-line bg-panel text-copy transition hover:border-ink-editorial hover:text-ink-editorial">
        <Bell className="h-4 w-4" />
        <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-ink-editorial" />
      </button>
      <div className="hidden min-w-0 flex-col items-end 2xl:flex">
        <p className="truncate font-mono text-[10px] uppercase tracking-[0.24em] text-faint">{breadcrumb}</p>
        <p className="mt-1 truncate text-xs text-copy">{lastHit ?? 'Synchronized workspace'}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-[4px] border border-ink-editorial bg-ink-editorial text-panel">
        <Zap className="h-4 w-4" />
      </div>
      <Command className="hidden h-4 w-4 text-faint sm:block" />
    </header>
  );
}
