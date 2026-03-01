import { Module } from '@nestjs/common';
import { SentinelService } from './sentinel.service';
import { SentinelController } from './sentinel.controller';

import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [BlockchainModule],
  providers: [SentinelService],
  controllers: [SentinelController],
})
export class SentinelModule {}
