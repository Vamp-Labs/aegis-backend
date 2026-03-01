import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class OracleService {
  constructor(private readonly blockchainService: BlockchainService) {}

  prepareAddOracle(oracleAddress: string) {
    return this.blockchainService.prepareAddOracleTx(oracleAddress);
  }

  prepareRemoveOracle(oracleAddress: string) {
    return this.blockchainService.prepareRemoveOracleTx(oracleAddress);
  }

  prepareSubmitSignal(vaultAddress: string, riskScore: string) {
    return this.blockchainService.prepareSubmitSignalTx(
      vaultAddress,
      BigInt(riskScore),
    );
  }

  prepareResetCircuitBreaker() {
    return this.blockchainService.prepareResetCircuitBreakerTx();
  }
}
