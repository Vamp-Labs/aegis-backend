import { IsEthereumAddress, IsNotEmpty, IsNumberString } from 'class-validator';

export class PrepareAddOracleDto {
  @IsNotEmpty()
  @IsEthereumAddress()
  oracleAddress: string;
}

export class PrepareRemoveOracleDto {
  @IsNotEmpty()
  @IsEthereumAddress()
  oracleAddress: string;
}

export class PrepareSubmitSignalDto {
  @IsNotEmpty()
  @IsEthereumAddress()
  vaultAddress: string;

  @IsNotEmpty()
  @IsNumberString()
  riskScore: string;
}
