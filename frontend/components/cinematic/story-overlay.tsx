'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiCircle, FiCpu, FiLayers, FiMinus, FiXCircle } from 'react-icons/fi';
import { formatCkb, sumShannon, truncateId } from '@/lib/format';
import { SCENE_COUNT, STORY_BEATS } from './scene-config';
import type { CinematicData } from './types';

interface StoryOverlayProps extends CinematicData {
  progress: number;
  activeScene: number;
}

export function StoryOverlay({ progress, activeScene, info, health, reconciliation }: StoryOverlayProps) {
  const beat = STORY_BEATS[activeScene] ?? STORY_BEATS[0];
  const Icon = beat.icon;
  const channels = health?.channels ?? [];
  const readyCount = channels.filter((channel) => channel.state.toLowerCase().includes('ready')).length;
  const driftCount = reconciliation?.channels.filter((channel) => !channel.inSync).length ?? 0;
  const outbound = channels.length ? formatCkb(sumShannon(channels.map((channel) => channel.outbound))) : '0 CKB';
  const inbound = channels.length ? formatCkb(sumShannon(channels.map((channel) => channel.inbound))) : '0 CKB';
  const sceneProgress = clamp01(progress * SCENE_COUNT - activeScene);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <TopHud activeScene={activeScene} infoName={info?.nodeName || shortKey(info?.pubkey) || 'FNN'} />

      <AnimatePresence mode="wait">
        <motion.section
          key={beat.id}
          initial={{ opacity: 0, y: 34, scale: 0.97, filter: 'blur(18px)' }}
          animate={{ opacity: activeScene === SCENE_COUNT - 1 ? 0.68 : 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -28, scale: 1.03, filter: 'blur(18px)' }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-5 top-[15vh] mx-auto max-w-[1120px] md:inset-x-10"
        >
          <div className={activeScene === 0 ? 'mx-auto max-w-5xl text-center' : 'max-w-xl'}>
            <div className="mb-5 inline-flex items-center gap-2 border border-white/10 bg-black/42 px-3 py-2 text-xs uppercase tracking-[0.22em] text-white/62 backdrop-blur-xl">
              <Icon className="h-4 w-4 text-white/78" />
              {beat.eyebrow}
            </div>
            <h1 className="text-balance text-5xl font-semibold leading-[0.94] text-white sm:text-6xl lg:text-8xl">
              {beat.title}
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-7 text-white/62 sm:text-xl">{beat.subtitle}</p>
          </div>
        </motion.section>
      </AnimatePresence>

      <ScenePanel
        activeScene={activeScene}
        sceneProgress={sceneProgress}
        channels={channels.length}
        readyCount={readyCount}
        driftCount={driftCount}
        outbound={outbound}
        inbound={inbound}
        healthSource={health?.source ?? 'offline'}
        isStale={Boolean(health?.stale)}
      />

      <div className="absolute bottom-7 left-5 right-5 z-20 mx-auto flex max-w-6xl items-center justify-between gap-4 md:left-10 md:right-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/38">Fiber OS</span>
        <span className="font-mono text-xs text-white/46">
          {String(activeScene + 1).padStart(2, '0')} / {String(SCENE_COUNT).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

function TopHud({ activeScene, infoName }: { activeScene: number; infoName: string }) {
  return (
    <header className="absolute left-5 right-5 top-5 z-20 flex items-center justify-between gap-4 md:left-8 md:right-8">
      <div className="flex items-center gap-3 border border-white/10 bg-black/50 px-4 py-2 backdrop-blur-xl">
        <span className="h-2 w-2 bg-white shadow-[0_0_20px_rgba(255,255,255,0.34)]" />
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/72">Sluice</span>
      </div>
      <div className="hidden items-center gap-2 border border-white/10 bg-black/42 px-3 py-2 backdrop-blur-xl md:flex">
        {STORY_BEATS.map((beat, index) => (
          <span
            key={beat.id}
            className={[
              'h-1.5 transition-all duration-500',
              index === activeScene ? 'w-8 bg-white/72' : index < activeScene ? 'w-3 bg-white/44' : 'w-3 bg-white/16',
            ].join(' ')}
          />
        ))}
      </div>
      <div className="max-w-[42vw] truncate border border-white/10 bg-black/42 px-4 py-2 text-right font-mono text-xs text-white/54 backdrop-blur-xl">
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
  outbound,
  inbound,
  healthSource,
  isStale,
}: {
  activeScene: number;
  sceneProgress: number;
  channels: number;
  readyCount: number;
  driftCount: number;
  outbound: string;
  inbound: string;
  healthSource: string;
  isStale: boolean;
}) {
  const panelPosition =
    activeScene === 0
      ? 'bottom-[17vh] left-1/2 w-[min(92vw,760px)] -translate-x-1/2'
      : activeScene === SCENE_COUNT - 1
        ? 'bottom-[11vh] left-1/2 w-[min(92vw,980px)] -translate-x-1/2'
        : 'bottom-[13vh] right-5 w-[min(92vw,430px)] md:right-10';

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key={activeScene}
        initial={{ opacity: 0, x: activeScene % 2 ? 34 : -34, scale: 0.96, filter: 'blur(14px)' }}
        animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, x: activeScene % 2 ? -28 : 28, scale: 1.02, filter: 'blur(14px)' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`absolute ${panelPosition} border border-white/10 bg-black/58 p-4 shadow-[0_32px_100px_rgba(0,0,0,0.58)] backdrop-blur-2xl md:p-5`}
      >
        {activeScene === 0 ? <HeroMetrics /> : null}
        {activeScene === 1 ? (
          <NetworkMetrics
            channels={channels}
            readyCount={readyCount}
            healthSource={healthSource}
            outbound={outbound}
            inbound={inbound}
          />
        ) : null}
        {activeScene === 2 ? <DrainPanel sceneProgress={sceneProgress} /> : null}
        {activeScene === 3 ? <ProbePanel /> : null}
        {activeScene === 4 ? <RebalancePanel sceneProgress={sceneProgress} /> : null}
        {activeScene === 5 ? (
          <DashboardAssemblyPanel channels={channels} readyCount={readyCount} driftCount={driftCount} isStale={isStale} />
        ) : null}
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

function NetworkMetrics({
  channels,
  readyCount,
  healthSource,
  outbound,
  inbound,
}: {
  channels: number;
  readyCount: number;
  healthSource: string;
  outbound: string;
  inbound: string;
}) {
  return (
    <div className="grid gap-3">
      <MiniMetric label="Channels" value={channels ? String(channels) : 'Graph'} />
      <MiniMetric label="Ready" value={String(readyCount)} />
      <MiniMetric label="Outbound" value={outbound} />
      <MiniMetric label="Inbound" value={inbound} />
      <MiniMetric label="Source" value={healthSource} />
    </div>
  );
}

function DrainPanel({ sceneProgress }: { sceneProgress: number }) {
  const outbound = Math.max(12, Math.round(78 - clamp01(sceneProgress) * 66));
  const status = outbound < 24 ? 'Critical' : outbound < 48 ? 'Warning' : 'Healthy';

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm uppercase tracking-[0.18em] text-white/48">Outbound</span>
        <strong className="font-mono text-2xl text-white">{outbound}%</strong>
      </div>
      <div className="h-3 overflow-hidden bg-white/10">
        <motion.span
          className="block h-full bg-white"
          animate={{ width: `${outbound}%`, opacity: outbound < 24 ? 0.34 : outbound < 48 ? 0.58 : 0.86 }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {['Healthy', 'Warning', 'Critical'].map((label) => (
          <StatusTile key={label} label={label} active={label === status} />
        ))}
      </div>
      <div className="flex items-center gap-3 border border-white/10 bg-white/[0.03] px-4 py-3 text-white/70">
        <FiXCircle className="h-5 w-5" />
        <span className="text-sm uppercase tracking-[0.16em]">Payment route failed</span>
      </div>
    </div>
  );
}

function ProbePanel() {
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3 border border-white/10 bg-white/[0.03] px-4 py-3">
        <FiCpu className="h-5 w-5 text-white/72" />
        <strong className="text-2xl text-white">Can I Pay?</strong>
      </div>
      <MiniMetric label="Confidence" value="92%" />
      <MiniMetric label="Probability" value="High" />
      <MiniMetric label="Estimated fee" value="0.003 CKB" />
      <MiniMetric label="Capacity" value="Available" />
      <div className="mt-2 flex items-center gap-2 text-white/62">
        <FiCheckCircle className="h-5 w-5" />
        <span className="text-sm">Alternative path resolved.</span>
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
      <Bar label="Route Health" value={Math.min(96, 42 + restored * 0.54)} />
      <div className="border border-white/12 bg-white/[0.04] px-4 py-3 text-white/72">Liquidity restored</div>
    </div>
  );
}

function DashboardAssemblyPanel({
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
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <div className="border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-6 flex items-center gap-3">
          <FiLayers className="h-5 w-5 text-white/68" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/58">Dashboard</span>
        </div>
        <div className="space-y-2">
          {['Overview', 'Probe', 'Rebalance', 'Reconciliation'].map((item, index) => (
            <motion.div
              key={item}
              className="flex items-center gap-3 border border-white/10 px-3 py-2 text-sm text-white/64"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 0.45 }}
            >
              <FiMinus className="h-4 w-4" />
              {item}
            </motion.div>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <MiniMetric label="Channels" value={String(channels)} />
        <MiniMetric label="Ready" value={String(readyCount)} />
        <MiniMetric label="Drift" value={String(driftCount)} />
        <MiniMetric label="Freshness" value={isStale ? 'Stale' : 'Fresh'} />
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-white/[0.04] px-4 py-3">
      <span className="block text-xs uppercase tracking-[0.17em] text-white/42">{label}</span>
      <strong className="mt-1 block truncate text-xl text-white">{value}</strong>
    </div>
  );
}

function StatusTile({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className={[
        'flex items-center gap-2 border px-3 py-3 text-sm font-semibold',
        active ? 'border-white/36 bg-white/12 text-white' : 'border-white/10 bg-white/[0.03] text-white/42',
      ].join(' ')}
    >
      <FiCircle className={active ? 'h-3 w-3 fill-current' : 'h-3 w-3'} />
      {label}
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-sm text-white/58">
        <span>{label}</span>
        <span className="font-mono">{Math.round(value)}%</span>
      </div>
      <div className="h-2.5 overflow-hidden bg-white/10">
        <motion.span
          className="block h-full bg-white"
          animate={{ width: `${value}%`, opacity: 0.78 }}
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
  return truncateId(value, 8, 4);
}
