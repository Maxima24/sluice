'use client';

import { Network, Server, ShieldCheck, Wifi } from 'lucide-react';
import { type ReactNode } from 'react';
import { CanvasAppShell, CanvasWorkspace, WorkspaceHeader, WorkspacePanel } from '@/components/canvas-dashboard/CanvasAppShell';
import { useNodeInfo, useNodePeers } from '@/lib/queries/node';
import { focusWorkspaceModule } from '@/lib/workspace';
import { truncateId } from '@/lib/format';

export default function NetworkPage() {
  const node = useNodeInfo();
  const peers = useNodePeers();
  const info = node.data;
  const peerList = peers.data ?? [];

  return (
    <CanvasAppShell active="network" breadcrumb="Liquidity Layer / Network">
      <CanvasWorkspace>
        <WorkspaceHeader
          eyebrow="fiber topology"
          title="Network"
          description="Inspect the local Fiber node identity, peer set, addresses, and synchronization surface while the workspace stays focused on the live topology."
          action={
            <button
              type="button"
              onClick={() => focusWorkspaceModule('network')}
              className="hidden h-11 shrink-0 items-center gap-2 rounded-[4px] border border-ink-editorial bg-ink-editorial px-4 text-xs font-black uppercase tracking-[0.12em] text-panel transition hover:bg-ink-hover sm:flex"
            >
              <Network className="h-4 w-4" />
              Focus topology
            </button>
          }
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Node" value={info?.nodeName || 'Node Alpha'} icon={<Server className="h-5 w-5 text-copy" />} />
          <Metric label="Peers" value={String(peerList.length)} icon={<Wifi className="h-5 w-5 text-copy" />} />
          <Metric label="Chain" value={info?.chainHash ? truncateId(info.chainHash, 6, 4) : 'Unknown'} icon={<ShieldCheck className="h-5 w-5 text-copy" />} />
        </div>

        <WorkspacePanel className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-faint">node identity</p>
          <div className="mt-4 space-y-3">
            <DataLine label="Public key" value={info?.pubkey ? truncateId(info.pubkey, 14, 8) : node.isPending ? 'Loading' : 'Unavailable'} />
            <DataLine label="Version" value={info?.version ?? 'Unknown'} />
            <DataLine label="Commit" value={info?.commitHash ? truncateId(info.commitHash, 10, 6) : 'Unknown'} />
          </div>
        </WorkspacePanel>

        <WorkspacePanel className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.08em]">Peers</h2>
            <span className="rounded-[4px] border border-line px-2 py-1 font-mono text-[10px] text-copy">{peerList.length} connected</span>
          </div>
          <div className="space-y-2">
            {peers.isError ? (
              <Empty text={(peers.error as Error)?.message ?? 'Peer list unavailable.'} />
            ) : peerList.length ? (
              peerList.map((peer) => (
                <button
                  key={peer.pubkey}
                  type="button"
                  onClick={() => focusWorkspaceModule('network')}
                  className="block w-full rounded-[4px] border border-line bg-panel p-3 text-left transition hover:border-ink-editorial"
                >
                  <p className="truncate font-mono text-xs font-bold text-ink-editorial">{truncateId(peer.pubkey, 14, 8)}</p>
                  <p className="mt-1 truncate text-xs text-copy">{peer.address}</p>
                </button>
              ))
            ) : (
              <Empty text={peers.isPending ? 'Discovering peers.' : 'No peers connected yet.'} />
            )}
          </div>
        </WorkspacePanel>

        <WorkspacePanel className="mt-4">
          <h2 className="text-sm font-black uppercase tracking-[0.08em]">Addresses</h2>
          <div className="mt-4 space-y-2">
            {info?.addresses?.length ? (
              info.addresses.map((address) => (
                <div key={address} className="rounded-[4px] border border-line bg-panel px-3 py-3 font-mono text-xs text-copy">
                  {address}
                </div>
              ))
            ) : (
              <Empty text="No advertised addresses reported." />
            )}
          </div>
        </WorkspacePanel>
      </CanvasWorkspace>
    </CanvasAppShell>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <button type="button" onClick={() => focusWorkspaceModule('network')} className="rounded-[6px] border border-line bg-panel p-4 text-left transition hover:border-ink-editorial">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint">{label}</p>
        {icon}
      </div>
      <p className="mt-4 truncate font-mono text-2xl font-black tracking-[-0.03em] text-ink-editorial">{value}</p>
    </button>
  );
}

function DataLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[4px] border border-line bg-shell-muted p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">{label}</p>
      <p className="mt-1 truncate font-mono text-sm font-semibold text-ink-editorial">{value}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-[4px] border border-dashed border-line bg-shell-muted p-4 text-sm leading-6 text-copy">{text}</div>;
}
