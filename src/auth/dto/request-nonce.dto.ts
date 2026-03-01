import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class RequestNonceDto {
  @IsNotEmpty()
  @IsEthereumAddress()
  publicAddress: string;
}
