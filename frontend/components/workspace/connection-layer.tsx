import { motion } from 'framer-motion';
import type { WorkspaceModuleId } from '@/lib/workspace';
import type { CanvasModuleId, WorkspaceModule } from './workspace-types';

export function ConnectionLayer({
  canvasWidth,
  canvasHeight,
  connections,
  focused,
  modules,
  moduleHeaderHeight,
}: {
  canvasWidth: number;
  canvasHeight: number;
  connections: Array<[WorkspaceModuleId, WorkspaceModuleId]>;
  focused: CanvasModuleId | null;
  modules: Map<CanvasModuleId, WorkspaceModule>;
  moduleHeaderHeight: number;
}) {
  return (
    <svg className="absolute inset-0 z-0 h-full w-full overflow-visible" width={canvasWidth} height={canvasHeight} aria-hidden>
      {connections.map(([from, to], index) => {
        const a = modules.get(from);
        const b = modules.get(to);
        if (!a || !b) return null;
        const start = { x: a.x + a.width, y: a.y + (a.collapsed ? moduleHeaderHeight : a.height) / 2 };
        const end = { x: b.x, y: b.y + (b.collapsed ? moduleHeaderHeight : b.height) / 2 };
        const active = focused === from || focused === to;
        const d = `M ${start.x} ${start.y} C ${start.x + 140} ${start.y}, ${end.x - 140} ${end.y}, ${end.x} ${end.y}`;
        return (
          <g key={`${from}-${to}`}>
            <motion.path
              d={d}
              fill="none"
              stroke={active ? 'rgba(255,255,255,0.48)' : 'rgba(255,255,255,0.14)'}
              strokeWidth={active ? 1.8 : 1}
              strokeDasharray="8 9"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.3 + index * 0.08, ease: 'easeOut' }}
            />
            <motion.path
              d={d}
              fill="none"
              stroke={active ? 'rgba(255,255,255,0.84)' : 'rgba(255,255,255,0.3)'}
              strokeLinecap="round"
              strokeWidth={active ? 2.2 : 1.4}
              strokeDasharray="1 18"
              animate={{
                opacity: active ? [0.26, 0.82, 0.26] : [0.05, 0.24, 0.05],
                strokeDashoffset: [0, -120],
              }}
              transition={{
                opacity: { duration: 3.2, repeat: Infinity, delay: index * 0.12 },
                strokeDashoffset: { duration: 2.4, repeat: Infinity, ease: 'linear' },
              }}
            />
            <motion.circle
              cx={(start.x + end.x) / 2}
              cy={(start.y + end.y) / 2}
              r={active ? 4.2 : 2.8}
              fill="#fff"
              animate={{ opacity: active ? [0.2, 0.9, 0.2] : [0.06, 0.32, 0.06], scale: [0.76, 1.26, 0.76] }}
              transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.16 }}
            />
            <circle cx={start.x} cy={start.y} r="3.5" fill="#0A0A0A" stroke="rgba(255,255,255,0.28)" />
            <circle cx={end.x} cy={end.y} r="3.5" fill="#0A0A0A" stroke="rgba(255,255,255,0.28)" />
          </g>
        );
      })}
    </svg>
  );
}
