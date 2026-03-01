import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class SentinelService {
  constructor(private readonly blockchainService: BlockchainService) {}

  prepareRegisterPosition(vault: string, triggerRiskThreshold: string) {
    return this.blockchainService.prepareRegisterPositionTx(
      vault,
      BigInt(triggerRiskThreshold),
    );
  }

  prepareUpdateRiskConfig(positionId: string, newTriggerRiskThreshold: string) {
    return this.blockchainService.prepareUpdateRiskConfigTx(
      positionId,
      BigInt(newTriggerRiskThreshold),
    );
  }

  prepareRemovePosition(positionId: string) {
    return this.blockchainService.prepareRemovePositionTx(positionId);
  }

  prepareEmergencyMigrate(positionId: string) {
    return this.blockchainService.prepareEmergencyMigrateTx(positionId);
  }
}
