'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ComponentType, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SidebarItem {
  label: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
  badge?: ReactNode;
  disabled?: boolean;
}

export interface SidebarSection {
  label?: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  brand: ReactNode;
  sections: SidebarSection[];
  footer?: ReactNode;
  className?: string;
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ brand, sections, footer, className }: SidebarProps) {
  const pathname = usePathname() ?? '/';
  return (
    <aside
      className={cn('flex h-full w-60 shrink-0 flex-col border-r border-outline bg-surface-container', className)}
    >
      <div className="flex h-14 shrink-0 items-center border-b border-outline-variant px-4">{brand}</div>
      <nav className="flex-1 overflow-y-auto py-3">
        {sections.map((section, sectionIdx) => (
          <div key={section.label ?? `section-${sectionIdx}`} className="mb-3 px-2">
            {section.label ? (
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                {section.label}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                if (item.disabled) {
                  return (
                    <li key={item.href}>
                      <span
                        aria-disabled
                        className="flex cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-neutral-500 opacity-60"
                      >
                        {Icon ? <Icon className="!h-4 !w-4 shrink-0 text-neutral-500" /> : null}
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge ? <span>{item.badge}</span> : null}
                      </span>
                    </li>
                  );
                }
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                        active
                          ? 'bg-accent-50 text-accent-700'
                          : 'text-neutral-600 hover:bg-surface-container-high hover:text-neutral-900',
                      )}
                    >
                      {Icon ? (
                        <Icon className={cn('!h-4 !w-4 shrink-0', active ? 'text-accent-700' : 'text-neutral-500')} />
                      ) : null}
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge ? <span>{item.badge}</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      {footer ? <div className="shrink-0 border-t border-outline-variant p-3">{footer}</div> : null}
    </aside>
  );
}
