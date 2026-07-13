import { FiActivity, FiAlertTriangle, FiCpu, FiGitBranch, FiGrid, FiRefreshCw } from 'react-icons/fi';

export const BOOT_STEPS = [
  'INITIALIZING FIBER NODE',
  'DISCOVERING CHANNELS',
  'BUILDING ROUTE GRAPH',
  'CALCULATING LIQUIDITY',
  'SYNCHRONIZING NETWORK STATE',
  'SYSTEM READY',
] as const;

export const SCENE_COUNT = 6;

export const STORY_BEATS = [
  {
    id: 'network',
    eyebrow: 'Fiber Network',
    title: 'Fiber Liquidity Layer',
    subtitle: 'Making Liquidity Visible. Making Payments Predictable.',
    icon: FiGitBranch,
  },
  {
    id: 'liquidity',
    eyebrow: 'Liquidity Visualization',
    title: 'Capacity becomes visible.',
    subtitle: 'Inbound. Outbound. Health. Capacity.',
    icon: FiActivity,
  },
  {
    id: 'problem',
    eyebrow: 'Problem Demonstration',
    title: 'One depleted channel breaks the route.',
    subtitle: 'Healthy becomes warning. Warning becomes critical.',
    icon: FiAlertTriangle,
  },
  {
    id: 'intelligence',
    eyebrow: 'Route Intelligence',
    title: 'Can I Pay?',
    subtitle: 'Alternative paths, confidence, fees, and capacity resolve before funds move.',
    icon: FiCpu,
  },
  {
    id: 'rebalance',
    eyebrow: 'Rebalancing',
    title: 'Liquidity returns to equilibrium.',
    subtitle: 'Warnings disappear. Capacity stabilizes.',
    icon: FiRefreshCw,
  },
  {
    id: 'assembly',
    eyebrow: 'Application Assembly',
    title: 'The system is ready.',
    subtitle: 'The visualization becomes the operator dashboard.',
    icon: FiGrid,
  },
] as const;

export const ROUTE_POINTS = [
  [-5.8, -1.4, 0.8],
  [-3.4, 0.9, -0.6],
  [-0.8, 0.2, 0.4],
  [1.8, -0.7, -0.9],
  [4.7, 0.8, 0.2],
] as const;
