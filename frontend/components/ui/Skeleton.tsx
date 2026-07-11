import { cn } from '@/lib/utils';

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-shimmer rounded-md bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--color-neutral-100)_0%,var(--color-neutral-200)_50%,var(--color-neutral-100)_100%)]',
        className,
      )}
    />
  );
}
