import type { BalanceChangedDto } from './dto/balance-changed.dto';

/** WS event names the frontend subscribes to. */
export const REALTIME_EVENT = {
  BALANCE_CHANGED: 'balance-changed',
  PAYMENT_STATUS: 'payment-status', // used by Step 6 (rebalance) transitions
} as const;

export type RealtimeEvent = (typeof REALTIME_EVENT)[keyof typeof REALTIME_EVENT];

export type { BalanceChangedDto };
