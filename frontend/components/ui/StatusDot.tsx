import { cn } from '@/lib/utils';
import type { StatusTone } from './types';

export interface StatusDotProps {
  tone: StatusTone;
  pulse?: boolean;
  className?: string;
}

const TONE: Record<StatusTone, string> = {
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-info-500',
  neutral: 'bg-neutral-400',
};

export function StatusDot({ tone, pulse, className }: StatusDotProps) {
  return (
    <span className={cn('relative inline-flex h-2 w-2', className)} aria-hidden>
      {pulse ? <span className={cn('absolute inset-0 animate-ping rounded-full opacity-60', TONE[tone])} /> : null}
      <span className={cn('relative inline-flex h-2 w-2 rounded-full', TONE[tone])} />
    </span>
  );
}
