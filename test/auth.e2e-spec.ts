import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ethers } from 'ethers';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let wallet: ethers.Wallet;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        // Create a random wallet for testing
        wallet = ethers.Wallet.createRandom();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/auth/nonce (GET)', () => {
        it('should fail if publicAddress is not provided', () => {
            return request(app.getHttpServer())
                .get('/auth/nonce')
                .expect(400)
                .expect((res) => {
                    expect(res.body.message).toEqual(
                        expect.arrayContaining(['publicAddress must be a string']),
                    );
                });
        });

        it('should return a nonce and messageToSign for a valid publicAddress', () => {
            return request(app.getHttpServer())
                .get(`/auth/nonce?publicAddress=${wallet.address}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('nonce');
                    expect(res.body).toHaveProperty('messageToSign');
                    expect(typeof res.body.nonce).toBe('string');
                    expect(res.body.messageToSign).toContain(wallet.address);
                });
        });
    });

    describe('/auth/verify (POST)', () => {
        it('should verify the signature and return an access token', async () => {
            // 1. Get nonce and message to sign
            const nonceRes = await request(app.getHttpServer())
                .get(`/auth/nonce?publicAddress=${wallet.address}`)
                .expect(200);

            const messageToSign = nonceRes.body.messageToSign;

            // 2. Sign the message
            const signature = await wallet.signMessage(messageToSign);

            // 3. Verify
            return request(app.getHttpServer())
                .post('/auth/verify')
                .send({
                    publicAddress: wallet.address,
                    signature: signature,
                    message: messageToSign,
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('access_token');
                    expect(typeof res.body.access_token).toBe('string');
                });
        });

        it('should fail with an invalid signature', async () => {
            const nonceRes = await request(app.getHttpServer())
                .get(`/auth/nonce?publicAddress=${wallet.address}`)
                .expect(200);

            const messageToSign = nonceRes.body.messageToSign;

            // Sign with a DIFFERENT wallet
            const wrongWallet = ethers.Wallet.createRandom();
            const signature = await wrongWallet.signMessage(messageToSign);

            return request(app.getHttpServer())
                .post('/auth/verify')
                .send({
                    publicAddress: wallet.address,
                    signature: signature,
                    message: messageToSign,
                })
                .expect(401)
                .expect((res) => {
                    expect(res.body.message).toEqual('Invalid signature');
                });
        });

        it('should fail if required fields are missing', () => {
            return request(app.getHttpServer())
                .post('/auth/verify')
                .send({
                    publicAddress: wallet.address,
                    // Missing signature and message
                })
                .expect(400);
        });
    });
});
