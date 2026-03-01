import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SentinelService } from './sentinel.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  PrepareRegisterPositionDto,
  PrepareUpdateRiskConfigDto,
  PrepareRemovePositionDto,
} from './dto/sentinel.dto';

@Controller('sentinel')
@UseGuards(JwtAuthGuard)
export class SentinelController {
  constructor(private readonly sentinelService: SentinelService) {}

  @Post('prepare-register')
  prepareRegister(@Body() dto: PrepareRegisterPositionDto) {
    return this.sentinelService.prepareRegisterPosition(
      dto.vault,
      dto.triggerRiskThreshold,
    );
  }

  @Post('prepare-update-risk')
  prepareUpdateRisk(@Body() dto: PrepareUpdateRiskConfigDto) {
    return this.sentinelService.prepareUpdateRiskConfig(
      dto.positionId,
      dto.newTriggerRiskThreshold,
    );
  }

  @Post('prepare-remove')
  prepareRemove(@Body() dto: PrepareRemovePositionDto) {
    return this.sentinelService.prepareRemovePosition(dto.positionId);
  }

  @Post('prepare-emergency-migrate')
  prepareEmergencyMigrate(@Body() dto: PrepareRemovePositionDto) {
    return this.sentinelService.prepareEmergencyMigrate(dto.positionId);
  }
}
