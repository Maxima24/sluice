import { Inject, Injectable } from '@nestjs/common';
import { FIBER_RPC, type IFiberRpcClient } from '../../../infrastructure/fiber-rpc/fiber-rpc.port';
import type { NodeInfoResult } from '../../../infrastructure/fiber-rpc/types/node-info';
import type { ChannelInfo } from '../../../infrastructure/fiber-rpc/types/channels';
import type { PeerInfo } from '../../../infrastructure/fiber-rpc/types/peers';
import type { GraphChannelsResult } from '../../../infrastructure/fiber-rpc/types/graph';

/**
 * Data-access layer for the node context. A read-through repository: it wraps
 * the FIBER_RPC port (no DB) and returns RAW RPC DTOs — shaping into domain
 * DTOs is the mapper's job. This is the one place the node context reads the node.
 */
@Injectable()
export class NodeRepository {
  constructor(@Inject(FIBER_RPC) private readonly fiber: IFiberRpcClient) {}

  getInfo(): Promise<NodeInfoResult> {
    return this.fiber.nodeInfo();
  }

  async listChannels(): Promise<ChannelInfo[]> {
    const { channels } = await this.fiber.listChannels();
    return channels;
  }

  async listPeers(): Promise<PeerInfo[]> {
    const { peers } = await this.fiber.listPeers();
    return peers;
  }

  graphChannels(): Promise<GraphChannelsResult> {
    return this.fiber.graphChannels();
  }
}
