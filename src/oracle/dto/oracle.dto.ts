import { IsEthereumAddress, IsNotEmpty, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PrepareAddOracleDto {
  @ApiProperty({ description: 'The address of the risk oracle to add', example: '0x1234...' })
  @IsNotEmpty()
  @IsEthereumAddress()
  oracleAddress: string;
}

export class PrepareRemoveOracleDto {
  @ApiProperty({ description: 'The address of the risk oracle to remove', example: '0x1234...' })
  @IsNotEmpty()
  @IsEthereumAddress()
  oracleAddress: string;
}

export class PrepareSubmitSignalDto {
  @ApiProperty({ description: 'The vault address to submit risk signal for', example: '0x5678...' })
  @IsNotEmpty()
  @IsEthereumAddress()
  vaultAddress: string;

  @ApiProperty({ description: 'The risk score to submit (0-100)', example: '75' })
  @IsNotEmpty()
  @IsNumberString()
  riskScore: string;
}
