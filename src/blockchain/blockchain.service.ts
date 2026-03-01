import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

// Import ABIs
import AegisSentinelABI from './abis/AegisSentinel.json';
import SafeHavenRegistryABI from './abis/SafeHavenRegistry.json';
import RiskOracleABI from './abis/RiskOracle.json';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);

  private provider: ethers.JsonRpcProvider;

  // Read-only contract instances
  public sentinelContract: ethers.Contract;
  public registryContract: ethers.Contract;
  public oracleContract: ethers.Contract;

  // Interfaces for encoding calldata
  private sentinelInterface: ethers.Interface;
  private registryInterface: ethers.Interface;
  private oracleInterface: ethers.Interface;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.logger.log('Initializing BlockchainService...');

    // We do not throw to allow app to start even without a valid RPC URL in dev,
    // although functions will fail when called.
    const rpcUrl =
      this.configService.get<string>('RPC_URL') || 'http://127.0.0.1:8545';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    const sentinelAddress = this.configService.get<string>(
      'AEGIS_SENTINEL_ADDRESS',
    );
    const registryAddress = this.configService.get<string>(
      'SAFE_HAVEN_REGISTRY_ADDRESS',
    );
    const oracleAddress = this.configService.get<string>('RISK_ORACLE_ADDRESS');

    if (!sentinelAddress || !registryAddress || !oracleAddress) {
      this.logger.warn(
        'One or more contract addresses are missing in environment variables.',
      );
    }

    if (sentinelAddress) {
      this.sentinelContract = new ethers.Contract(
        sentinelAddress,
        AegisSentinelABI as ethers.InterfaceAbi,
        this.provider,
      );
      // Interface handles encoding function data
      this.sentinelInterface = new ethers.Interface(
        AegisSentinelABI as ethers.InterfaceAbi,
      );
    }

    if (registryAddress) {
      this.registryContract = new ethers.Contract(
        registryAddress,
        SafeHavenRegistryABI as ethers.InterfaceAbi,
        this.provider,
      );
      this.registryInterface = new ethers.Interface(
        SafeHavenRegistryABI as ethers.InterfaceAbi,
      );
    }

    if (oracleAddress) {
      this.oracleContract = new ethers.Contract(
        oracleAddress,
        RiskOracleABI as ethers.InterfaceAbi,
        this.provider,
      );
      this.oracleInterface = new ethers.Interface(
        RiskOracleABI as ethers.InterfaceAbi,
      );
    }

    this.logger.log('BlockchainService initialized successfully');
  }

  // --- Read Methods ---

  /**
   * Get the risk score for a vault
   */
  async getVaultRiskScore(vaultAddress: string): Promise<number> {
    if (!this.registryContract)
      throw new Error('Registry contract not configured');
    const vaultInfo = (await this.registryContract.vaults(vaultAddress)) as {
      riskScore: bigint;
    };
    return Number(vaultInfo.riskScore);
  }

  /**
   * Check if circuit breaker is active
   */
  async isCircuitBreakerActive(): Promise<boolean> {
    if (!this.oracleContract) throw new Error('Oracle contract not configured');
    return (await this.oracleContract.circuitBreakerActive()) as boolean;
  }

  // --- Calldata Preparation Methods ---

  /**
   * Helper format unsigned transaction
   */
  prepareTransaction(
    contractAddress: string,
    calldata: string,
    value: string = '0',
  ) {
    return {
      to: contractAddress,
      data: calldata,
      value: value,
    };
  }

  /**
   * Prepare calldata for registerPosition
   */
  prepareRegisterPositionTx(vault: string, triggerRiskThreshold: bigint) {
    if (!this.sentinelInterface)
      throw new Error('Sentinel interface not configured');

    const calldata = this.sentinelInterface.encodeFunctionData(
      'registerPosition',
      [vault, triggerRiskThreshold],
    );

    return this.prepareTransaction(
      this.configService.get<string>('AEGIS_SENTINEL_ADDRESS')!,
      calldata,
    );
  }

  /**
   * Prepare calldata for updateRiskConfig
   */
  prepareUpdateRiskConfigTx(
    positionId: string,
    newTriggerRiskThreshold: bigint,
  ) {
    if (!this.sentinelInterface)
      throw new Error('Sentinel interface not configured');

    const calldata = this.sentinelInterface.encodeFunctionData(
      'updateRiskConfig',
      [positionId, newTriggerRiskThreshold],
    );

    return this.prepareTransaction(
      this.configService.get<string>('AEGIS_SENTINEL_ADDRESS')!,
      calldata,
    );
  }

  /**
   * Prepare calldata for removePosition
   */
  prepareRemovePositionTx(positionId: string) {
    if (!this.sentinelInterface)
      throw new Error('Sentinel interface not configured');

    const calldata = this.sentinelInterface.encodeFunctionData(
      'removePosition',
      [positionId],
    );

    return this.prepareTransaction(
      this.configService.get<string>('AEGIS_SENTINEL_ADDRESS')!,
      calldata,
    );
  }

  /**
   * Prepare calldata for emergencyMigrate
   */
  prepareEmergencyMigrateTx(positionId: string) {
    if (!this.sentinelInterface)
      throw new Error('Sentinel interface not configured');

    const calldata = this.sentinelInterface.encodeFunctionData(
      'emergencyMigrate',
      [positionId],
    );

    return this.prepareTransaction(
      this.configService.get<string>('AEGIS_SENTINEL_ADDRESS')!,
      calldata,
    );
  }

  // --- Registry Calldata Preparation ---

  prepareAddVaultTx(vaultAddress: string, initialRiskScore: bigint) {
    if (!this.registryInterface)
      throw new Error('Registry interface not configured');
    const calldata = this.registryInterface.encodeFunctionData('addVault', [
      vaultAddress,
      initialRiskScore,
    ]);
    return this.prepareTransaction(
      this.configService.get<string>('SAFE_HAVEN_REGISTRY_ADDRESS')!,
      calldata,
    );
  }

  prepareUpdateVaultTx(vaultAddress: string, isActive: boolean) {
    if (!this.registryInterface)
      throw new Error('Registry interface not configured');
    const calldata = this.registryInterface.encodeFunctionData('updateVault', [
      vaultAddress,
      isActive,
    ]);
    return this.prepareTransaction(
      this.configService.get<string>('SAFE_HAVEN_REGISTRY_ADDRESS')!,
      calldata,
    );
  }

  prepareRemoveVaultTx(vaultAddress: string) {
    if (!this.registryInterface)
      throw new Error('Registry interface not configured');
    const calldata = this.registryInterface.encodeFunctionData('removeVault', [
      vaultAddress,
    ]);
    return this.prepareTransaction(
      this.configService.get<string>('SAFE_HAVEN_REGISTRY_ADDRESS')!,
      calldata,
    );
  }

  // --- Oracle Calldata Preparation ---

  prepareAddOracleTx(oracleAddress: string) {
    if (!this.oracleInterface)
      throw new Error('Oracle interface not configured');
    const calldata = this.oracleInterface.encodeFunctionData('addOracle', [
      oracleAddress,
    ]);
    return this.prepareTransaction(
      this.configService.get<string>('RISK_ORACLE_ADDRESS')!,
      calldata,
    );
  }

  prepareRemoveOracleTx(oracleAddress: string) {
    if (!this.oracleInterface)
      throw new Error('Oracle interface not configured');
    const calldata = this.oracleInterface.encodeFunctionData('removeOracle', [
      oracleAddress,
    ]);
    return this.prepareTransaction(
      this.configService.get<string>('RISK_ORACLE_ADDRESS')!,
      calldata,
    );
  }

  prepareSubmitSignalTx(vaultAddress: string, riskScore: bigint) {
    if (!this.oracleInterface)
      throw new Error('Oracle interface not configured');
    const calldata = this.oracleInterface.encodeFunctionData('submitSignal', [
      vaultAddress,
      riskScore,
    ]);
    return this.prepareTransaction(
      this.configService.get<string>('RISK_ORACLE_ADDRESS')!,
      calldata,
    );
  }

  prepareResetCircuitBreakerTx() {
    if (!this.oracleInterface)
      throw new Error('Oracle interface not configured');
    const calldata = this.oracleInterface.encodeFunctionData(
      'resetCircuitBreaker',
      [],
    );
    return this.prepareTransaction(
      this.configService.get<string>('RISK_ORACLE_ADDRESS')!,
      calldata,
    );
  }
}
