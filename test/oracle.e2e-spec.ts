import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ethers } from 'ethers';

describe('OracleController (e2e)', () => {
    let app: INestApplication;
    let wallet: ethers.Wallet;
    let accessToken: string;
    const dummyAddress = ethers.Wallet.createRandom().address;

    beforeAll(async () => {
        // Set environment variables for the test
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

        // Authenticate to get JWT token
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
                .post('/oracle/prepare-add-oracle')
                .send({ oracleAddress: dummyAddress })
                .expect(401);
        });
    });

    describe('/oracle/prepare-add-oracle (POST)', () => {
        it('should return transaction data for adding an oracle', () => {
            return request(app.getHttpServer())
                .post('/oracle/prepare-add-oracle')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ oracleAddress: dummyAddress })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('to');
                    expect(res.body).toHaveProperty('data');
                    expect(res.body.to).toBe(process.env.RISK_ORACLE_ADDRESS);
                });
        });

        it('should fail with invalid oracleAddress', () => {
            return request(app.getHttpServer())
                .post('/oracle/prepare-add-oracle')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ oracleAddress: 'invalid-address' })
                .expect(400);
        });
    });

    describe('/oracle/prepare-remove-oracle (POST)', () => {
        it('should return transaction data for removing an oracle', () => {
            return request(app.getHttpServer())
                .post('/oracle/prepare-remove-oracle')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ oracleAddress: dummyAddress })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('to');
                    expect(res.body).toHaveProperty('data');
                    expect(res.body.to).toBe(process.env.RISK_ORACLE_ADDRESS);
                });
        });

        it('should fail with invalid oracleAddress', () => {
            return request(app.getHttpServer())
                .post('/oracle/prepare-remove-oracle')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ oracleAddress: 'not-an-address' })
                .expect(400);
        });
    });

    describe('/oracle/prepare-submit-signal (POST)', () => {
        it('should return transaction data for submitting a signal', () => {
            return request(app.getHttpServer())
                .post('/oracle/prepare-submit-signal')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ vaultAddress: dummyAddress, riskScore: '80' })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('to');
                    expect(res.body).toHaveProperty('data');
                    expect(res.body.to).toBe(process.env.RISK_ORACLE_ADDRESS);
                });
        });

        it('should fail with missing vaultAddress', () => {
            return request(app.getHttpServer())
                .post('/oracle/prepare-submit-signal')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ riskScore: '80' })
                .expect(400);
        });

        it('should fail with non-numeric riskScore', () => {
            return request(app.getHttpServer())
                .post('/oracle/prepare-submit-signal')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ vaultAddress: dummyAddress, riskScore: 'invalid' })
                .expect(400);
        });
    });

    describe('/oracle/prepare-reset-circuit-breaker (POST)', () => {
        it('should return transaction data for resetting circuit breaker', () => {
            return request(app.getHttpServer())
                .post('/oracle/prepare-reset-circuit-breaker')
                .set('Authorization', `Bearer ${accessToken}`)
                .send()
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('to');
                    expect(res.body).toHaveProperty('data');
                    expect(res.body.to).toBe(process.env.RISK_ORACLE_ADDRESS);
                });
        });
    });
});
