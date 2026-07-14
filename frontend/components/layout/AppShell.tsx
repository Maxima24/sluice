'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { FiberLogo } from '@/components/brand/FiberLogo';
import { Header } from './Header';
import { LeftSidebar } from './LeftSidebar';
import { OperatorBootLoader } from './OperatorBootLoader';
import { OperatorPanel } from './OperatorPanel';
import { PageShell } from './PageShell';
import { ResizeHandle } from './ResizeHandle';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Workspace } from './Workspace';
import { fiberNav } from './nav';
import { LiveStatus } from '@/components/live-status';
import { useResizePanel } from '@/hooks/useResizePanel';
import { focusWorkspaceModule, type AppRouteKey, type WorkspaceModuleId } from '@/lib/workspace';

const operatorRoutes: Array<{ href: string; active: AppRouteKey; breadcrumb: string; moduleId: WorkspaceModuleId }> = [
  { href: '/', active: 'overview', breadcrumb: 'Liquidity Layer / Command Center', moduleId: 'network' },
  { href: '/network', active: 'network', breadcrumb: 'Liquidity Layer / Network', moduleId: 'network' },
  { href: '/channels', active: 'channels', breadcrumb: 'Liquidity Layer / Channels', moduleId: 'channels' },
  { href: '/liquidity', active: 'liquidity', breadcrumb: 'Liquidity Layer / Liquidity', moduleId: 'liquidity' },
  { href: '/probe', active: 'probe', breadcrumb: 'Liquidity Layer / Route Probe', moduleId: 'route-probe' },
  { href: '/rebalance', active: 'rebalance', breadcrumb: 'Liquidity Layer / Rebalancing', moduleId: 'rebalance' },
  { href: '/alerts', active: 'alerts', breadcrumb: 'Liquidity Layer / Alerts', moduleId: 'alerts' },
  { href: '/reconciliation', active: 'reconciliation', breadcrumb: 'Liquidity Layer / Audit Log', moduleId: 'reconciliation' },
];

function getOperatorRoute(pathname: string) {
  return operatorRoutes.find((route) => {
    if (route.href === '/') return pathname === '/';
    return pathname === route.href || pathname.startsWith(`${route.href}/`);
  });
}

function Brand() {
  return <FiberLogo showWordmark markClassName="h-8 w-8" />;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const operatorRoute = getOperatorRoute(pathname);

  if (pathname === '/loader-mock') {
    return <>{children}</>;
  }

  if (operatorRoute) {
    return (
      <OperatorWorkspaceShell active={operatorRoute.active} breadcrumb={operatorRoute.breadcrumb}>
        {children}
      </OperatorWorkspaceShell>
    );
  }

  return (
    <PageShell
      sidebar={<Sidebar brand={<Brand />} sections={fiberNav} />}
      topBar={<TopBar end={<LiveStatus />} />}
    >
      {children}
    </PageShell>
  );
}

function OperatorWorkspaceShell({
  active,
  breadcrumb,
  children,
}: {
  active: AppRouteKey;
  breadcrumb: string;
  children: ReactNode;
}) {
  const { width, startResize } = useResizePanel();
  const moduleId = operatorRoutes.find((route) => route.active === active)?.moduleId;
  const showWorkspace = useDesktopWorkspace();

  useEffect(() => {
    if (!moduleId) return;
    const frame = window.requestAnimationFrame(() => focusWorkspaceModule(moduleId));
    return () => window.cancelAnimationFrame(frame);
  }, [moduleId]);

  return (
    <div className="h-dvh w-screen overflow-hidden bg-shell-muted p-0 text-ink-editorial sm:p-4">
      <div className="relative flex h-full min-w-0 overflow-hidden rounded-none border-0 bg-shell p-0 sm:rounded-[36px] sm:border sm:border-line sm:p-1">
        <OperatorBootLoader />
        <LeftSidebar active={active} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-panel">
          <Header breadcrumb={breadcrumb} />
          <div className="m-1.5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] border border-line bg-panel sm:m-2 sm:rounded-[28px] lg:flex-row">
            {showWorkspace ? (
              <>
                <div className="hidden min-h-0 min-w-0 flex-1 lg:flex">
                  <Workspace />
                </div>
                <ResizeHandle onPointerDown={startResize} />
              </>
            ) : null}
            <OperatorPanel width={width}>
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={active}
                  data-testid="operator-panel-transition"
                  className="h-full min-h-0 overflow-hidden"
                  initial={{ opacity: 0, x: 22, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -14, filter: 'blur(8px)' }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </OperatorPanel>
          </div>
        </div>
      </div>
    </div>
  );
}

function useDesktopWorkspace() {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const sync = () => setMatches(query.matches);

    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return matches;
}
