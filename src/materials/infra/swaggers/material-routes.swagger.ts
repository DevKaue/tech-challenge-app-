import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import AddMaterialStockRequestDto from '@materials/infra/dto/add-material-stock.request.dto';
import CreateMaterialRequestDto from '@materials/infra/dto/create-material.request.dto';
import MaterialResponseDto from '@materials/infra/dto/material.response.dto';
import UpdateMaterialRequestDto from '@materials/infra/dto/update-material.request.dto';

export function MaterialApiControllerDocs(): ClassDecorator {
  return applyDecorators(ApiTags('Materials'), ApiBearerAuth());
}

export function MaterialApiCreateDocs(): MethodDecorator {
  return applyDecorators(
    ApiBody({ type: CreateMaterialRequestDto }),
    ApiCreatedResponse({
      description: 'Material cadastrado com sucesso',
      type: MaterialResponseDto,
    }),
  );
}

export function MaterialApiListDocs(): MethodDecorator {
  return applyDecorators(
    ApiOkResponse({
      description: 'Materiais encontrados com sucesso',
      type: MaterialResponseDto,
      isArray: true,
    }),
  );
}

export function MaterialApiFindByIdDocs(): MethodDecorator {
  return applyDecorators(
    ApiParam({ name: 'id', description: 'ID do material', type: String }),
    ApiOkResponse({
      description: 'Material encontrado com sucesso',
      type: MaterialResponseDto,
    }),
    ApiNotFoundResponse({ description: 'Material nao encontrado' }),
  );
}

export function MaterialApiAddStockDocs(): MethodDecorator {
  return applyDecorators(
    ApiParam({ name: 'id', description: 'ID do material', type: String }),
    ApiBody({ type: AddMaterialStockRequestDto }),
    ApiOkResponse({
      description: 'Estoque atualizado com sucesso',
      type: MaterialResponseDto,
    }),
    ApiNotFoundResponse({ description: 'Material nao encontrado' }),
  );
}

export function MaterialApiUpdateDocs(): MethodDecorator {
  return applyDecorators(
    ApiParam({ name: 'id', description: 'ID do material', type: String }),
    ApiBody({ type: UpdateMaterialRequestDto }),
    ApiOkResponse({
      description: 'Material atualizado com sucesso',
      type: MaterialResponseDto,
    }),
    ApiNotFoundResponse({ description: 'Material nao encontrado' }),
  );
}

export function MaterialApiDeleteDocs(): MethodDecorator {
  return applyDecorators(
    ApiParam({ name: 'id', description: 'ID do material', type: String }),
    ApiOkResponse({
      description: 'Material removido com sucesso',
      type: MaterialResponseDto,
    }),
    ApiNotFoundResponse({ description: 'Material nao encontrado' }),
  );
}
