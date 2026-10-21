import {
  Body,
  Controller,
  Param,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { adaptNestRoute } from '@/common/presentation/adapters/nest-route.adapter';
import type { HttpResponse } from '@/common/application/contracts/http';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import { WebhookAuthGuard } from '@service-orders/infra/guards/webhook-auth.guard';
import { EstimateResponseDto } from '@service-orders/application/dto/estimate/estimate-response.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { UpdateEstimateStatusExternalDto } from '@service-orders/application/dto/estimate/update-estimate-status-external.dto';
import UpdateEstimateStatusExternalController from '@service-orders/presentation/controllers/update-estimate-status-external.controller';

@ApiTags('Service Orders')
@Controller('service-orders')
@UseGuards(WebhookAuthGuard)
@UseFilters(DomainExceptionFilter)
export class EstimateNotificationInfraController {
  constructor(
    private readonly updateEstimateStatusExternalController: UpdateEstimateStatusExternalController,
  ) {}

  @Post('estimates/:estimateId/external-status')
  @ApiOperation({
    summary: 'Recebe notificacao externa de aprovacao ou recusa do orcamento',
  })
  @ApiOkResponse({ type: EstimateResponseDto })
  @ApiHeader({ name: 'x-webhook-signature', required: true })
  updateEstimateStatusExternal(
    @Param('estimateId') estimateId: string,
    @Body() dto: UpdateEstimateStatusExternalDto,
  ): Promise<HttpResponse<EstimateResponseDto | ServiceOrderResponseDto>> {
    return adaptNestRoute(this.updateEstimateStatusExternalController, {
      body: dto,
      params: { estimateId },
      query: undefined,
    });
  }
}
