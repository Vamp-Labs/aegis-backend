import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { RegistryService } from './registry.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  PrepareAddVaultDto,
  PrepareUpdateVaultDto,
  PrepareRemoveVaultDto,
} from './dto/registry.dto';

@Controller('registry')
@UseGuards(JwtAuthGuard)
export class RegistryController {
  constructor(private readonly registryService: RegistryService) {}

  @Post('prepare-add-vault')
  prepareAddVault(@Body() dto: PrepareAddVaultDto) {
    return this.registryService.prepareAddVault(
      dto.vault,
      dto.initialRiskScore,
    );
  }

  @Post('prepare-update-vault')
  prepareUpdateVault(@Body() dto: PrepareUpdateVaultDto) {
    return this.registryService.prepareUpdateVault(dto.vault, dto.isActive);
  }

  @Post('prepare-remove-vault')
  prepareRemoveVault(@Body() dto: PrepareRemoveVaultDto) {
    return this.registryService.prepareRemoveVault(dto.vault);
  }
}
