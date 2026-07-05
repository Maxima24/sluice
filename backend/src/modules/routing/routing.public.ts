import type { ProbeResultDto } from './dto/probe-result.dto';
import type { ProbeInput } from './types/routing.types';

export const ROUTING_SERVICE = Symbol('ROUTING_SERVICE');

export interface IRoutingService {
  probe(input: ProbeInput): Promise<ProbeResultDto>;
}

export type { ProbeResultDto, ProbeInput };
