import { Maximize2 } from 'lucide-react';

export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  onFit,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFit: () => void;
}) {
  return (
    <div
      data-testid="zoom-controls"
      data-workspace-control
      className="absolute bottom-20 left-4 z-30 flex h-10 items-center gap-1 rounded-[16px] border border-white/12 bg-machine px-2 text-white sm:bottom-5 sm:left-5"
    >
      <button type="button" data-no-magnetic aria-label="Zoom out" onClick={onZoomOut} className="h-7 w-7 rounded-[16px] text-white/60 transition hover:border hover:border-white/20 hover:text-white">
        <span>-</span>
      </button>
      <button type="button" data-no-magnetic data-testid="zoom-label" onClick={onReset} className="min-w-14 rounded-[16px] px-2 font-mono text-xs text-white/72 transition hover:border hover:border-white/20">
        <span>{Math.round(zoom * 100)}%</span>
      </button>
      <button type="button" data-no-magnetic aria-label="Zoom in" onClick={onZoomIn} className="h-7 w-7 rounded-[16px] text-white/60 transition hover:border hover:border-white/20 hover:text-white">
        <span>+</span>
      </button>
      <button type="button" data-no-magnetic aria-label="Fit modules" onClick={onFit} className="flex h-7 w-7 items-center justify-center rounded-[16px] text-white/60 transition hover:border hover:border-white/20 hover:text-white">
        <Maximize2 className="h-4 w-4" />
      </button>
    </div>
  );
}
