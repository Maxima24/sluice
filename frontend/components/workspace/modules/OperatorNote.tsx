import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { focusWorkspaceModule } from '@/lib/workspace';
import { cn } from '@/lib/utils';
import { primaryButtonClass } from './shared';

export function OperatorNote() {
  const [note, setNote] = useState('Route retry should run only after channel 3 has recovered above 30% outbound.');
  const chips = [
    ['context', 'node alpha'],
    ['owner', 'operator'],
    ['state', 'draft'],
  ];

  return (
    <div className="flex h-full min-h-[250px] flex-col gap-4 bg-transparent">
      <div className="flex flex-wrap gap-2">
        {chips.map(([label, value]) => (
          <span key={label} className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">{label}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/65">{value}</span>
          </span>
        ))}
      </div>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Write a local operator note..."
        className="min-h-[130px] flex-1 resize-none rounded-2xl border border-white/10 bg-transparent p-4 text-sm leading-6 text-white/76 outline-none transition placeholder:text-white/20 focus:border-white/35 focus:bg-white/[0.04]"
      />
      <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/38">
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
          local only
        </span>
        <button
          type="button"
          data-no-magnetic
          onClick={() => focusWorkspaceModule('route-probe')}
          className={cn(primaryButtonClass, 'flex items-center gap-2')}
        >
          <span>Link probe</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
