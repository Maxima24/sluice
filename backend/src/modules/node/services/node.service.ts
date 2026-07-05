import { Injectable } from '@nestjs/common';
import { NodeRepository } from '../repositories/node.repository';
import { toChannelSummaryDtos, toNodeInfoDto, toPeerDtos } from '../mappers/node.mapper';
import type { INodeService } from '../node.public';
import type { NodeInfoDto } from '../dto/node-info.dto';
import type { ChannelSummaryDto } from '../dto/channel-summary.dto';
import type { PeerDto } from '../dto/peer.dto';
import type { GraphChannelsResult } from '../../../infrastructure/fiber-rpc/types/graph';

/**
 * Node/peer read surface. Orchestrates the repository (data access) and the
 * mapper (shaping) — no direct RPC, no hex handling here.
 */
@Injectable()
export class NodeService implements INodeService {
  constructor(private readonly repo: NodeRepository) {}

  async getInfo(): Promise<NodeInfoDto> {
    return toNodeInfoDto(await this.repo.getInfo());
  }

  async listChannels(): Promise<ChannelSummaryDto[]> {
    return toChannelSummaryDtos(await this.repo.listChannels());
  }

  async listPeers(): Promise<PeerDto[]> {
    return toPeerDtos(await this.repo.listPeers());
  }

  graphChannels(): Promise<GraphChannelsResult> {
    return this.repo.graphChannels();
  }
}
