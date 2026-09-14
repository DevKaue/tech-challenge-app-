import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateVehicleSwaggerBody,
  CreateVehicleSwaggerConflictResponse,
  CreateVehicleSwaggerResponse,
} from '@/customer-management/infra/swaggers/create-vehicle.swagger';
import { CustomerNotFoundSwaggerResponse } from '@/customer-management/infra/swaggers/customer.swagger';
import { FindVehicleByIdSwaggerResponse } from '@/customer-management/infra/swaggers/find-vehicle-by-id.swagger';
import { HttpErrorSwaggerResponse } from '@/customer-management/infra/swaggers/http-error.swagger';
import {
  UpdateVehicleSwaggerBody,
  UpdateVehicleSwaggerConflictResponse,
  UpdateVehicleSwaggerResponse,
} from '@/customer-management/infra/swaggers/update-vehicle.swagger';
import { VehicleNotFoundSwaggerResponse } from '@/customer-management/infra/swaggers/vehicle.swagger';

export function VehicleApiControllerDocs(): ClassDecorator {
  return applyDecorators(ApiTags('Vehicles'), ApiBearerAuth());
}

export function VehicleApiListDocs(): MethodDecorator {
  return applyDecorators(
    ApiQuery({ name: 'customerId', required: false, type: String }),
    ApiOkResponse({ description: 'Lista de veículos' }),
  );
}

export function VehicleApiCreateDocs(): MethodDecorator {
  return applyDecorators(
    ApiBody({ type: CreateVehicleSwaggerBody }),
    ApiCreatedResponse({
      description: 'Veículo cadastrado com sucesso',
      type: CreateVehicleSwaggerResponse,
    }),
    ApiBadRequestResponse({
      description: 'Dados de entrada inválidos',
      type: HttpErrorSwaggerResponse,
    }),
    ApiConflictResponse({
      description: 'Placa já cadastrada no sistema',
      type: CreateVehicleSwaggerConflictResponse,
    }),
    ApiNotFoundResponse({
      description: 'Cliente não encontrado',
      type: CustomerNotFoundSwaggerResponse,
    }),
  );
}

export function VehicleApiFindByIdDocs(): MethodDecorator {
  return applyDecorators(
    ApiParam({ name: 'id', description: 'ID do veículo', type: String }),
    ApiOkResponse({
      description: 'Veículo encontrado com sucesso',
      type: FindVehicleByIdSwaggerResponse,
    }),
    ApiNotFoundResponse({
      description: 'Veículo não encontrado',
      type: VehicleNotFoundSwaggerResponse,
    }),
  );
}

export function VehicleApiUpdateDocs(): MethodDecorator {
  return applyDecorators(
    ApiBody({ type: UpdateVehicleSwaggerBody }),
    ApiParam({ name: 'id', description: 'ID do veículo', type: String }),
    ApiOkResponse({
      description: 'Veículo atualizado com sucesso',
      type: UpdateVehicleSwaggerResponse,
    }),
    ApiBadRequestResponse({
      description: 'Dados de entrada inválidos',
      type: HttpErrorSwaggerResponse,
    }),
    ApiConflictResponse({
      description: 'Placa já cadastrada no sistema',
      type: UpdateVehicleSwaggerConflictResponse,
    }),
    ApiNotFoundResponse({
      description: 'Veículo não encontrado',
      type: VehicleNotFoundSwaggerResponse,
    }),
  );
}

export function VehicleApiDeleteDocs(): MethodDecorator {
  return applyDecorators(
    ApiParam({ name: 'id', description: 'ID do veículo', type: String }),
    ApiNoContentResponse({
      description: 'Veículo excluído com sucesso',
    }),
    ApiNotFoundResponse({
      description: 'Veículo não encontrado',
      type: VehicleNotFoundSwaggerResponse,
    }),
  );
}
