import { Test, TestingModule } from '@nestjs/testing';
import { SentinelService } from './sentinel.service';

describe('SentinelService', () => {
  let service: SentinelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SentinelService],
    }).compile();

    service = module.get<SentinelService>(SentinelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
