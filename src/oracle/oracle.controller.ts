import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OracleService } from './oracle.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  PrepareAddOracleDto,
  PrepareRemoveOracleDto,
  PrepareSubmitSignalDto,
} from './dto/oracle.dto';

@ApiTags('oracle')
@ApiBearerAuth()
@Controller('oracle')
@UseGuards(JwtAuthGuard)
export class OracleController {
  constructor(private readonly oracleService: OracleService) { }

  @Post('prepare-add-oracle')
  @ApiOperation({ summary: 'Prepare transaction to add a risk oracle' })
  @ApiResponse({ status: 201, description: 'Transaction parameters for adding an oracle' })
  prepareAddOracle(@Body() dto: PrepareAddOracleDto) {
    return this.oracleService.prepareAddOracle(dto.oracleAddress);
  }

  @Post('prepare-remove-oracle')
  @ApiOperation({ summary: 'Prepare transaction to remove a risk oracle' })
  @ApiResponse({ status: 201, description: 'Transaction parameters for removing an oracle' })
  prepareRemoveOracle(@Body() dto: PrepareRemoveOracleDto) {
    return this.oracleService.prepareRemoveOracle(dto.oracleAddress);
  }

  @Post('prepare-submit-signal')
  @ApiOperation({ summary: 'Prepare transaction to submit a risk signal' })
  @ApiResponse({ status: 201, description: 'Transaction parameters for submitting risk score' })
  prepareSubmitSignal(@Body() dto: PrepareSubmitSignalDto) {
    return this.oracleService.prepareSubmitSignal(
      dto.vaultAddress,
      dto.riskScore,
    );
  }

  @Post('prepare-reset-circuit-breaker')
  @ApiOperation({ summary: 'Prepare transaction to reset the circuit breaker' })
  @ApiResponse({ status: 201, description: 'Transaction parameters for resetting circuit breaker' })
  prepareResetCircuitBreaker() {
    return this.oracleService.prepareResetCircuitBreaker();
  }
}
