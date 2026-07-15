import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { NodeService } from '../services/node.service';

/** Connectivity surface — proves the FiberRpcClient works end-to-end. */
@ApiTags('node')
@Controller('node')
export class NodeController {
  constructor(private readonly node: NodeService) {}

  @Get('info')
  @ApiOperation({ summary: 'Node identity — pubkey, version, chain hash' })
  @ResponseMessage('Node info fetched')
  info() {
    return this.node.getInfo();
  }

  @Get('channels')
  @ApiOperation({ summary: 'Raw channels from the node' })
  @ResponseMessage('Channels fetched')
  channels() {
    return this.node.listChannels();
  }

  @Get('peers')
  @ApiOperation({ summary: 'Connected peers' })
  @ResponseMessage('Peers fetched')
  peers() {
    return this.node.listPeers();
  }

  @Get('graph')
  @ApiOperation({ summary: 'Network graph channels' })
  @ResponseMessage('Graph channels fetched')
  graph() {
    return this.node.graphChannels();
  }
}
