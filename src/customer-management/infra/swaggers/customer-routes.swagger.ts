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
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateCustomerSwaggerBody,
  CreateCustomerSwaggerConflictResponse,
  CreateCustomerSwaggerResponse,
} from '@/customer-management/infra/swaggers/create-customer.swagger';
import { CustomerNotFoundSwaggerResponse } from '@/customer-management/infra/swaggers/customer.swagger';
import { FindCustomerByIdSwaggerResponse } from '@/customer-management/infra/swaggers/find-customer-by-id.swagger';
import { HttpErrorSwaggerResponse } from '@/customer-management/infra/swaggers/http-error.swagger';
import {
  UpdateCustomerSwaggerBody,
  UpdateCustomerSwaggerResponse,
} from '@/customer-management/infra/swaggers/update-customer.swagger';

export function CustomerApiControllerDocs(): ClassDecorator {
  return applyDecorators(ApiTags('Customers'), ApiBearerAuth());
}

export function CustomerApiListDocs(): MethodDecorator {
  return applyDecorators(ApiOkResponse({ description: 'Lista de clientes' }));
}

export function CustomerApiCreateDocs(): MethodDecorator {
  return applyDecorators(
    ApiBody({ type: CreateCustomerSwaggerBody }),
    ApiCreatedResponse({
      description: 'Cliente cadastrado com sucesso',
      type: CreateCustomerSwaggerResponse,
    }),
    ApiBadRequestResponse({
      description: 'Dados de entrada inválidos',
      type: HttpErrorSwaggerResponse,
    }),
    ApiConflictResponse({
      description: 'Documento já cadastrado no sistema',
      type: CreateCustomerSwaggerConflictResponse,
    }),
  );
}

export function CustomerApiFindByIdDocs(): MethodDecorator {
  return applyDecorators(
    ApiParam({ name: 'id', description: 'ID do cliente', type: String }),
    ApiOkResponse({
      description: 'Cliente encontrado com sucesso',
      type: FindCustomerByIdSwaggerResponse,
    }),
    ApiNotFoundResponse({
      description: 'Cliente não encontrado',
      type: CustomerNotFoundSwaggerResponse,
    }),
  );
}

export function CustomerApiUpdateDocs(): MethodDecorator {
  return applyDecorators(
    ApiParam({ name: 'id', description: 'ID do cliente', type: String }),
    ApiBody({ type: UpdateCustomerSwaggerBody }),
    ApiOkResponse({
      description: 'Cliente atualizado com sucesso',
      type: UpdateCustomerSwaggerResponse,
    }),
    ApiBadRequestResponse({
      description: 'Dados de entrada inválidos',
      type: HttpErrorSwaggerResponse,
    }),
    ApiNotFoundResponse({
      description: 'Cliente não encontrado',
      type: CustomerNotFoundSwaggerResponse,
    }),
  );
}

export function CustomerApiDeleteDocs(): MethodDecorator {
  return applyDecorators(
    ApiParam({ name: 'id', description: 'ID do cliente', type: String }),
    ApiNoContentResponse({ description: 'Cliente excluído com sucesso' }),
    ApiNotFoundResponse({
      description: 'Cliente não encontrado',
      type: CustomerNotFoundSwaggerResponse,
    }),
  );
}
