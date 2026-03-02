import {
  IsBoolean,
  IsEthereumAddress,
  IsNotEmpty,
  IsNumberString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PrepareAddVaultDto {
  @ApiProperty({ description: 'The address of the vault to add', example: '0x1234...' })
  @IsNotEmpty()
  @IsEthereumAddress()
  vault: string;

  @ApiProperty({ description: 'The initial risk score for this vault', example: '10' })
  @IsNotEmpty()
  @IsNumberString()
  initialRiskScore: string;
}

export class PrepareUpdateVaultDto {
  @ApiProperty({ description: 'The address of the vault to update', example: '0x1234...' })
  @IsNotEmpty()
  @IsEthereumAddress()
  vault: string;

  @ApiProperty({ description: 'Whether the vault should be active', example: true })
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}

export class PrepareRemoveVaultDto {
  @ApiProperty({ description: 'The address of the vault to remove', example: '0x1234...' })
  @IsNotEmpty()
  @IsEthereumAddress()
  vault: string;
}
