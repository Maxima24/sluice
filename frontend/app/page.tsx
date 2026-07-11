import { FiberCinematicExperience } from '@/components/cinematic/fiber-cinematic-experience';
import type { ChannelHealth, NodeInfo, ReconciliationStatus } from '@/components/cinematic/types';
import { serverFetch } from '@/lib/api/client';

// Always fetch fresh from the node (source of truth) on each request.
export const dynamic = 'force-dynamic';

export default async function Home() {
  const [info, health, reconciliation] = await Promise.all([
    serverFetch<NodeInfo>('node/info'),
    serverFetch<ChannelHealth>('channels/health'),
    serverFetch<ReconciliationStatus>('reconciliation/status'),
  ]);

  return <FiberCinematicExperience info={info} health={health} reconciliation={reconciliation} />;
}
