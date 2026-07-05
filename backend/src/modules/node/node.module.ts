import { Module } from '@nestjs/common';
import { NodeController } from './controllers/node.controller';
import { NodeService } from './services/node.service';
import { NodeRepository } from './repositories/node.repository';
import { NODE_SERVICE } from './node.public';

@Module({
  controllers: [NodeController],
  providers: [
    NodeService,
    NodeRepository,
    { provide: NODE_SERVICE, useExisting: NodeService },
  ],
  exports: [NODE_SERVICE],
})
export class NodeModule {}
