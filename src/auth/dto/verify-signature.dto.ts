import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';

export class VerifySignatureDto {
  @IsNotEmpty()
  @IsEthereumAddress()
  publicAddress: string;

  @IsNotEmpty()
  @IsString()
  signature: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
