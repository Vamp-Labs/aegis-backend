import {
  IsBoolean,
  IsEthereumAddress,
  IsNotEmpty,
  IsNumberString,
} from 'class-validator';

export class PrepareAddVaultDto {
  @IsNotEmpty()
  @IsEthereumAddress()
  vault: string;

  @IsNotEmpty()
  @IsNumberString()
  initialRiskScore: string;
}

export class PrepareUpdateVaultDto {
  @IsNotEmpty()
  @IsEthereumAddress()
  vault: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}

export class PrepareRemoveVaultDto {
  @IsNotEmpty()
  @IsEthereumAddress()
  vault: string;
}
