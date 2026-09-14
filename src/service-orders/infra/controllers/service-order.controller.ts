import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
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
import type { AuthenticatedRequest } from '@/access-identity/presentation/authenticated-request';
import type { RequestWithUser } from '@/access-identity/presentation/interfaces/authenticated-user.interface';
import { JwtAuthGuard } from '@/access-identity/infra/guards/jwt-auth.guard';
import { adaptNestRoute } from '@/common/presentation/adapters/nest-route.adapter';
import type { HttpResponse } from '@/common/application/contracts/http';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import { CreateServiceOrderDto } from '@service-orders/application/dto/service-order/create-service-order.dto';
import { FinishServiceOrderDto } from '@service-orders/application/dto/service-order/finish-service-order.dto';
import { UpdateServiceOrderStatusDto } from '@service-orders/application/dto/service-order/update-service-order-status.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { ServiceOrderStatusDto } from '@service-orders/application/dto/query/service-order-status.dto';
import CloseServiceOrderController from '@service-orders/presentation/controllers/close-service-order.controller';
import CreateServiceOrderController from '@service-orders/presentation/controllers/create-service-order.controller';
import DeliverVehicleController from '@service-orders/presentation/controllers/deliver-vehicle.controller';
import FindAllServiceOrdersController from '@service-orders/presentation/controllers/find-all-service-orders.controller';
import FindOneServiceOrderController from '@service-orders/presentation/controllers/find-one-service-order.controller';
import FinishServiceController from '@service-orders/presentation/controllers/finish-service.controller';
import GetServiceOrderStatusController from '@service-orders/presentation/controllers/get-service-order-status.controller';
import StartServiceController from '@service-orders/presentation/controllers/start-service.controller';
import UpdateServiceOrderStatusController from '@service-orders/presentation/controllers/update-service-order-status.controller';
import {
  ServiceOrderDetailResponse,
  ServiceOrderSummaryResponse,
} from '@service-orders/presentation/presenters/service-order.presenter';

@ApiTags('Service Orders')
@ApiBearerAuth()
@Controller('service-orders')
@UseGuards(JwtAuthGuard)
@UseFilters(DomainExceptionFilter)
export class ServiceOrderInfraController {
  constructor(
    private readonly closeServiceOrderController: CloseServiceOrderController,
    private readonly createServiceOrderController: CreateServiceOrderController,
    private readonly deliverVehicleController: DeliverVehicleController,
    private readonly findAllServiceOrdersController: FindAllServiceOrdersController,
    private readonly findOneServiceOrderController: FindOneServiceOrderController,
    private readonly finishServiceController: FinishServiceController,
    private readonly startServiceController: StartServiceController,
    private readonly getServiceOrderStatusController: GetServiceOrderStatusController,
    private readonly updateServiceOrderStatusController: UpdateServiceOrderStatusController,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma ordem de servico' })
  @ApiCreatedResponse({ type: ServiceOrderResponseDto })
  create(
    @Body() dto: CreateServiceOrderDto,
  ): Promise<HttpResponse<ServiceOrderResponseDto>> {
    return adaptNestRoute(this.createServiceOrderController, {
      body: dto,
      params: undefined,
      query: undefined,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Lista as ordens de servico' })
  @ApiOkResponse({ type: ServiceOrderResponseDto, isArray: true })
  findAll(): Promise<HttpResponse<ServiceOrderSummaryResponse[]>> {
    return adaptNestRoute(this.findAllServiceOrdersController, {
      body: undefined,
      params: undefined,
      query: undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha uma OS com historico de status' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  findOne(
    @Param('id') id: string,
  ): Promise<HttpResponse<ServiceOrderDetailResponse>> {
    return adaptNestRoute(this.findOneServiceOrderController, {
      body: undefined,
      params: { id },
      query: undefined,
    });
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Consulta do status atual da OS' })
  @ApiOkResponse({ type: ServiceOrderStatusDto })
  findStatus(
    @Param('id') id: string,
  ): Promise<HttpResponse<ServiceOrderStatusDto>> {
    return adaptNestRoute(this.getServiceOrderStatusController, {
      body: undefined,
      params: { id },
      query: undefined,
    });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualiza o status atual da OS' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateServiceOrderStatusDto,
    @Req() req: RequestWithUser,
  ): Promise<HttpResponse<ServiceOrderResponseDto>> {
    return adaptNestRoute(this.updateServiceOrderStatusController, {
      body: {
        ...dto,
        userId: req.user.userId,
        email: req.user.email,
      },
      params: { id },
      query: undefined,
    });
  }

  @Patch(':id/start-service')
  @ApiOperation({ summary: 'Inicia a execucao do servico' })
  startService(
    @Param('id') id: string,
  ): Promise<HttpResponse<ServiceOrderResponseDto>> {
    return adaptNestRoute(this.startServiceController, {
      body: undefined,
      params: { id },
      query: undefined,
    });
  }

  @Patch(':id/finish')
  @ApiOperation({ summary: 'Finaliza o servico (apenas o mecanico atribuido)' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  finish(
    @Param('id') id: string,
    @Body() dto: FinishServiceOrderDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<HttpResponse<ServiceOrderResponseDto>> {
    return adaptNestRoute(this.finishServiceController, {
      body: {
        ...dto,
        mechanicId: req.user.userId,
      },
      params: { id },
      query: undefined,
    });
  }

  @Patch(':id/deliver')
  @ApiOperation({ summary: 'Registra a entrega do veiculo' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  deliverVehicle(
    @Param('id') id: string,
  ): Promise<HttpResponse<ServiceOrderResponseDto>> {
    return adaptNestRoute(this.deliverVehicleController, {
      body: undefined,
      params: { id },
      query: undefined,
    });
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Encerra a ordem de servico' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  close(
    @Param('id') id: string,
  ): Promise<HttpResponse<ServiceOrderResponseDto>> {
    return adaptNestRoute(this.closeServiceOrderController, {
      body: undefined,
      params: { id },
      query: undefined,
    });
  }
}
