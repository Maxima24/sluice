import { FiActivity, FiAlertTriangle, FiCpu, FiGitBranch, FiLayers, FiRefreshCw, FiShield, FiZap } from 'react-icons/fi';

export const SCENE_COUNT = 8;

export const STORY_BEATS = [
  {
    id: 'hero',
    eyebrow: 'Fiber Liquidity Layer',
    title: 'Fiber Liquidity Layer',
    subtitle: 'Making Liquidity Visible. Making Payments Predictable.',
    icon: FiLayers,
  },
  {
    id: 'network',
    eyebrow: 'Network exploration',
    title: 'A living map of channel capacity.',
    subtitle: 'Inbound, outbound, capacity, and health emerge as the camera moves through the Fiber graph.',
    icon: FiGitBranch,
  },
  {
    id: 'problem',
    eyebrow: 'Liquidity problem',
    title: 'A healthy node can still fail payments.',
    subtitle: 'One channel drains asymmetrically until outbound capacity becomes a routing risk.',
    icon: FiAlertTriangle,
  },
  {
    id: 'route',
    eyebrow: 'Payment route',
    title: 'The payment finds the bottleneck.',
    subtitle: 'A route that looked possible pauses at insufficient outbound liquidity.',
    icon: FiZap,
  },
  {
    id: 'probe',
    eyebrow: 'Can I Pay?',
    title: 'Probe before funds move.',
    subtitle: 'Route confidence, estimated fee, probability, and available capacity become explicit.',
    icon: FiActivity,
  },
  {
    id: 'rebalance',
    eyebrow: 'Rebalancing',
    title: 'Liquidity moves back into shape.',
    subtitle: 'Overfunded channels refill depleted paths and health indicators recover.',
    icon: FiRefreshCw,
  },
  {
    id: 'dashboard',
    eyebrow: 'Dashboard reveal',
    title: 'The cinematic graph becomes an operator console.',
    subtitle: 'Panels, charts, bars, probes, and audit records assemble from the network itself.',
    icon: FiCpu,
  },
  {
    id: 'architecture',
    eyebrow: 'Architecture',
    title: 'Built for Operators. Powered by Fiber.',
    subtitle: 'A reusable liquidity layer for monitoring, probing, rebalancing, and production readiness.',
    icon: FiShield,
  },
] as const;

export const ROUTE_POINTS = [
  [-5.8, -1.4, 0.8],
  [-3.4, 0.9, -0.6],
  [-0.8, 0.2, 0.4],
  [1.8, -0.7, -0.9],
  [4.7, 0.8, 0.2],
] as const;
