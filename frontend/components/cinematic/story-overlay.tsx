'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowRight, FiCheckCircle, FiCircle, FiXCircle } from 'react-icons/fi';
import { STORY_BEATS } from './scene-config';
import type { CinematicData } from './types';

interface StoryOverlayProps extends CinematicData {
  progress: number;
  activeScene: number;
}

export function StoryOverlay({ progress, activeScene, info, health, reconciliation }: StoryOverlayProps) {
  const beat = STORY_BEATS[activeScene];
  const Icon = beat.icon;
  const channels = health?.channels ?? [];
  const readyCount = channels.filter((channel) => channel.state.toLowerCase().includes('ready')).length;
  const driftCount = reconciliation?.channels.filter((channel) => !channel.inSync).length ?? 0;
  const sceneProgress = clamp01(progress * STORY_BEATS.length - activeScene);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <TopHud activeScene={activeScene} infoName={info?.nodeName || shortKey(info?.pubkey) || 'FNN'} />

      <AnimatePresence mode="wait">
        <motion.section
          key={beat.id}
          initial={{ opacity: 0, y: 32, scale: 0.97, filter: 'blur(18px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -26, scale: 1.03, filter: 'blur(18px)' }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-5 top-[18vh] mx-auto max-w-[1120px] md:inset-x-10"
        >
          <div className={activeScene === 0 || activeScene === 7 ? 'mx-auto max-w-5xl text-center' : 'max-w-xl'}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100/70 shadow-[0_0_40px_rgba(55,175,255,0.1)]">
              <Icon className="h-4 w-4 text-cyan-200" />
              {beat.eyebrow}
            </div>
            <h1 className="text-balance text-5xl font-semibold leading-[0.95] text-white sm:text-6xl lg:text-8xl">
              {beat.title}
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-7 text-slate-200/72 sm:text-xl">
              {beat.subtitle}
            </p>
          </div>
        </motion.section>
      </AnimatePresence>

      <ScenePanel
        activeScene={activeScene}
        sceneProgress={sceneProgress}
        channels={channels}
        readyCount={readyCount}
        driftCount={driftCount}
        healthSource={health?.source ?? 'offline'}
        isStale={Boolean(health?.stale)}
      />

      <div className="absolute bottom-7 left-5 right-5 z-20 mx-auto flex max-w-6xl items-center gap-4 md:left-10 md:right-10">
        <div className="h-px flex-1 overflow-hidden rounded-full bg-white/10">
          <motion.span className="block h-full rounded-full bg-cyan-200" style={{ width: `${progress * 100}%` }} />
        </div>
        <span className="font-mono text-xs text-cyan-100/60">{String(activeScene + 1).padStart(2, '0')} / 08</span>
      </div>
    </div>
  );
}

function TopHud({ activeScene, infoName }: { activeScene: number; infoName: string }) {
  return (
    <header className="absolute left-5 right-5 top-5 z-20 flex items-center justify-between gap-4 md:left-8 md:right-8">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 backdrop-blur-xl">
        <span className="h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_20px_rgba(103,232,249,0.9)]" />
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-white/72">Sluice</span>
      </div>
      <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-slate-950/45 px-3 py-2 backdrop-blur-xl md:flex">
        {STORY_BEATS.map((beat, index) => (
          <span
            key={beat.id}
            className={[
              'h-1.5 rounded-full transition-all duration-500',
              index === activeScene ? 'w-8 bg-cyan-200' : index < activeScene ? 'w-3 bg-blue-300/70' : 'w-3 bg-white/18',
            ].join(' ')}
          />
        ))}
      </div>
      <div className="max-w-[42vw] truncate rounded-full border border-white/10 bg-slate-950/45 px-4 py-2 text-right font-mono text-xs text-white/60 backdrop-blur-xl">
        {infoName}
      </div>
    </header>
  );
}

function ScenePanel({
  activeScene,
  sceneProgress,
  channels,
  readyCount,
  driftCount,
  healthSource,
  isStale,
}: {
  activeScene: number;
  sceneProgress: number;
  channels: Array<{ channelId: string; peerPubkey: string; state: string; outbound: string; inbound: string; inboundRatio: number }>;
  readyCount: number;
  driftCount: number;
  healthSource: string;
  isStale: boolean;
}) {
  const panelPosition =
    activeScene === 0 || activeScene === 7
      ? 'bottom-[18vh] left-1/2 w-[min(92vw,760px)] -translate-x-1/2'
      : 'bottom-[14vh] right-5 w-[min(92vw,430px)] md:right-10';

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key={activeScene}
        initial={{ opacity: 0, x: activeScene % 2 ? 34 : -34, scale: 0.96, filter: 'blur(14px)' }}
        animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, x: activeScene % 2 ? -28 : 28, scale: 1.02, filter: 'blur(14px)' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`absolute ${panelPosition} rounded-lg border border-white/10 bg-slate-950/55 p-4 shadow-[0_32px_100px_rgba(0,0,0,0.42)] backdrop-blur-2xl md:p-5`}
      >
        {activeScene === 0 ? <HeroMetrics /> : null}
        {activeScene === 1 ? <NetworkMetrics channels={channels.length} readyCount={readyCount} healthSource={healthSource} /> : null}
        {activeScene === 2 ? <RiskPanel sceneProgress={sceneProgress} /> : null}
        {activeScene === 3 ? <FailurePanel /> : null}
        {activeScene === 4 ? <ProbePanel /> : null}
        {activeScene === 5 ? <RebalancePanel sceneProgress={sceneProgress} /> : null}
        {activeScene === 6 ? <DashboardPanel channels={channels.length} readyCount={readyCount} driftCount={driftCount} isStale={isStale} /> : null}
        {activeScene === 7 ? <ArchitecturePanel /> : null}
      </motion.aside>
    </AnimatePresence>
  );
}

function HeroMetrics() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <MiniMetric label="Observe" value="Liquidity" />
      <MiniMetric label="Predict" value="Routes" />
      <MiniMetric label="Restore" value="Balance" />
    </div>
  );
}

function NetworkMetrics({ channels, readyCount, healthSource }: { channels: number; readyCount: number; healthSource: string }) {
  return (
    <div className="grid gap-3">
      <MiniMetric label="Channel visibility" value={channels ? `${channels} channels` : 'Live graph'} />
      <MiniMetric label="Ready channels" value={String(readyCount)} />
      <MiniMetric label="Source" value={healthSource} />
    </div>
  );
}

function RiskPanel({ sceneProgress }: { sceneProgress: number }) {
  const outbound = Math.max(14, Math.round(76 - clamp01(sceneProgress) * 62));
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm uppercase tracking-[0.16em] text-orange-100/60">Outbound</span>
        <strong className="font-mono text-2xl text-orange-200">{outbound}%</strong>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <motion.span
          className="block h-full rounded-full bg-orange-400"
          animate={{ width: `${outbound}%`, backgroundColor: outbound < 25 ? '#ef4444' : '#fb923c' }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatusTile label="Warning" tone="warn" />
        <StatusTile label="Payment Risk" tone="danger" />
      </div>
    </div>
  );
}

function FailurePanel() {
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3 text-red-200">
        <FiXCircle className="h-6 w-6" />
        <strong className="text-2xl">Payment Failed</strong>
      </div>
      <p className="m-0 text-sm uppercase tracking-[0.16em] text-white/55">Insufficient Outbound Liquidity</p>
      <div className="h-px bg-gradient-to-r from-red-400 via-cyan-200/60 to-transparent" />
      <p className="m-0 text-sm text-slate-200/66">The bottleneck channel is highlighted inside the route.</p>
    </div>
  );
}

function ProbePanel() {
  return (
    <div className="grid gap-3">
      <MiniMetric label="Route confidence" value="92%" />
      <MiniMetric label="Estimated fee" value="0.003 CKB" />
      <MiniMetric label="Available capacity" value="healthy" />
      <div className="mt-2 flex items-center gap-2 text-cyan-100/70">
        <FiCheckCircle className="h-5 w-5" />
        <span className="text-sm">Successful route glows blue. Weak paths fade.</span>
      </div>
    </div>
  );
}

function RebalancePanel({ sceneProgress }: { sceneProgress: number }) {
  const restored = Math.round(clamp01(sceneProgress) * 100);
  return (
    <div className="grid gap-4">
      <Bar label="Overfunded" value={Math.max(38, 86 - restored * 0.35)} />
      <Bar label="Depleted" value={Math.min(76, 14 + restored * 0.62)} />
      <div className="rounded-lg border border-cyan-200/20 bg-cyan-200/10 px-4 py-3 text-cyan-100">Liquidity Restored</div>
    </div>
  );
}

function DashboardPanel({
  channels,
  readyCount,
  driftCount,
  isStale,
}: {
  channels: number;
  readyCount: number;
  driftCount: number;
  isStale: boolean;
}) {
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        <MiniMetric label="Channels" value={String(channels)} />
        <MiniMetric label="Ready" value={String(readyCount)} />
        <MiniMetric label="Drift" value={String(driftCount)} />
        <MiniMetric label="Freshness" value={isStale ? 'stale' : 'fresh'} />
      </div>
      <div className="mt-2 grid gap-2">
        {[68, 82, 47, 94].map((value, index) => (
          <div key={index} className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.span
              className="block h-full rounded-full bg-cyan-200"
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ duration: 0.9, delay: index * 0.08 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchitecturePanel() {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="grid gap-2 text-sm uppercase tracking-[0.18em] text-white/55 sm:grid-cols-3">
        <span>Operators</span>
        <span>Fiber RPC</span>
        <span>Production</span>
      </div>
      <button className="pointer-events-auto inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-6 font-semibold text-slate-950 transition hover:bg-cyan-100">
        Explore the dashboard
        <FiArrowRight />
      </button>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
      <span className="block text-xs uppercase tracking-[0.16em] text-white/45">{label}</span>
      <strong className="mt-1 block text-xl text-white">{value}</strong>
    </div>
  );
}

function StatusTile({ label, tone }: { label: string; tone: 'warn' | 'danger' }) {
  return (
    <div
      className={[
        'flex items-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold',
        tone === 'warn' ? 'border-orange-300/25 bg-orange-300/10 text-orange-100' : 'border-red-300/25 bg-red-300/10 text-red-100',
      ].join(' ')}
    >
      <FiCircle className="h-3 w-3 fill-current" />
      {label}
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-sm text-white/58">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
        <motion.span
          className="block h-full rounded-full bg-cyan-200"
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.55 }}
        />
      </div>
    </div>
  );
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function shortKey(value?: string | null) {
  if (!value) return '';
  if (value.length <= 14) return value;
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}
