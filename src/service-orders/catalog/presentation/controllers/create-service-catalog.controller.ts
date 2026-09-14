import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import type { ServiceDTO } from '@service-orders/catalog/application/dtos/service.dtos';
import {
  CreateServiceCatalogUseCase,
  CreateServiceInput,
} from '@service-orders/catalog/application/usecases/create-service-catalog.use-case';

type CreateServiceCatalogRequest = HttpRequest<
  CreateServiceInput,
  undefined,
  undefined
>;

export default class CreateServiceCatalogController implements Controller<
  CreateServiceCatalogRequest,
  ServiceDTO
> {
  constructor(
    private readonly createServiceCatalogUseCase: CreateServiceCatalogUseCase,
  ) {}

  async handle(
    httpRequest: CreateServiceCatalogRequest,
  ): Promise<HttpResponse<ServiceDTO>> {
    const output = await this.createServiceCatalogUseCase.execute(
      httpRequest.body,
    );

    return {
      statusCode: 201,
      body: output,
    };
  }
}
