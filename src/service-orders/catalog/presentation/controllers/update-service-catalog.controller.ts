import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import type { ServiceDTO } from '@service-orders/catalog/application/dtos/service.dtos';
import {
  UpdateServiceCatalogUseCase,
  UpdateServiceInput,
} from '@service-orders/catalog/application/usecases/update-service-catalog.use-case';

type UpdateServiceCatalogRequest = HttpRequest<
  UpdateServiceInput,
  { id: string },
  undefined
>;

export default class UpdateServiceCatalogController implements Controller<
  UpdateServiceCatalogRequest,
  ServiceDTO
> {
  constructor(
    private readonly updateServiceCatalogUseCase: UpdateServiceCatalogUseCase,
  ) {}

  async handle(
    httpRequest: UpdateServiceCatalogRequest,
  ): Promise<HttpResponse<ServiceDTO>> {
    const output = await this.updateServiceCatalogUseCase.execute(
      httpRequest.params.id,
      httpRequest.body,
    );

    return {
      statusCode: 200,
      body: output,
    };
  }
}
