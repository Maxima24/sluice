import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, leadingIcon, trailingIcon, ...rest },
  ref,
) {
  if (leadingIcon || trailingIcon) {
    return (
      <div
        className={cn(
          'flex h-9 items-center gap-2 rounded-md border border-outline bg-surface-container px-3 text-sm',
          'focus-within:border-accent-500 focus-within:ring-2 focus-within:ring-accent-500/20',
          invalid && 'border-danger-500 focus-within:border-danger-500 focus-within:ring-danger-500/20',
          className,
        )}
      >
        {leadingIcon ? <span className="text-neutral-400">{leadingIcon}</span> : null}
        <input
          ref={ref}
          className="min-w-0 flex-1 bg-transparent text-neutral-900 outline-none placeholder:text-neutral-400 disabled:opacity-50"
          aria-invalid={invalid || undefined}
          {...rest}
        />
        {trailingIcon ? <span className="text-neutral-400">{trailingIcon}</span> : null}
      </div>
    );
  }
  return (
    <input
      ref={ref}
      className={cn(
        'h-9 w-full rounded-md border border-outline bg-surface-container px-3 text-sm text-neutral-900 placeholder:text-neutral-400',
        'focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20',
        'disabled:opacity-50',
        invalid && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});
