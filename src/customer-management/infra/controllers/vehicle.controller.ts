import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/access-identity/infra/guards/jwt-auth.guard';
import { RolesGuard } from '@/access-identity/infra/guards/roles.guard';
import { Roles } from '@/access-identity/infra/decorators/roles.decorator';
import { UserRole } from '@/access-identity/domain/enums/user-role.enum';
import { BodyCamelCase } from '@/common/infra/decorators/body-camel-case.decorator';
import { adaptNestRoute } from '@/common/presentation/adapters/nest-route.adapter';
import type { HttpResponse } from '@/common/application/contracts/http';
import ArchiveVehicleController from '@/customer-management/presentation/controllers/archive-vehicle.controller';
import CreateVehicleController from '@/customer-management/presentation/controllers/create-vehicle.controller';
import FindVehicleByIdController from '@/customer-management/presentation/controllers/find-vehicle-by-id.controller';
import ListVehiclesController from '@/customer-management/presentation/controllers/list-vehicles.controller';
import UpdateVehicleController from '@/customer-management/presentation/controllers/update-vehicle.controller';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import {
  VehicleApiControllerDocs,
  VehicleApiCreateDocs,
  VehicleApiDeleteDocs,
  VehicleApiFindByIdDocs,
  VehicleApiListDocs,
  VehicleApiUpdateDocs,
} from '@/customer-management/infra/swaggers/vehicle-routes.swagger';
import type { CreateVehicleInput } from '@/customer-management/application/usecases/create-vehicle.usecase';
import type { UpdateVehicleInput } from '@/customer-management/application/usecases/update-vehicle.usecase';
import type { VehicleResponse } from '@/customer-management/presentation/presenters/json-vehicle.presenter';

@VehicleApiControllerDocs()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ATTENDANT)
@UseFilters(DomainExceptionFilter)
export class VehicleInfraController {
  constructor(
    private readonly createVehicleController: CreateVehicleController,
    private readonly findVehicleByIdController: FindVehicleByIdController,
    private readonly listVehiclesController: ListVehiclesController,
    private readonly updateVehicleController: UpdateVehicleController,
    private readonly archiveVehicleController: ArchiveVehicleController,
  ) {}

  @Get('vehicles')
  @VehicleApiListDocs()
  list(
    @Query('customerId') customerId: string | undefined,
  ): Promise<HttpResponse<VehicleResponse[]>> {
    return adaptNestRoute(this.listVehiclesController, {
      body: undefined,
      params: undefined,
      query: { customerId },
    });
  }

  @Post('customers/:customerId/vehicles')
  @VehicleApiCreateDocs()
  create(
    @Param('customerId') customerId: string,
    @BodyCamelCase() input: Omit<CreateVehicleInput, 'customerId'>,
  ): Promise<HttpResponse<VehicleResponse>> {
    return adaptNestRoute(this.createVehicleController, {
      body: input,
      params: { customerId },
      query: undefined,
    });
  }

  @Get('vehicles/:id')
  @VehicleApiFindByIdDocs()
  findById(@Param('id') id: string): Promise<HttpResponse<VehicleResponse>> {
    return adaptNestRoute(this.findVehicleByIdController, {
      body: undefined,
      params: { id },
      query: undefined,
    });
  }

  @Patch('vehicles/:id')
  @VehicleApiUpdateDocs()
  update(
    @Param('id') id: string,
    @BodyCamelCase() input: Omit<UpdateVehicleInput, 'id'>,
  ): Promise<HttpResponse<VehicleResponse>> {
    return adaptNestRoute(this.updateVehicleController, {
      body: input,
      params: { id },
      query: undefined,
    });
  }

  @Delete('vehicles/:id')
  @VehicleApiDeleteDocs()
  delete(@Param('id') id: string): Promise<HttpResponse<void>> {
    return adaptNestRoute(this.archiveVehicleController, {
      body: undefined,
      params: { id },
      query: undefined,
    });
  }
}
