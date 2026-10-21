import {
  Body,
  Controller,
  Param,
  Patch,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '@/access-identity/presentation/authenticated-request';
import { JwtAuthGuard } from '@/access-identity/infra/guards/jwt-auth.guard';
import { adaptNestRoute } from '@/common/presentation/adapters/nest-route.adapter';
import type { HttpResponse } from '@/common/application/contracts/http';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import { AssignMechanicDto } from '@service-orders/application/dto/mechanic/assign-mechanic.dto';
import { UpdateMechanicAvailabilityDto } from '@service-orders/application/dto/mechanic/update-mechanic-availability.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import AssignMechanicController from '@service-orders/presentation/controllers/assign-mechanic.controller';
import UpdateMechanicAvailabilityController from '@service-orders/presentation/controllers/update-mechanic-availability.controller';

@ApiTags('Service Orders')
@ApiBearerAuth()
@Controller('service-orders')
@UseGuards(JwtAuthGuard)
@UseFilters(DomainExceptionFilter)
export class MechanicInfraController {
  constructor(
    private readonly assignMechanicController: AssignMechanicController,
    private readonly updateMechanicAvailabilityController: UpdateMechanicAvailabilityController,
  ) {}

  @Patch(':id/mechanic')
  @ApiOperation({ summary: 'Atribui um mecanico a OS' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  assignMechanic(
    @Param('id') id: string,
    @Body() dto: AssignMechanicDto,
  ): Promise<HttpResponse<ServiceOrderResponseDto>> {
    return adaptNestRoute(this.assignMechanicController, {
      body: dto,
      params: { id },
      query: undefined,
    });
  }

  @Patch('me/availability')
  @ApiOperation({ summary: 'Atualiza a disponibilidade do mecanico logado' })
  updateMechanicAvailability(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateMechanicAvailabilityDto,
  ): Promise<HttpResponse<void>> {
    return adaptNestRoute(this.updateMechanicAvailabilityController, {
      body: dto,
      params: { mechanicId: req.user.userId },
      query: undefined,
    });
  }
}
