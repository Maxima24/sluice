import { Controller, Get } from '@nestjs/common';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { NodeService } from '../services/node.service';

/** Connectivity surface — proves the FiberRpcClient works end-to-end. */
@Controller('node')
export class NodeController {
  constructor(private readonly node: NodeService) {}

  @Get('info')
  @ResponseMessage('Node info fetched')
  info() {
    return this.node.getInfo();
  }

  @Get('channels')
  @ResponseMessage('Channels fetched')
  channels() {
    return this.node.listChannels();
  }

  @Get('peers')
  @ResponseMessage('Peers fetched')
  peers() {
    return this.node.listPeers();
  }

  @Get('graph')
  @ResponseMessage('Graph channels fetched')
  graph() {
    return this.node.graphChannels();
  }
}
