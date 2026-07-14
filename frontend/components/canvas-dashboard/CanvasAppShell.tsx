'use client';

import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import Lenis from 'lenis';
import { type AppRouteKey } from '@/lib/workspace';
import { cn } from '@/lib/utils';

export type CanvasRouteKey = AppRouteKey;

interface CanvasAppShellProps {
  active?: CanvasRouteKey;
  title?: string;
  breadcrumb?: string;
  children: ReactNode;
  rightPanel?: ReactNode;
  className?: string;
}

export function CanvasAppShell({
  children,
  rightPanel,
}: CanvasAppShellProps) {
  return (
    <>
      {children}
      {rightPanel}
    </>
  );
}

export function CanvasWorkspace({ children, className = '' }: { children: ReactNode; className?: string }) {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      wrapper,
      content,
      eventsTarget: wrapper,
      smoothWheel: true,
      lerp: 0.11,
      wheelMultiplier: 0.86,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      overscroll: false,
      autoRaf: true,
    });

    const resizeObserver = new ResizeObserver(() => lenis.resize());
    resizeObserver.observe(wrapper);
    resizeObserver.observe(content);

    return () => {
      resizeObserver.disconnect();
      lenis.destroy();
    };
  }, []);

  return (
    <main
      ref={wrapperRef}
      className={cn(
        'operator-scrollbar h-full min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain bg-panel text-ink-editorial [-webkit-overflow-scrolling:touch] [contain:layout_paint] [scrollbar-gutter:stable]',
        className,
      )}
    >
      <div ref={contentRef} className="min-h-full p-3 sm:p-6">
        {children}
      </div>
    </main>
  );
}

const revealViewport = { once: false, amount: 0.18, margin: '-8% 0px -8% 0px' } as const;
const panelRevealHidden = { opacity: 0, y: 26, filter: 'blur(8px)' };
const panelRevealVisible = { opacity: 1, y: 0, filter: 'blur(0px)' };
const headerRevealHidden = { opacity: 0, y: 20, filter: 'blur(8px)' };
const headerRevealVisible = { opacity: 1, y: 0, filter: 'blur(0px)' };

export function WorkspacePanel({
  children,
  className = '',
  ...props
}: {
  children: ReactNode;
  className?: string;
} & Omit<HTMLMotionProps<'section'>, 'children' | 'className'>) {
  return (
    <motion.section
      className={cn('rounded-[22px] border border-line bg-panel p-3 text-ink-editorial sm:rounded-[28px] sm:p-4', className)}
      initial={panelRevealHidden}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      viewport={revealViewport}
      whileInView={panelRevealVisible}
      {...props}
    >
      {children}
    </motion.section>
  );
}

export function WorkspaceHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      className="mb-5 border-b border-line px-1 pb-5 pt-1 [container-type:inline-size] sm:mb-6 sm:px-2 sm:pb-6"
      initial={headerRevealHidden}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      viewport={revealViewport}
      whileInView={headerRevealVisible}
    >
      <div className="grid gap-5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-faint">{eyebrow}</p>
          <h1 data-display className="mt-2 text-[clamp(2.25rem,16cqw,3.45rem)] font-black leading-[0.9] text-ink-editorial">
            {title}
          </h1>
          <p className="mt-3 max-w-none text-sm leading-6 text-copy sm:mt-4 sm:leading-7">{description}</p>
        </div>
        {action ? <div className="flex justify-start sm:justify-end">{action}</div> : null}
      </div>
    </motion.div>
  );
}

interface WorkspaceActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  variant?: 'primary' | 'panel';
}

export function WorkspaceActionButton({
  children,
  className,
  icon,
  variant = 'primary',
  type = 'button',
  ...props
}: WorkspaceActionButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={cn(
        'hidden h-11 shrink-0 items-center gap-2 rounded-[22px] px-4 text-xs font-black uppercase tracking-[0.12em] transition sm:flex sm:rounded-[28px]',
        variant === 'primary'
          ? 'border border-ink-editorial bg-ink-editorial text-panel hover:bg-ink-hover'
          : 'border border-line bg-panel text-ink-editorial hover:border-ink-editorial',
        className,
      )}
    >
      {icon ? <span className="flex h-4 w-4 shrink-0 items-center justify-center">{icon}</span> : null}
      <span className="relative z-10 whitespace-nowrap">{children}</span>
    </button>
  );
}
