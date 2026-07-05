import type { RebalanceJobDto } from './dto/rebalance-job.dto';
import type { RebalanceInput } from './types/rebalance.types';

export const REBALANCE_SERVICE = Symbol('REBALANCE_SERVICE');

export interface IRebalanceService {
  request(input: RebalanceInput): Promise<RebalanceJobDto>;
  getJob(id: string): Promise<RebalanceJobDto | null>;
}

export type { RebalanceJobDto, RebalanceInput };
