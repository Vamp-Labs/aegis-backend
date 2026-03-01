import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { OracleService } from './oracle.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  PrepareAddOracleDto,
  PrepareRemoveOracleDto,
  PrepareSubmitSignalDto,
} from './dto/oracle.dto';

@Controller('oracle')
@UseGuards(JwtAuthGuard)
export class OracleController {
  constructor(private readonly oracleService: OracleService) {}

  @Post('prepare-add-oracle')
  prepareAddOracle(@Body() dto: PrepareAddOracleDto) {
    return this.oracleService.prepareAddOracle(dto.oracleAddress);
  }

  @Post('prepare-remove-oracle')
  prepareRemoveOracle(@Body() dto: PrepareRemoveOracleDto) {
    return this.oracleService.prepareRemoveOracle(dto.oracleAddress);
  }

  @Post('prepare-submit-signal')
  prepareSubmitSignal(@Body() dto: PrepareSubmitSignalDto) {
    return this.oracleService.prepareSubmitSignal(
      dto.vaultAddress,
      dto.riskScore,
    );
  }

  @Post('prepare-reset-circuit-breaker')
  prepareResetCircuitBreaker() {
    return this.oracleService.prepareResetCircuitBreaker();
  }
}
