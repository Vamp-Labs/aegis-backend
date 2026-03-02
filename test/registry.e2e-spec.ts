import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ethers } from 'ethers';

describe('RegistryController (e2e)', () => {
    let app: INestApplication;
    let wallet: ethers.Wallet;
    let accessToken: string;
    const dummyAddress = ethers.Wallet.createRandom().address;

    beforeAll(async () => {
        process.env.AEGIS_SENTINEL_ADDRESS = dummyAddress;
        process.env.SAFE_HAVEN_REGISTRY_ADDRESS = dummyAddress;
        process.env.RISK_ORACLE_ADDRESS = dummyAddress;
        process.env.JWT_SECRET = 'test-secret';
        process.env.RPC_URL = 'http://127.0.0.1:8545';

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        wallet = ethers.Wallet.createRandom();

        // Authenticate
        const nonceRes = await request(app.getHttpServer())
            .get(`/auth/nonce?publicAddress=${wallet.address}`)
            .expect(200);

        const messageToSign = nonceRes.body.messageToSign;
        const signature = await wallet.signMessage(messageToSign);

        const verifyRes = await request(app.getHttpServer())
            .post('/auth/verify')
            .send({
                publicAddress: wallet.address,
                signature: signature,
                message: messageToSign,
            })
            .expect(201);

        accessToken = verifyRes.body.access_token;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Authentication Check', () => {
        it('should reject requests without a valid JWT token', () => {
            return request(app.getHttpServer())
                .post('/registry/prepare-add-vault')
                .send({ vault: dummyAddress, initialRiskScore: '10' })
                .expect(401);
        });
    });

    describe('/registry/prepare-add-vault (POST)', () => {
        it('should return transaction data for adding a vault', () => {
            return request(app.getHttpServer())
                .post('/registry/prepare-add-vault')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ vault: dummyAddress, initialRiskScore: '10' })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('to');
                    expect(res.body).toHaveProperty('data');
                    expect(res.body.to).toBe(process.env.SAFE_HAVEN_REGISTRY_ADDRESS);
                });
        });

        it('should fail with invalid vault address', () => {
            return request(app.getHttpServer())
                .post('/registry/prepare-add-vault')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ vault: 'invalid', initialRiskScore: '10' })
                .expect(400);
        });
    });

    describe('/registry/prepare-update-vault (POST)', () => {
        it('should return transaction data for updating a vault', () => {
            return request(app.getHttpServer())
                .post('/registry/prepare-update-vault')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ vault: dummyAddress, isActive: true })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('to');
                    expect(res.body).toHaveProperty('data');
                    expect(res.body.to).toBe(process.env.SAFE_HAVEN_REGISTRY_ADDRESS);
                });
        });

        it('should fail if isActive is not boolean', () => {
            return request(app.getHttpServer())
                .post('/registry/prepare-update-vault')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ vault: dummyAddress, isActive: 'true' })
                .expect(400);
        });
    });

    describe('/registry/prepare-remove-vault (POST)', () => {
        it('should return transaction data for removing a vault', () => {
            return request(app.getHttpServer())
                .post('/registry/prepare-remove-vault')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ vault: dummyAddress })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('to');
                    expect(res.body).toHaveProperty('data');
                    expect(res.body.to).toBe(process.env.SAFE_HAVEN_REGISTRY_ADDRESS);
                });
        });
    });
});
