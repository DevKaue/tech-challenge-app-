import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/access-identity/infra/guards/jwt-auth.guard';
import { adaptNestRoute } from '@/common/presentation/adapters/nest-route.adapter';
import type { HttpResponse } from '@/common/application/contracts/http';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import { AddEstimateItemDto } from '@service-orders/application/dto/estimate/add-estimate-item.dto';
import {
  EstimateItemDto,
  EstimateResponseDto,
} from '@service-orders/application/dto/estimate/estimate-response.dto';
import { RejectEstimateDto } from '@service-orders/application/dto/estimate/reject-estimate.dto';
import { UpdateEstimateStatusDto } from '@service-orders/application/dto/estimate/update-estimate-status.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import AddEstimateItemController from '@service-orders/presentation/controllers/add-estimate-item.controller';
import CreateEstimateController from '@service-orders/presentation/controllers/create-estimate.controller';
import RejectEstimateController from '@service-orders/presentation/controllers/reject-estimate.controller';
import UpdateEstimateStatusController from '@service-orders/presentation/controllers/update-estimate-status.controller';

@ApiTags('Service Orders')
@ApiBearerAuth()
@Controller('service-orders')
@UseGuards(JwtAuthGuard)
@UseFilters(DomainExceptionFilter)
export class EstimateInfraController {
  constructor(
    private readonly addEstimateItemController: AddEstimateItemController,
    private readonly createEstimateController: CreateEstimateController,
    private readonly rejectEstimateController: RejectEstimateController,
    private readonly updateEstimateStatusController: UpdateEstimateStatusController,
  ) {}

  @Post(':id/estimates')
  @ApiOperation({ summary: 'Gera o orcamento da OS e envia para aprovacao' })
  @ApiCreatedResponse({ type: EstimateResponseDto })
  createEstimate(
    @Param('id') id: string,
  ): Promise<HttpResponse<EstimateResponseDto>> {
    return adaptNestRoute(this.createEstimateController, {
      body: undefined,
      params: { id },
      query: undefined,
    });
  }

  @Post('estimates/:estimateId/items')
  @ApiOperation({ summary: 'Adiciona um item (peca/servico) ao orcamento' })
  @ApiCreatedResponse({ type: EstimateItemDto })
  addEstimateItem(
    @Param('estimateId') estimateId: string,
    @Body() dto: AddEstimateItemDto,
  ): Promise<HttpResponse<EstimateItemDto>> {
    return adaptNestRoute(this.addEstimateItemController, {
      body: dto,
      params: { estimateId },
      query: undefined,
    });
  }

  @Patch('estimates/:estimateId/status')
  @ApiOperation({ summary: 'Aprova ou rejeita o orcamento' })
  @ApiOkResponse({ type: EstimateResponseDto })
  updateEstimateStatus(
    @Param('estimateId') estimateId: string,
    @Body() dto: UpdateEstimateStatusDto,
  ): Promise<HttpResponse<EstimateResponseDto>> {
    return adaptNestRoute(this.updateEstimateStatusController, {
      body: dto,
      params: { estimateId },
      query: undefined,
    });
  }

  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Rejeita o orcamento e retorna a OS ao diagnostico',
  })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  rejectEstimate(
    @Param('id') id: string,
    @Body() dto: RejectEstimateDto,
  ): Promise<HttpResponse<ServiceOrderResponseDto>> {
    return adaptNestRoute(this.rejectEstimateController, {
      body: dto,
      params: { id },
      query: undefined,
    });
  }
}
