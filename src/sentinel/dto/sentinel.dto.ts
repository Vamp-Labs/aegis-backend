import {
  IsEthereumAddress,
  IsNotEmpty,
  IsNumberString,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PrepareRegisterPositionDto {
  @ApiProperty({ description: 'The associated vault address', example: '0x1234...' })
  @IsNotEmpty()
  @IsEthereumAddress()
  vault: string;

  @ApiProperty({ description: 'The risk threshold (0-100) that triggers migration', example: '80' })
  @IsNotEmpty()
  @IsNumberString()
  triggerRiskThreshold: string;
}

export class PrepareUpdateRiskConfigDto {
  @ApiProperty({ description: 'The unique position ID', example: '0xpositionId123...' })
  @IsNotEmpty()
  @IsString()
  positionId: string;

  @ApiProperty({ description: 'The new risk threshold (0-100)', example: '90' })
  @IsNotEmpty()
  @IsNumberString()
  newTriggerRiskThreshold: string;
}

export class PrepareRemovePositionDto {
  @ApiProperty({ description: 'The unique position ID to remove', example: '0xpositionId123...' })
  @IsNotEmpty()
  @IsString()
  positionId: string;
}
