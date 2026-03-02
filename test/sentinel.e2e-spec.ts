import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ethers } from 'ethers';

describe('SentinelController (e2e)', () => {
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
                .post('/sentinel/prepare-register')
                .send({ vault: dummyAddress, triggerRiskThreshold: '80' })
                .expect(401);
        });
    });

    describe('/sentinel/prepare-register (POST)', () => {
        it('should return transaction data for registering a position', () => {
            return request(app.getHttpServer())
                .post('/sentinel/prepare-register')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ vault: dummyAddress, triggerRiskThreshold: '80' })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('to');
                    expect(res.body).toHaveProperty('data');
                    expect(res.body.to).toBe(process.env.AEGIS_SENTINEL_ADDRESS);
                });
        });

        it('should fail with missing vault address', () => {
            return request(app.getHttpServer())
                .post('/sentinel/prepare-register')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ triggerRiskThreshold: '80' })
                .expect(400);
        });
    });

    describe('/sentinel/prepare-update-risk (POST)', () => {
        it('should return transaction data for updating risk config', () => {
            return request(app.getHttpServer())
                .post('/sentinel/prepare-update-risk')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    positionId: '0x1234',
                    newTriggerRiskThreshold: '90',
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('to');
                    expect(res.body).toHaveProperty('data');
                    expect(res.body.to).toBe(process.env.AEGIS_SENTINEL_ADDRESS);
                });
        });

        it('should fail with missing positionId', () => {
            return request(app.getHttpServer())
                .post('/sentinel/prepare-update-risk')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ newTriggerRiskThreshold: '90' })
                .expect(400);
        });
    });

    describe('/sentinel/prepare-remove (POST)', () => {
        it('should return transaction data for removing a position', () => {
            return request(app.getHttpServer())
                .post('/sentinel/prepare-remove')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ positionId: '0x1234' })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('to');
                    expect(res.body).toHaveProperty('data');
                    expect(res.body.to).toBe(process.env.AEGIS_SENTINEL_ADDRESS);
                });
        });
    });

    describe('/sentinel/prepare-emergency-migrate (POST)', () => {
        it('should return transaction data for emergency migration', () => {
            return request(app.getHttpServer())
                .post('/sentinel/prepare-emergency-migrate')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ positionId: '0x1234' })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('to');
                    expect(res.body).toHaveProperty('data');
                    expect(res.body.to).toBe(process.env.AEGIS_SENTINEL_ADDRESS);
                });
        });
    });
});
