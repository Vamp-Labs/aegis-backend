import {
  IsEthereumAddress,
  IsNotEmpty,
  IsNumberString,
  IsString,
} from 'class-validator';

export class PrepareRegisterPositionDto {
  @IsNotEmpty()
  @IsEthereumAddress()
  vault: string;

  @IsNotEmpty()
  @IsNumberString()
  triggerRiskThreshold: string;
}

export class PrepareUpdateRiskConfigDto {
  @IsNotEmpty()
  @IsString()
  positionId: string;

  @IsNotEmpty()
  @IsNumberString()
  newTriggerRiskThreshold: string;
}

export class PrepareRemovePositionDto {
  @IsNotEmpty()
  @IsString()
  positionId: string;
}
