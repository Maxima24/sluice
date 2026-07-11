import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TopBarProps {
  start?: ReactNode;
  end?: ReactNode;
  className?: string;
}

export function TopBar({ start, end, className }: TopBarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-outline bg-surface-container/80 px-6 backdrop-blur',
        className,
      )}
    >
      <div className="min-w-0 flex-1">{start}</div>
      <div className="flex items-center gap-3">{end}</div>
    </header>
  );
}
