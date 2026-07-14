import { cn } from '@/lib/utils';

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-shimmer rounded-md bg-[length:200%_100%] bg-[linear-gradient(90deg,rgba(16,16,16,0.055)_0%,rgba(16,16,16,0.135)_48%,rgba(16,16,16,0.055)_100%)]',
        className,
      )}
    />
  );
}
