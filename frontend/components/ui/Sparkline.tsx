import { cn } from '@/lib/utils';

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  /** 'auto' colors red/green based on first vs last value. */
  tone?: 'auto' | 'positive' | 'negative' | 'neutral' | 'accent';
  className?: string;
  ariaLabel?: string;
}

const TONE_CLS: Record<NonNullable<Exclude<SparklineProps['tone'], 'auto'>>, string> = {
  positive: 'text-success-600',
  negative: 'text-danger-600',
  neutral: 'text-neutral-400',
  accent: 'text-accent-500',
};

/** Tiny dependency-free sparkline — for inline metric cards only. */
export function Sparkline({ data, width = 96, height = 28, tone = 'auto', className, ariaLabel }: SparklineProps) {
  if (data.length < 2) {
    return <div className={cn('h-7 w-24', className)} aria-hidden />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const resolvedTone =
    tone === 'auto' ? ((data[data.length - 1] ?? 0) >= (data[0] ?? 0) ? 'positive' : 'negative') : tone;

  return (
    <svg
      role="img"
      aria-label={ariaLabel ?? 'Trend sparkline'}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn(TONE_CLS[resolvedTone], className)}
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
