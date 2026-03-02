import { IsEthereumAddress, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestNonceDto {
  @ApiProperty({ description: 'The Ethereum address of the user', example: '0x1A2b3C4d5E6f7g8H9i0J1k2L3m4N5o6P7q8R9s0T' })
  @IsNotEmpty()
  @IsEthereumAddress()
  publicAddress: string;
}
