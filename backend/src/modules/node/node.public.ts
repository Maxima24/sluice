import type { NodeInfoDto } from './dto/node-info.dto';
import type { ChannelSummaryDto } from './dto/channel-summary.dto';
import type { PeerDto } from './dto/peer.dto';
import type { GraphChannelsResult } from '../../infrastructure/fiber-rpc/types/graph';

/** Cross-context boundary token for the node context. */
export const NODE_SERVICE = Symbol('NODE_SERVICE');

export interface INodeService {
  getInfo(): Promise<NodeInfoDto>;
  listChannels(): Promise<ChannelSummaryDto[]>;
  listPeers(): Promise<PeerDto[]>;
  graphChannels(): Promise<GraphChannelsResult>;
}

export type { NodeInfoDto, ChannelSummaryDto, PeerDto };
