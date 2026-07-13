'use client';

import { type PointerEvent } from 'react';

export function ResizeHandle({ onPointerDown }: { onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      type="button"
      aria-label="Resize operator console"
      data-testid="resize-handle"
      onPointerDown={onPointerDown}
      className="group relative z-30 w-3 shrink-0 cursor-col-resize border-x border-line bg-shell-muted transition hover:bg-line"
    >
      <span className="absolute left-1/2 top-1/2 h-16 w-px -translate-x-1/2 -translate-y-1/2 bg-faint transition group-hover:bg-ink-editorial" />
    </button>
  );
}
