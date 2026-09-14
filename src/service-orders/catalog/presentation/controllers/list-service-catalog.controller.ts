import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import type { ServiceDTO } from '@service-orders/catalog/application/dtos/service.dtos';
import { ListServiceCatalogUseCase } from '@service-orders/catalog/application/usecases/list-service-catalog.use-case';

type ListServiceCatalogRequest = HttpRequest<undefined, undefined, undefined>;

export default class ListServiceCatalogController implements Controller<
  ListServiceCatalogRequest,
  ServiceDTO[]
> {
  constructor(
    private readonly listServiceCatalogUseCase: ListServiceCatalogUseCase,
  ) {}

  async handle(): Promise<HttpResponse<ServiceDTO[]>> {
    const output = await this.listServiceCatalogUseCase.execute();

    return {
      statusCode: 200,
      body: output,
    };
  }
}
