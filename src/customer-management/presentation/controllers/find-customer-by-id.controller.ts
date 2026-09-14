import FindCustomerByIdUseCase from '@/customer-management/application/usecases/find-customer-by-id.usecase';
import {
  CustomerResponse,
  JsonCustomerPresenter,
} from '@/customer-management/presentation/presenters/json-customer.presenter';
import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';

type FindCustomerByIdRequest = HttpRequest<
  undefined,
  { id: string },
  undefined
>;

export default class FindCustomerByIdController implements Controller<
  FindCustomerByIdRequest,
  CustomerResponse
> {
  constructor(
    private readonly findCustomerByIdUseCase: FindCustomerByIdUseCase,
  ) {}

  async handle(
    httpRequest: FindCustomerByIdRequest,
  ): Promise<HttpResponse<CustomerResponse>> {
    const output = await this.findCustomerByIdUseCase.execute({
      id: httpRequest.params.id,
    });

    return {
      statusCode: 200,
      body: JsonCustomerPresenter.present(output.customer),
    };
  }
}
