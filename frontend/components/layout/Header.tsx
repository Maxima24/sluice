'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cable, Check, Crosshair, LogOut, Network, Search, Wallet, X } from 'lucide-react';
import { ccc } from '@ckb-ccc/connector-react';
import { focusWorkspaceModule, focusWorkspaceSearch } from '@/lib/workspace';
import { useOperatorSession } from '@/lib/auth';
import { truncateId } from '@/lib/format';
import { cn } from '@/lib/utils';

export function Header({ breadcrumb }: { breadcrumb: string }) {
  const [query, setQuery] = useState('');
  const [lastHit, setLastHit] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    const hit = focusWorkspaceSearch(query);
    setLastHit(hit ? hit.label : 'No target');
  }

  const currentArea = breadcrumb.split('/').at(-1)?.trim() ?? 'Command Center';

  return (
    <header
      data-testid="top-bar"
      className="relative flex h-14 shrink-0 items-center gap-2 border-b border-line bg-panel px-2.5 text-ink-editorial sm:h-[72px] sm:gap-3 sm:px-5"
    >
      <div className="min-w-0 flex-1 lg:hidden">
        <p className="truncate font-[var(--font-control)] text-[9px] uppercase tracking-[0.24em] text-faint">{currentArea}</p>
        <p className="mt-0.5 truncate font-[var(--font-body)] text-[11px] text-copy">{lastHit ?? 'Synchronized'}</p>
      </div>

      <div className="hidden min-w-0 flex-col lg:flex">
        <p className="truncate font-[var(--font-control)] text-[10px] uppercase tracking-[0.28em] text-faint">{breadcrumb}</p>
        <p className="mt-1 truncate font-[var(--font-body)] text-xs text-copy">{lastHit ?? 'Workspace synchronized'}</p>
      </div>

      <div className="ml-auto flex min-w-0 items-center justify-end gap-2">
        <HeaderChip icon={<Network className="h-3.5 w-3.5" />} label="Node Alpha" min="md" />
        <HeaderChip icon={<Cable className="h-3.5 w-3.5" />} label="CKB Fiber" min="xl" />

        <WalletControl />

        <button
          type="button"
          aria-label={searchOpen ? 'Close search' : 'Open search'}
          aria-expanded={searchOpen}
          onClick={() => setSearchOpen((open) => !open)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[18px] border border-line bg-shell text-copy transition hover:border-ink-editorial hover:text-ink-editorial sm:h-10 sm:w-10 sm:rounded-[28px]"
        >
          <Search className="h-4 w-4" />
        </button>

        <AnimatePresence initial={false}>
          {searchOpen ? (
            <motion.form
              key="header-search"
              onSubmit={submit}
              className="absolute right-12 top-1/2 z-20 flex h-9 max-w-full shrink origin-left -translate-y-1/2 items-center gap-2 overflow-hidden rounded-[18px] border border-line bg-shell px-3 transition focus-within:border-ink-editorial sm:static sm:h-10 sm:translate-y-0 sm:rounded-[28px]"
              initial={{ width: 0, opacity: 0, scaleX: 0.82, filter: 'blur(8px)' }}
              animate={{ width: 'min(280px, calc(100vw - 8rem))', opacity: 1, scaleX: 1, filter: 'blur(0px)' }}
              exit={{ width: 0, opacity: 0, scaleX: 0.82, filter: 'blur(8px)' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search node, channel, route..."
                className="min-w-0 flex-1 bg-transparent text-xs text-ink-editorial outline-none placeholder:text-faint"
              />
              <kbd className="hidden rounded-[12px] border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint 2xl:block">
                Enter
              </kbd>
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[18px] text-faint transition hover:bg-shell-muted hover:text-ink-editorial sm:rounded-[28px]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.form>
          ) : null}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => focusWorkspaceModule('route-probe')}
          className="hidden h-10 items-center gap-2 rounded-[28px] border border-ink-editorial bg-ink-editorial px-3 text-xs font-black uppercase tracking-[0.12em] text-panel transition hover:bg-ink-hover md:flex"
        >
          <Crosshair className="h-4 w-4" />
          <span>Quick probe</span>
        </button>
      </div>
    </header>
  );
}

function WalletControl() {
  const { open } = ccc.useCcc();
  const signer = ccc.useSigner();
  const { session, signIn, signOut } = useOperatorSession();
  const [address, setAddress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!signer) return;
    let alive = true;
    signer
      .getRecommendedAddress()
      .then((addr) => alive && setAddress(addr))
      .catch(() => alive && setAddress(null));
    return () => {
      alive = false;
    };
  }, [signer]);

  async function handleSignIn() {
    if (!signer) return;
    setBusy(true);
    setError(null);
    try {
      await signIn(signer);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Not connected → open the CCC connect modal (JoyID + others).
  if (!signer) {
    return (
      <button
        type="button"
        onClick={() => open()}
        className="flex h-9 shrink-0 items-center gap-2 rounded-[28px] border border-line bg-shell px-3 text-xs font-black uppercase tracking-[0.12em] text-ink-editorial transition hover:border-ink-editorial sm:h-10"
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">Connect</span>
      </button>
    );
  }

  // Connected + signed in → operator identity + sign out.
  if (session) {
    return (
      <div className="flex shrink-0 items-center gap-1.5">
        <div className="hidden h-10 items-center gap-2 rounded-[28px] border border-ink-editorial bg-shell px-3 text-ink-editorial md:flex">
          <Check className="h-3.5 w-3.5" />
          <span className="font-mono text-[10px] uppercase tracking-[0.16em]">{truncateId(session.address, 6, 4)}</span>
        </div>
        <button
          type="button"
          aria-label="Sign out"
          onClick={signOut}
          className="flex h-9 w-9 items-center justify-center rounded-[28px] border border-line bg-shell text-copy transition hover:border-ink-editorial hover:text-ink-editorial sm:h-10 sm:w-10"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Connected, not yet signed in → address + sign-in.
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {address ? (
        <div className="hidden h-10 items-center gap-2 rounded-[28px] border border-line bg-shell px-3 text-copy lg:flex">
          <Wallet className="h-3.5 w-3.5" />
          <span className="font-mono text-[10px] uppercase tracking-[0.16em]">{truncateId(address, 6, 4)}</span>
        </div>
      ) : null}
      <button
        type="button"
        onClick={handleSignIn}
        disabled={busy}
        title={error ?? undefined}
        className="flex h-9 items-center gap-2 rounded-[28px] border border-ink-editorial bg-ink-editorial px-3 text-xs font-black uppercase tracking-[0.12em] text-panel transition hover:bg-ink-hover disabled:opacity-55 sm:h-10"
      >
        <Wallet className="h-4 w-4" />
        <span>{busy ? 'Signing…' : 'Sign in'}</span>
      </button>
    </div>
  );
}

function HeaderChip({ icon, label, min }: { icon: ReactNode; label: string; min: 'md' | 'xl' }) {
  return (
    <div
      className={cn(
        'hidden h-10 items-center gap-2 rounded-[28px] border border-line bg-shell px-3 text-copy',
        min === 'md' ? 'md:flex' : 'xl:flex',
      )}
    >
      {icon}
      <span className="font-[var(--font-control)] text-[10px] font-semibold uppercase tracking-[0.18em]">{label}</span>
    </div>
  );
}
