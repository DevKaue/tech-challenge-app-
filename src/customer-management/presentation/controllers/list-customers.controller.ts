import ListCustomerUseCase from '@/customer-management/application/usecases/list-customer.usecase';
import {
  CustomerResponse,
  JsonCustomerPresenter,
} from '@/customer-management/presentation/presenters/json-customer.presenter';
import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';

type ListCustomersRequest = HttpRequest<undefined, undefined, undefined>;

export default class ListCustomersController implements Controller<
  ListCustomersRequest,
  CustomerResponse[]
> {
  constructor(private readonly listCustomersUseCase: ListCustomerUseCase) {}

  async handle(): Promise<HttpResponse<CustomerResponse[]>> {
    const output = await this.listCustomersUseCase.execute();

    return {
      statusCode: 200,
      body: JsonCustomerPresenter.presentMany(output.customers),
    };
  }
}
