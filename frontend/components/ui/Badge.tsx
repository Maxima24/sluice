import { cva, type VariantProps } from 'class-variance-authority';
import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const badge = cva('inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium', {
  variants: {
    tone: {
      neutral: 'bg-surface-container-high text-neutral-700',
      success: 'bg-success-50 text-success-700',
      warning: 'bg-warning-50 text-warning-700',
      danger: 'bg-danger-50 text-danger-700',
      info: 'bg-info-50 text-info-700',
      accent: 'bg-accent-50 text-accent-700',
    },
    variant: {
      soft: '',
      outline: 'bg-transparent border',
    },
  },
  compoundVariants: [
    { variant: 'outline', tone: 'neutral', class: 'border-outline' },
    { variant: 'outline', tone: 'success', class: 'border-success-500/40' },
    { variant: 'outline', tone: 'warning', class: 'border-warning-500/40' },
    { variant: 'outline', tone: 'danger', class: 'border-danger-500/40' },
    { variant: 'outline', tone: 'info', class: 'border-info-500/40' },
    { variant: 'outline', tone: 'accent', class: 'border-accent-500/40' },
  ],
  defaultVariants: { tone: 'neutral', variant: 'soft' },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badge> {}

export function Badge({ className, tone, variant, ...rest }: BadgeProps) {
  return <span className={cn(badge({ tone, variant }), className)} {...rest} />;
}
