'use client';

import { useState } from 'react';
import { RotateCcw, Shuffle } from 'lucide-react';
import { BOOT_TOPOLOGY_VARIANT_COUNT, DEFAULT_BOOT_VARIANT, OperatorBootLoader } from '@/components/layout/OperatorBootLoader';

export default function LoaderMockPage() {
  const [replayKey, setReplayKey] = useState(0);
  const [variant, setVariant] = useState(DEFAULT_BOOT_VARIANT);

  function replay() {
    setReplayKey((key) => key + 1);
  }

  function nextVariant() {
    setVariant((current) => (current + 1) % BOOT_TOPOLOGY_VARIANT_COUNT);
    setReplayKey((key) => key + 1);
  }

  return (
    <main className="relative h-dvh overflow-hidden bg-black text-white">
      <OperatorBootLoader key={`${variant}-${replayKey}`} preview variant={variant} />

      <div className="absolute right-4 top-4 z-[10000] flex items-center gap-2 rounded-none border border-white/18 bg-black/72 p-2 backdrop-blur-md">
        <button
          type="button"
          data-no-magnetic
          onClick={replay}
          className="flex h-10 items-center gap-2 border border-white/18 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/72 transition hover:border-white/50 hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          Replay
        </button>
        <button
          type="button"
          data-no-magnetic
          onClick={nextVariant}
          className="flex h-10 items-center gap-2 border border-white/18 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/72 transition hover:border-white/50 hover:text-white"
        >
          <Shuffle className="h-4 w-4" />
          Variant 0{variant + 1}
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-[10000] max-w-[360px] border border-white/14 bg-black/72 p-3 font-mono text-[10px] uppercase leading-5 tracking-[0.16em] text-white/40 backdrop-blur-md">
        Temporary loader mock page. Edit <span className="text-white/70">OperatorBootLoader.tsx</span>, then replay.
      </div>
    </main>
  );
}
