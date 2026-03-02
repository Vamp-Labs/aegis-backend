import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RequestNonceDto } from './dto/request-nonce.dto';
import { VerifySignatureDto } from './dto/verify-signature.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('nonce')
  @ApiOperation({ summary: 'Request a nonce for signing' })
  @ApiResponse({ status: 200, description: 'Returns a nonce and a message to sign.' })
  @ApiResponse({ status: 400, description: 'Bad Request if publicAddress is missing.' })
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
  @ApiOperation({ summary: 'Verify signature and get JWT token' })
  @ApiResponse({ status: 201, description: 'Signature verified, JWT token returned.' })
  @ApiResponse({ status: 401, description: 'Invalid signature.' })
  verifySignature(@Body() body: VerifySignatureDto) {
    return this.authService.verifySignature(
      body.publicAddress,
      body.signature,
      body.message,
    );
  }
}
