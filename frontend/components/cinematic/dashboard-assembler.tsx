'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import {
  FiActivity,
  FiArrowUpRight,
  FiDatabase,
  FiGitBranch,
  FiRefreshCw,
  FiSearch,
  FiServer,
  FiShield,
} from 'react-icons/fi';
import { FiberLogo } from '@/components/brand/FiberLogo';
import { LiveStatus } from '@/components/live-status';
import { formatCkb, formatPercent, sumShannon, truncateId } from '@/lib/format';
import type { ChannelHealthDto } from '@/types/fiber';
import type { CinematicData } from './types';

interface DashboardAssemblerProps extends CinematicData {
  nodePending: boolean;
  nodeError: boolean;
  healthPending: boolean;
}

export function DashboardAssembler({
  info,
  health,
  reconciliation,
  nodePending,
  nodeError,
  healthPending,
}: DashboardAssemblerProps) {
  const channels = health?.channels ?? [];
  const readyCount = channels.filter((channel) => channel.state === 'ChannelReady').length;
  const live = health?.source === 'live' && !health.stale && !nodeError;
  const statusLabel = nodeError ? 'Offline' : live ? 'Online' : health?.stale ? 'Degraded' : 'Syncing';
  const outbound = channels.length ? formatCkb(sumShannon(channels.map((channel) => channel.outbound))) : '0 CKB';
  const inbound = channels.length ? formatCkb(sumShannon(channels.map((channel) => channel.inbound))) : '0 CKB';
  const driftCount = reconciliation?.channels.filter((channel) => !channel.inSync).length ?? 0;

  return (
    <section id="dashboard" className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-white/18" />
      <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,0.42)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.42)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="relative mx-auto grid min-h-screen w-full max-w-[1500px] gap-0 lg:grid-cols-[248px_1fr]">
        <DashboardSidebar />

        <div className="min-w-0 border-white/10 lg:border-l">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-black/82 px-5 py-4 backdrop-blur-xl md:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/42">System Ready</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-normal text-white md:text-4xl">Fiber Liquidity Layer</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="border border-white/10 bg-white/[0.03] px-3 py-2">
                  <LiveStatus />
                </div>
                <DashboardAction href="/probe" icon={<FiSearch className="h-4 w-4" />} label="Probe" />
                <DashboardAction href="/rebalance" icon={<FiRefreshCw className="h-4 w-4" />} label="Rebalance" />
              </div>
            </div>
          </header>

          <main className="space-y-6 px-5 py-6 md:px-8 md:py-8">
            <motion.div
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
              initial={{ opacity: 0, y: 28, filter: 'blur(12px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            >
              <OperatorMetric label="Node status" value={statusLabel} detail={info?.version ? `v${info.version}` : 'Fiber node'} />
              <OperatorMetric label="Channels" value={String(channels.length)} detail={`${readyCount} ready`} />
              <OperatorMetric label="Outbound" value={outbound} detail="can send" />
              <OperatorMetric label="Inbound" value={inbound} detail="can receive" />
            </motion.div>

            <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
              <motion.div
                className="border border-white/10 bg-white/[0.025]"
                initial={{ opacity: 0, y: 34, filter: 'blur(14px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.78, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <PanelHeader
                  icon={<FiGitBranch className="h-4 w-4" />}
                  title="Channel Matrix"
                  meta={health ? `${health.source}${health.stale ? ' stale' : ''}` : 'awaiting state'}
                />
                <ChannelMatrix channels={channels} isPending={healthPending} />
              </motion.div>

              <div className="grid gap-6">
                <motion.div
                  className="border border-white/10 bg-white/[0.025]"
                  initial={{ opacity: 0, x: 28, filter: 'blur(14px)' }}
                  whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.72, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  <PanelHeader icon={<FiServer className="h-4 w-4" />} title="Node Identity" meta={nodePending ? 'resolving' : statusLabel} />
                  <NodePanel info={info} nodeError={nodeError} />
                </motion.div>

                <motion.div
                  className="border border-white/10 bg-white/[0.025]"
                  initial={{ opacity: 0, x: 28, filter: 'blur(14px)' }}
                  whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.72, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  <PanelHeader icon={<FiShield className="h-4 w-4" />} title="Reconciliation" meta={reconciliation?.inSync ? 'in sync' : 'watching'} />
                  <ReconciliationPanel driftCount={driftCount} checkedAt={reconciliation?.checkedAt} tolerance={reconciliation?.tolerance} />
                </motion.div>
              </div>
            </div>

            <motion.div
              className="grid gap-6 lg:grid-cols-3"
              initial={{ opacity: 0, y: 34, filter: 'blur(14px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.78, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              <WorkflowLink
                href="/probe"
                icon={<FiSearch className="h-5 w-5" />}
                title="Can I Pay?"
                body="Evaluate route confidence, bottlenecks, fee, and capacity before sending."
              />
              <WorkflowLink
                href="/rebalance"
                icon={<FiRefreshCw className="h-5 w-5" />}
                title="Rebalance"
                body="Move liquidity from overfunded channels into depleted channels."
              />
              <WorkflowLink
                href="/reconciliation"
                icon={<FiDatabase className="h-5 w-5" />}
                title="Reconciliation"
                body="Compare live node balances against stored channel snapshots."
              />
            </motion.div>
          </main>
        </div>
      </div>
    </section>
  );
}

function DashboardSidebar() {
  const items = [
    { label: 'Overview', href: '#dashboard', icon: FiActivity },
    { label: 'Probe', href: '/probe', icon: FiSearch },
    { label: 'Rebalance', href: '/rebalance', icon: FiRefreshCw },
    { label: 'Reconciliation', href: '/reconciliation', icon: FiDatabase },
  ];

  return (
    <aside className="border-b border-white/10 bg-black/84 p-5 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:p-6">
      <div className="mb-8 flex items-center gap-3">
        <FiberLogo tone="light" showWordmark />
      </div>
      <nav className="grid gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between border border-white/10 bg-white/[0.025] px-3 py-3 text-sm text-white/62 transition hover:border-white/22 hover:bg-white/[0.06] hover:text-white"
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              <FiArrowUpRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function DashboardAction({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center gap-2 border border-white/14 bg-white px-4 text-sm font-medium text-black transition hover:bg-white/86"
    >
      {icon}
      {label}
    </Link>
  );
}

function OperatorMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="border border-white/10 bg-white/[0.035] p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-3 truncate text-2xl font-semibold text-white" data-numeric>
        {value}
      </p>
      <p className="mt-2 truncate text-sm text-white/46">{detail}</p>
    </div>
  );
}

function PanelHeader({ icon, title, meta }: { icon: ReactNode; title: string; meta: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-white/62">{icon}</span>
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/74">{title}</h3>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/38">{meta}</span>
    </div>
  );
}

function ChannelMatrix({ channels, isPending }: { channels: ChannelHealthDto[]; isPending: boolean }) {
  if (isPending) {
    return (
      <div className="grid gap-3 p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-16 animate-pulse bg-white/[0.055]" />
        ))}
      </div>
    );
  }

  if (!channels.length) {
    return (
      <div className="p-6">
        <div className="border border-white/10 bg-white/[0.03] p-5">
          <p className="text-lg font-semibold text-white">No channels detected</p>
          <p className="mt-2 text-sm text-white/48">The dashboard is waiting for live Fiber channel state.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/10">
      {channels.slice(0, 8).map((channel) => (
        <ChannelRow key={channel.channelId} channel={channel} />
      ))}
    </div>
  );
}

function ChannelRow({ channel }: { channel: ChannelHealthDto }) {
  const outPct = clamp01(1 - channel.inboundRatio) * 50;
  const inPct = clamp01(channel.inboundRatio) * 50;
  const status = channelStatus(channel);

  return (
    <div className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(0,1fr)_210px] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-white/42">{truncateId(channel.peerPubkey)}</span>
          <span className="border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/54">{status}</span>
          {channel.isUdt ? (
            <span className="border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white/54">UDT</span>
          ) : null}
        </div>
        <p className="mt-2 truncate font-mono text-[11px] text-white/32">{truncateId(channel.channelId, 12, 8)}</p>
        <div className="mt-3 h-2 overflow-hidden bg-white/10">
          <div className="relative h-full">
            <span className="absolute inset-y-0 right-1/2 bg-white/80" style={{ width: `${outPct}%` }} />
            <span className="absolute inset-y-0 left-1/2 bg-white/38" style={{ width: `${inPct}%` }} />
            <span className="absolute inset-y-0 left-1/2 w-px bg-black" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-right">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/34">Outbound</p>
          <p className="mt-1 text-sm text-white">{formatCkb(channel.outbound, { withUnit: !channel.isUdt })}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/34">Inbound</p>
          <p className="mt-1 text-sm text-white/68">{formatCkb(channel.inbound, { withUnit: !channel.isUdt })}</p>
        </div>
      </div>
    </div>
  );
}

function NodePanel({ info, nodeError }: { info: CinematicData['info']; nodeError: boolean }) {
  if (nodeError) {
    return (
      <div className="p-4">
        <div className="border border-white/10 bg-white/[0.03] p-4 text-white/58">Node unreachable</div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 p-4">
      <DataLine label="Pubkey" value={info?.pubkey ? truncateId(info.pubkey, 12, 8) : 'Awaiting node'} />
      <DataLine label="Chain" value={info?.chainHash ? truncateId(info.chainHash, 10, 8) : 'Unknown'} />
      <DataLine label="Version" value={info?.version ?? 'Unknown'} />
      <DataLine label="Addresses" value={info?.addresses?.length ? String(info.addresses.length) : '0'} />
    </div>
  );
}

function ReconciliationPanel({
  driftCount,
  checkedAt,
  tolerance,
}: {
  driftCount: number;
  checkedAt?: string;
  tolerance?: string;
}) {
  return (
    <div className="grid gap-3 p-4">
      <DataLine label="Drift" value={String(driftCount)} />
      <DataLine label="Tolerance" value={tolerance ?? 'Unknown'} />
      <DataLine label="Checked" value={checkedAt ? new Date(checkedAt).toLocaleTimeString() : 'Pending'} />
    </div>
  );
}

function WorkflowLink({ href, icon, title, body }: { href: string; icon: ReactNode; title: string; body: string }) {
  return (
    <Link
      href={href}
      className="group border border-white/10 bg-white/[0.025] p-5 transition hover:border-white/24 hover:bg-white/[0.06]"
    >
      <div className="mb-5 flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center border border-white/12 bg-white/[0.04] text-white/70">{icon}</span>
        <FiArrowUpRight className="h-5 w-5 text-white/28 transition group-hover:text-white/78" />
      </div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/48">{body}</p>
    </Link>
  );
}

function DataLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border border-white/10 bg-white/[0.025] px-3 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/34">{label}</span>
      <span className="truncate text-right text-sm text-white/68" data-numeric>
        {value}
      </span>
    </div>
  );
}

function channelStatus(channel: ChannelHealthDto) {
  if (channel.state !== 'ChannelReady') return channel.state;

  const distance = Math.abs(channel.inboundRatio - 0.5);
  if (distance > 0.42) return 'Critical';
  if (distance > 0.28) return 'Warning';
  return formatPercent(1 - distance * 2, 0);
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}
