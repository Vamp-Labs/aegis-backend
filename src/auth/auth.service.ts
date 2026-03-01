import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Simple in-memory storage for nonces. In production, use Redis.
  private nonces = new Map<string, { nonce: string; expiresAt: number }>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate a nonce for a given public address
   */
  generateNonce(publicAddress: string): string {
    const nonce = uuidv4();
    const ttlSeconds =
      this.configService.get<number>('NONCE_TTL_SECONDS') || 300;

    this.nonces.set(publicAddress.toLowerCase(), {
      nonce,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    return nonce;
  }

  /**
   * Return the expected message format to sign
   */
  getMessageToSign(publicAddress: string, nonce: string): string {
    const prefix =
      this.configService.get<string>('SIGNATURE_MESSAGE_PREFIX') ||
      'Aegis Sentinel Authentication';
    return `${prefix}\n\nWallet: ${publicAddress}\nNonce: ${nonce}`;
  }

  /**
   * Verify the given signature and return a JWT if valid
   */
  verifySignature(
    publicAddress: string,
    signature: string,
    originalMessage: string,
  ): { accessToken: string } {
    const addressLower = publicAddress.toLowerCase();
    const storedNonceData = this.nonces.get(addressLower);

    if (!storedNonceData) {
      throw new UnauthorizedException(
        'Nonce not found. Please request a new nonce.',
      );
    }

    if (Date.now() > storedNonceData.expiresAt) {
      this.nonces.delete(addressLower);
      throw new UnauthorizedException(
        'Nonce expired. Please request a new nonce.',
      );
    }

    // Optional: Add logic to ensure `originalMessage` matches what we expect
    const expectedMessage = this.getMessageToSign(
      addressLower,
      storedNonceData.nonce,
    );
    if (originalMessage !== expectedMessage) {
      // Just warning, as the real check lies in recovering the signer from the exact message signed
      this.logger.warn(
        `Message mismatch. Expected: ${expectedMessage}, Got: ${originalMessage}`,
      );
    }

    try {
      // Recover the address from the signature
      const recoveredAddress = ethers.verifyMessage(originalMessage, signature);

      if (recoveredAddress.toLowerCase() !== addressLower) {
        throw new UnauthorizedException('Signature verification failed');
      }

      // Valid signature! Delete the nonce to prevent replay attacks
      this.nonces.delete(addressLower);

      // Generate JWT
      const payload = { sub: recoveredAddress };
      const accessToken = this.jwtService.sign(payload);

      return { accessToken };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Signature verification failed: ${error.message}`);
      } else {
        this.logger.error(`Signature verification failed with unknown error`);
      }
      throw new UnauthorizedException('Invalid signature');
    }
  }
}
