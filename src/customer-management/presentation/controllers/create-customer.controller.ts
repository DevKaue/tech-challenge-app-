import CreateCustomerUseCase, {
  CreateCustomerInput,
} from '@/customer-management/application/usecases/create-customer.usecase';
import {
  CustomerResponse,
  JsonCustomerPresenter,
} from '@/customer-management/presentation/presenters/json-customer.presenter';
import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';

type CreateCustomerRequest = HttpRequest<
  CreateCustomerInput,
  undefined,
  undefined
>;

export default class CreateCustomerController implements Controller<
  CreateCustomerRequest,
  CustomerResponse
> {
  constructor(private readonly createCustomerUseCase: CreateCustomerUseCase) {}

  async handle(
    httpRequest: CreateCustomerRequest,
  ): Promise<HttpResponse<CustomerResponse>> {
    const output = await this.createCustomerUseCase.execute(httpRequest.body);

    return {
      statusCode: 201,
      body: JsonCustomerPresenter.present(output.customer),
    };
  }
}
