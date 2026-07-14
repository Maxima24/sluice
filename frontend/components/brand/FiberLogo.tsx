import { cn } from '@/lib/utils';

interface FiberLogoProps {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
  tone?: 'light' | 'dark';
}

export function FiberLogo({ className, markClassName, wordmarkClassName, showWordmark = false, tone = 'dark' }: FiberLogoProps) {
  const dark = tone === 'dark';
  const background = dark ? '#0A0A0A' : '#FAFAF8';
  const foreground = dark ? '#FAFAF8' : '#0A0A0A';
  const rail = dark ? 'rgba(250,250,248,0.28)' : 'rgba(10,10,10,0.26)';
  const border = dark ? '#0A0A0A' : 'rgba(255,255,255,0.24)';

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <svg
        viewBox="0 0 64 64"
        role="img"
        aria-label="Fiber Liquidity Layer"
        className={cn('h-10 w-10 shrink-0', markClassName)}
      >
        <rect x="3" y="3" width="58" height="58" rx="16" fill={background} stroke={border} strokeWidth="4" />
        <path
          d="M27 13V51"
          fill="none"
          stroke={rail}
          strokeLinecap="square"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M38 13V51"
          fill="none"
          stroke={rail}
          strokeLinecap="square"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M16 18H33L48 32L33 46H16"
          fill="none"
          stroke={foreground}
          strokeLinecap="square"
          strokeLinejoin="miter"
          strokeWidth="5.5"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M16 32H48"
          fill="none"
          stroke={foreground}
          strokeLinecap="square"
          strokeWidth="5.5"
          vectorEffect="non-scaling-stroke"
        />
        <rect x="30" y="27" width="6" height="10" rx="1.5" fill={background} stroke={foreground} strokeWidth="2" />
        <circle cx="16" cy="18" r="3.25" fill={foreground} />
        <circle cx="16" cy="32" r="3.25" fill={foreground} />
        <circle cx="16" cy="46" r="3.25" fill={foreground} />
        <circle cx="48" cy="32" r="3.25" fill={foreground} />
      </svg>

      {showWordmark ? (
        <div className={cn('min-w-0 leading-tight', wordmarkClassName)}>
          <p className={cn('truncate text-sm font-black tracking-normal', dark ? 'text-ink-editorial' : 'text-white')}>Sluice</p>
          <p className={cn('mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.22em]', dark ? 'text-faint' : 'text-white/42')}>fiber liquidity OS</p>
        </div>
      ) : null}
    </div>
  );
}
