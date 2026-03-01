import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class RegistryService {
  constructor(private readonly blockchainService: BlockchainService) {}

  prepareAddVault(vault: string, initialRiskScore: string) {
    return this.blockchainService.prepareAddVaultTx(
      vault,
      BigInt(initialRiskScore),
    );
  }

  prepareUpdateVault(vault: string, isActive: boolean) {
    return this.blockchainService.prepareUpdateVaultTx(vault, isActive);
  }

  prepareRemoveVault(vault: string) {
    return this.blockchainService.prepareRemoveVaultTx(vault);
  }
}
