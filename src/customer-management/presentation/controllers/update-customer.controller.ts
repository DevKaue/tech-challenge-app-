import UpdateCustomerUseCase, {
  UpdateCustomerInput,
} from '@/customer-management/application/usecases/update-customer.usecase';
import {
  CustomerResponse,
  JsonCustomerPresenter,
} from '@/customer-management/presentation/presenters/json-customer.presenter';
import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';

type UpdateCustomerRequest = HttpRequest<
  Omit<UpdateCustomerInput, 'id'>,
  { id: string },
  undefined
>;

export default class UpdateCustomerController implements Controller<
  UpdateCustomerRequest,
  CustomerResponse
> {
  constructor(private readonly updateCustomerUseCase: UpdateCustomerUseCase) {}

  async handle(
    httpRequest: UpdateCustomerRequest,
  ): Promise<HttpResponse<CustomerResponse>> {
    const output = await this.updateCustomerUseCase.execute({
      ...httpRequest.body,
      id: httpRequest.params.id,
    });

    return {
      statusCode: 200,
      body: JsonCustomerPresenter.present(output.customer),
    };
  }
}
