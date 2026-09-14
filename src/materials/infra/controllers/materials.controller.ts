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
import { JwtAuthGuard } from '@/access-identity/infra/guards/jwt-auth.guard';
import { adaptNestRoute } from '@/common/presentation/adapters/nest-route.adapter';
import type { HttpResponse } from '@/common/application/contracts/http';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import AddMaterialStockController from '@materials/presentation/controllers/add-material-stock.controller';
import CreateMaterialController from '@materials/presentation/controllers/create-material.controller';
import DeleteMaterialController from '@materials/presentation/controllers/delete-material.controller';
import FindMaterialByIdController from '@materials/presentation/controllers/find-material-by-id.controller';
import ListMaterialsController from '@materials/presentation/controllers/list-materials.controller';
import UpdateMaterialController from '@materials/presentation/controllers/update-material.controller';
import AddMaterialStockRequestDto from '@materials/infra/dto/add-material-stock.request.dto';
import CreateMaterialRequestDto from '@materials/infra/dto/create-material.request.dto';
import type MaterialResponseDto from '@materials/infra/dto/material.response.dto';
import UpdateMaterialRequestDto from '@materials/infra/dto/update-material.request.dto';
import {
  MaterialApiAddStockDocs,
  MaterialApiControllerDocs,
  MaterialApiCreateDocs,
  MaterialApiDeleteDocs,
  MaterialApiFindByIdDocs,
  MaterialApiListDocs,
  MaterialApiUpdateDocs,
} from '@materials/infra/swaggers/material-routes.swagger';

@MaterialApiControllerDocs()
@Controller('materials')
@UseGuards(JwtAuthGuard)
@UseFilters(DomainExceptionFilter)
export class MaterialsInfraController {
  constructor(
    private readonly createMaterialController: CreateMaterialController,
    private readonly listMaterialsController: ListMaterialsController,
    private readonly findMaterialByIdController: FindMaterialByIdController,
    private readonly updateMaterialController: UpdateMaterialController,
    private readonly addMaterialStockController: AddMaterialStockController,
    private readonly deleteMaterialController: DeleteMaterialController,
  ) {}

  @Post()
  @MaterialApiCreateDocs()
  create(
    @Body() input: CreateMaterialRequestDto,
  ): Promise<HttpResponse<MaterialResponseDto>> {
    return adaptNestRoute(this.createMaterialController, {
      body: input,
      params: undefined,
      query: undefined,
    });
  }

  @Get()
  @MaterialApiListDocs()
  list(): Promise<HttpResponse<MaterialResponseDto[]>> {
    return adaptNestRoute(this.listMaterialsController, {
      body: undefined,
      params: undefined,
      query: undefined,
    });
  }

  @Get(':id')
  @MaterialApiFindByIdDocs()
  findById(
    @Param('id') id: string,
  ): Promise<HttpResponse<MaterialResponseDto>> {
    return adaptNestRoute(this.findMaterialByIdController, {
      body: undefined,
      params: { id },
      query: undefined,
    });
  }

  @Patch(':id/stock')
  @MaterialApiAddStockDocs()
  addStock(
    @Param('id') id: string,
    @Body() input: AddMaterialStockRequestDto,
  ): Promise<HttpResponse<MaterialResponseDto>> {
    return adaptNestRoute(this.addMaterialStockController, {
      body: input,
      params: { id },
      query: undefined,
    });
  }

  @Patch(':id')
  @MaterialApiUpdateDocs()
  update(
    @Param('id') id: string,
    @Body() input: UpdateMaterialRequestDto,
  ): Promise<HttpResponse<MaterialResponseDto>> {
    return adaptNestRoute(this.updateMaterialController, {
      body: input,
      params: { id },
      query: undefined,
    });
  }

  @Delete(':id')
  @MaterialApiDeleteDocs()
  delete(@Param('id') id: string): Promise<HttpResponse<MaterialResponseDto>> {
    return adaptNestRoute(this.deleteMaterialController, {
      body: undefined,
      params: { id },
      query: undefined,
    });
  }
}
