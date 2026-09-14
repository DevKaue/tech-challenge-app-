import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import type { ServiceDTO } from '@service-orders/catalog/application/dtos/service.dtos';
import { FindByIdServiceCatalogUseCase } from '@service-orders/catalog/application/usecases/find-by-id-service-catalog.use-case';

type FindServiceCatalogByIdRequest = HttpRequest<
  undefined,
  { id: string },
  undefined
>;

export default class FindServiceCatalogByIdController implements Controller<
  FindServiceCatalogByIdRequest,
  ServiceDTO
> {
  constructor(
    private readonly findByIdServiceCatalogUseCase: FindByIdServiceCatalogUseCase,
  ) {}

  async handle(
    httpRequest: FindServiceCatalogByIdRequest,
  ): Promise<HttpResponse<ServiceDTO>> {
    const output = await this.findByIdServiceCatalogUseCase.execute(
      httpRequest.params.id,
    );

    return {
      statusCode: 200,
      body: output,
    };
  }
}
