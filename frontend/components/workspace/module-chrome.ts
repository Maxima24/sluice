import type { WorkspaceModule, WorkspaceModuleKind } from './workspace-types';

interface ModuleChrome {
  titleLines: [string, string];
  metrics: Array<{ label: string; value: string }>;
}

const chrome: Record<WorkspaceModuleKind, ModuleChrome> = {
  network: {
    titleLines: ['FIBER', 'TOPOLOGY'],
    metrics: [
      { label: 'PEERS', value: '7' },
      { label: 'CHANNELS', value: '4' },
    ],
  },
  liquidity: {
    titleLines: ['LIQUIDITY', 'HEAT MAP'],
    metrics: [
      { label: 'HEALTH', value: '84%' },
      { label: 'WARNINGS', value: '2' },
    ],
  },
  route: {
    titleLines: ['PAYMENT', 'PROBE'],
    metrics: [
      { label: 'CONF', value: '82%' },
      { label: 'HOPS', value: '5' },
    ],
  },
  rebalance: {
    titleLines: ['FLOW', 'ENGINE'],
    metrics: [
      { label: 'SOURCE', value: '8.42' },
      { label: 'TARGET', value: '2.19' },
    ],
  },
  channels: {
    titleLines: ['CHANNEL', 'INSPECTOR'],
    metrics: [
      { label: 'ACTIVE', value: '4' },
      { label: 'THIN', value: '1' },
    ],
  },
  alerts: {
    titleLines: ['ALERT', 'TIMELINE'],
    metrics: [
      { label: 'OPEN', value: '4' },
      { label: 'LATEST', value: '2m' },
    ],
  },
  audit: {
    titleLines: ['LEDGER', 'DRIFT'],
    metrics: [
      { label: 'DRIFT', value: '0.02' },
      { label: 'TRACE', value: '4' },
    ],
  },
  note: {
    titleLines: ['OPERATOR', 'NOTE'],
    metrics: [
      { label: 'STATE', value: 'DRAFT' },
      { label: 'LINK', value: 'PROBE' },
    ],
  },
};

export function getModuleChrome(item: WorkspaceModule) {
  return chrome[item.kind];
}
