import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RegistryService } from './registry.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  PrepareAddVaultDto,
  PrepareUpdateVaultDto,
  PrepareRemoveVaultDto,
} from './dto/registry.dto';

@ApiTags('registry')
@ApiBearerAuth()
@Controller('registry')
@UseGuards(JwtAuthGuard)
export class RegistryController {
  constructor(private readonly registryService: RegistryService) { }

  @Post('prepare-add-vault')
  @ApiOperation({ summary: 'Prepare transaction to add a new vault' })
  @ApiResponse({ status: 201, description: 'Transaction parameters for adding vault' })
  prepareAddVault(@Body() dto: PrepareAddVaultDto) {
    return this.registryService.prepareAddVault(
      dto.vault,
      dto.initialRiskScore,
    );
  }

  @Post('prepare-update-vault')
  @ApiOperation({ summary: 'Prepare transaction to update vault status' })
  @ApiResponse({ status: 201, description: 'Transaction parameters for updating vault status' })
  prepareUpdateVault(@Body() dto: PrepareUpdateVaultDto) {
    return this.registryService.prepareUpdateVault(dto.vault, dto.isActive);
  }

  @Post('prepare-remove-vault')
  @ApiOperation({ summary: 'Prepare transaction to remove a vault' })
  @ApiResponse({ status: 201, description: 'Transaction parameters for removing vault' })
  prepareRemoveVault(@Body() dto: PrepareRemoveVaultDto) {
    return this.registryService.prepareRemoveVault(dto.vault);
  }
}
