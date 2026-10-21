import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/access-identity/infra/guards/jwt-auth.guard';
import { RolesGuard } from '@/access-identity/infra/guards/roles.guard';
import { Roles } from '@/access-identity/infra/decorators/roles.decorator';
import { UserRole } from '@/access-identity/domain/enums/user-role.enum';
import { adaptNestRoute } from '@/common/presentation/adapters/nest-route.adapter';
import type { HttpResponse } from '@/common/application/contracts/http';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import type { ServiceDTO } from '@service-orders/catalog/application/dtos/service.dtos';
import { CreateServiceRequestDto } from '@service-orders/catalog/presentation/dto/create-service-request.dto';
import { UpdateServiceRequestDto } from '@service-orders/catalog/presentation/dto/update-service-request.dto';
import CreateServiceCatalogController from '@service-orders/catalog/presentation/controllers/create-service-catalog.controller';
import DeleteServiceCatalogController from '@service-orders/catalog/presentation/controllers/delete-service-catalog.controller';
import FindServiceCatalogByIdController from '@service-orders/catalog/presentation/controllers/find-service-catalog-by-id.controller';
import ListServiceCatalogController from '@service-orders/catalog/presentation/controllers/list-service-catalog.controller';
import UpdateServiceCatalogController from '@service-orders/catalog/presentation/controllers/update-service-catalog.controller';

@ApiTags('Service Catalog')
@ApiBearerAuth()
@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ATTENDANT)
@UseFilters(DomainExceptionFilter)
export class ServiceCatalogInfraController {
  constructor(
    private readonly createServiceCatalogController: CreateServiceCatalogController,
    private readonly deleteServiceCatalogController: DeleteServiceCatalogController,
    private readonly findServiceCatalogByIdController: FindServiceCatalogByIdController,
    private readonly listServiceCatalogController: ListServiceCatalogController,
    private readonly updateServiceCatalogController: UpdateServiceCatalogController,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um servico no catalogo' })
  create(
    @Body() dto: CreateServiceRequestDto,
  ): Promise<HttpResponse<ServiceDTO>> {
    return adaptNestRoute(this.createServiceCatalogController, {
      body: dto,
      params: undefined,
      query: undefined,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Lista os servicos do catalogo' })
  list(): Promise<HttpResponse<ServiceDTO[]>> {
    return adaptNestRoute(this.listServiceCatalogController, {
      body: undefined,
      params: undefined,
      query: undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha um servico do catalogo' })
  findById(@Param('id') id: string): Promise<HttpResponse<ServiceDTO>> {
    return adaptNestRoute(this.findServiceCatalogByIdController, {
      body: undefined,
      params: { id },
      query: undefined,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um servico do catalogo' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceRequestDto,
  ): Promise<HttpResponse<ServiceDTO>> {
    return adaptNestRoute(this.updateServiceCatalogController, {
      body: dto,
      params: { id },
      query: undefined,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um servico do catalogo' })
  delete(@Param('id') id: string): Promise<HttpResponse<void>> {
    return adaptNestRoute(this.deleteServiceCatalogController, {
      body: undefined,
      params: { id },
      query: undefined,
    });
  }
}
