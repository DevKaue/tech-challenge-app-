import ArchiveCustomerUseCase from '@/customer-management/application/usecases/archive-customer.usecase';
import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';

type ArchiveCustomerRequest = HttpRequest<undefined, { id: string }, undefined>;

export default class ArchiveCustomerController implements Controller<
  ArchiveCustomerRequest,
  undefined
> {
  constructor(
    private readonly archiveCustomerUseCase: ArchiveCustomerUseCase,
  ) {}

  async handle(
    httpRequest: ArchiveCustomerRequest,
  ): Promise<HttpResponse<undefined>> {
    await this.archiveCustomerUseCase.execute({
      id: httpRequest.params.id,
    });

    return {
      statusCode: 204,
      body: undefined,
    };
  }
}
