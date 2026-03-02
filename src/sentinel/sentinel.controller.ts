import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SentinelService } from './sentinel.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  PrepareRegisterPositionDto,
  PrepareUpdateRiskConfigDto,
  PrepareRemovePositionDto,
} from './dto/sentinel.dto';

@ApiTags('sentinel')
@ApiBearerAuth()
@Controller('sentinel')
@UseGuards(JwtAuthGuard)
export class SentinelController {
  constructor(private readonly sentinelService: SentinelService) { }

  @Post('prepare-register')
  @ApiOperation({ summary: 'Prepare transaction to register a new user position' })
  @ApiResponse({ status: 201, description: 'Transaction parameters for registering position' })
  prepareRegister(@Body() dto: PrepareRegisterPositionDto) {
    return this.sentinelService.prepareRegisterPosition(
      dto.vault,
      dto.triggerRiskThreshold,
    );
  }

  @Post('prepare-update-risk')
  @ApiOperation({ summary: 'Prepare transaction to update risk config for a position' })
  @ApiResponse({ status: 201, description: 'Transaction parameters for updating risk config' })
  prepareUpdateRisk(@Body() dto: PrepareUpdateRiskConfigDto) {
    return this.sentinelService.prepareUpdateRiskConfig(
      dto.positionId,
      dto.newTriggerRiskThreshold,
    );
  }

  @Post('prepare-remove')
  @ApiOperation({ summary: 'Prepare transaction to remove a user position' })
  @ApiResponse({ status: 201, description: 'Transaction parameters for removing position' })
  prepareRemove(@Body() dto: PrepareRemovePositionDto) {
    return this.sentinelService.prepareRemovePosition(dto.positionId);
  }

  @Post('prepare-emergency-migrate')
  @ApiOperation({ summary: 'Prepare transaction for emergency migration' })
  @ApiResponse({ status: 201, description: 'Transaction parameters for emergency migrate' })
  prepareEmergencyMigrate(@Body() dto: PrepareRemovePositionDto) {
    return this.sentinelService.prepareEmergencyMigrate(dto.positionId);
  }
}
