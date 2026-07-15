'use client';

import { type PointerEvent } from 'react';

export function ResizeHandle({ onPointerDown }: { onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      type="button"
      aria-label="Resize operator console"
      title="Drag to resize operator console"
      data-no-magnetic
      data-testid="resize-handle"
      onPointerDown={onPointerDown}
      className="group relative z-30 hidden w-5 shrink-0 cursor-col-resize border-x border-line bg-shell-muted/95 transition duration-200 hover:bg-shell active:bg-line lg:grid lg:place-items-center"
    >
      <span className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-line transition group-hover:bg-ink-editorial/35" />
      <span className="relative flex h-24 w-3 flex-col items-center justify-center gap-1.5 rounded-[16px] border border-line bg-panel text-faint transition group-hover:border-ink-editorial/35 group-hover:bg-ink-editorial group-hover:text-shell group-active:scale-95">
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="h-1 w-1 rounded-full bg-current" />
      </span>
    </button>
  );
}
