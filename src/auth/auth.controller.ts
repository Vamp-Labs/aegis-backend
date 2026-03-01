import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestNonceDto } from './dto/request-nonce.dto';
import { VerifySignatureDto } from './dto/verify-signature.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('nonce')
  getNonce(@Query() query: RequestNonceDto) {
    if (!query.publicAddress) {
      throw new BadRequestException('publicAddress is required');
    }

    const nonce = this.authService.generateNonce(query.publicAddress);
    const message = this.authService.getMessageToSign(
      query.publicAddress,
      nonce,
    );

    return {
      nonce,
      messageToSign: message,
    };
  }

  @Post('verify')
  verifySignature(@Body() body: VerifySignatureDto) {
    return this.authService.verifySignature(
      body.publicAddress,
      body.signature,
      body.message,
    );
  }
}
