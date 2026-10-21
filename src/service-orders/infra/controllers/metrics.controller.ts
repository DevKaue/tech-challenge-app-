import { Controller, Get, UseFilters, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/access-identity/infra/guards/jwt-auth.guard';
import { adaptNestRoute } from '@/common/presentation/adapters/nest-route.adapter';
import type { HttpResponse } from '@/common/application/contracts/http';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import GetAverageExecutionTimeController from '@service-orders/presentation/controllers/get-average-execution-time.controller';

type GetAverageExecutionTimeResponse = {
  averageExecutionTimeMinutes: number;
  totalOrdersAnalyzed: number;
  message?: string;
};

@ApiTags('Service Orders')
@ApiBearerAuth()
@Controller('service-orders')
@UseGuards(JwtAuthGuard)
@UseFilters(DomainExceptionFilter)
export class MetricsInfraController {
  constructor(
    private readonly getAverageExecutionTimeController: GetAverageExecutionTimeController,
  ) {}

  @Get('metrics/average-time')
  @ApiOperation({
    summary: 'Tempo medio de execucao (IN_EXECUTION -> FINISHED)',
  })
  @ApiOkResponse({ type: Object })
  getAverageExecutionTime(): Promise<
    HttpResponse<GetAverageExecutionTimeResponse>
  > {
    return adaptNestRoute(this.getAverageExecutionTimeController, {
      body: undefined,
      params: undefined,
      query: undefined,
    });
  }
}
