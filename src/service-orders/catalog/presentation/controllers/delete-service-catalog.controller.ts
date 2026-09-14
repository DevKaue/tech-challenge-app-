import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import { DeleteServiceCatalogUseCase } from '@service-orders/catalog/application/usecases/delete-service-catalog.use-case';

type DeleteServiceCatalogRequest = HttpRequest<
  undefined,
  { id: string },
  undefined
>;

export default class DeleteServiceCatalogController implements Controller<
  DeleteServiceCatalogRequest,
  undefined
> {
  constructor(
    private readonly deleteServiceCatalogUseCase: DeleteServiceCatalogUseCase,
  ) {}

  async handle(
    httpRequest: DeleteServiceCatalogRequest,
  ): Promise<HttpResponse<undefined>> {
    await this.deleteServiceCatalogUseCase.execute(httpRequest.params.id);

    return {
      statusCode: 204,
      body: undefined,
    };
  }
}
