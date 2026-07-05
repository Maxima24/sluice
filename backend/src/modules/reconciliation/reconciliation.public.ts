import type { ReconciliationStatusDto } from './dto/reconciliation-status.dto';

export const RECONCILIATION_SERVICE = Symbol('RECONCILIATION_SERVICE');

export interface IReconciliationService {
  getStatus(): Promise<ReconciliationStatusDto>;
}

export type { ReconciliationStatusDto };
