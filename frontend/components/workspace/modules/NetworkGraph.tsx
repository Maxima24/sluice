import { motion } from 'framer-motion';
import { useState } from 'react';
import { LiveDataSkeleton, SegmentSwitch, SingleLineStats } from './shared';
import { useNodePeers } from '@/lib/queries/node';
import { useChannelHealth } from '@/lib/queries/channels';
import { healthScore } from '@/lib/liquidity';

export function NetworkGraph() {
  const [mode, setMode] = useState<'flow' | 'failure'>('flow');
  const peers = useNodePeers();
  const health = useChannelHealth();
  const channels = health.data?.channels ?? [];
  const nodes = [
    { id: 'N09', x: 56, y: 144 },
    { id: 'N12', x: 138, y: 74 },
    { id: 'N15', x: 232, y: 130 },
    { id: 'N18', x: 338, y: 74 },
    { id: 'N21', x: 404, y: 198 },
    { id: 'N24', x: 206, y: 232 },
    { id: 'N27', x: 94, y: 244 },
  ];
  const activePath = [nodes[0], nodes[1], nodes[2], nodes[3], nodes[4]];
  const activePathX = activePath.map((node) => node.x);
  const activePathY = activePath.map((node) => node.y);

  return (
    <div className="relative flex h-full min-h-[260px] flex-col overflow-hidden bg-transparent">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">fiber gossip graph</p>
        <SegmentSwitch
          value={mode}
          options={[
            ['flow', 'FLOW'],
            ['failure', 'FAILURE'],
          ]}
          onChange={(value) => setMode(value as 'flow' | 'failure')}
        />
      </div>
      <div className="mt-2 flex shrink-0 items-center justify-between gap-3">
        <p className="text-xs text-white/55">{mode === 'flow' ? 'routing state healthy' : 'bottleneck replay active'}</p>
        <LiveDataSkeleton />
      </div>

      <svg viewBox="0 0 460 260" className="min-h-[172px] flex-1 bg-transparent" aria-hidden>
        {nodes.slice(1).map((node, index) => (
          <line
            key={node.id}
            x1={nodes[index].x}
            y1={nodes[index].y}
            x2={node.x}
            y2={node.y}
            stroke={mode === 'failure' && index === 2 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.24)'}
            strokeDasharray={mode === 'failure' && index === 2 ? '2 4' : '6 7'}
          />
        ))}
        <path
          d="M56 144 C150 34 268 272 404 198"
          stroke={mode === 'flow' ? 'rgba(255,255,255,0.52)' : 'rgba(255,255,255,0.2)'}
          strokeWidth="1.6"
          fill="none"
        />
        {nodes.map((node, index) => {
          const active = node.id === 'N15';
          return (
            <g key={node.id}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={active ? 22 : 17}
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1"
                animate={{ strokeOpacity: [0, 0.5, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.14, ease: 'easeInOut' }}
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={active ? 13 : 9}
                fill={active ? '#FFFFFF' : '#111111'}
                stroke={active ? 'none' : 'rgba(255,255,255,0.28)'}
                strokeWidth="1"
              />
              <text x={node.x} y={node.y + 33} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.38)" fontFamily="monospace">
                {node.id}
              </text>
            </g>
          );
        })}
        <motion.circle
          r="6"
          fill="rgba(255,255,255,0.18)"
          animate={{ cx: activePathX, cy: activePathY }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.circle
          r="3"
          fill="#fff"
          animate={{ cx: activePathX, cy: activePathY }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'linear' }}
        />
      </svg>

      <SingleLineStats
        className="shrink-0 border-t border-white/[0.08] pt-2"
        items={[
          ['PEERS', peers.data ? String(peers.data.length) : '…'],
          ['CHANNELS', health.data ? String(channels.length) : '…'],
          ['HEALTH', channels.length ? `${healthScore(channels)}%` : '—'],
        ]}
      />
    </div>
  );
}
