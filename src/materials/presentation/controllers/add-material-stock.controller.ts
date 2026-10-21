import AddMaterialStockUseCase, {
  AddMaterialStockInput,
} from '@materials/application/usecases/add-material-stock.usecase';
import {
  JsonMaterialPresenter,
  MaterialResponse,
} from '@materials/presentation/presenters/json-material.presenter';
import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';

type AddMaterialStockRequest = HttpRequest<
  Omit<AddMaterialStockInput, 'id'>,
  { id: string },
  undefined
>;

export default class AddMaterialStockController implements Controller<
  AddMaterialStockRequest,
  MaterialResponse
> {
  constructor(
    private readonly addMaterialStockUseCase: AddMaterialStockUseCase,
  ) {}

  async handle(
    httpRequest: AddMaterialStockRequest,
  ): Promise<HttpResponse<MaterialResponse>> {
    const output = await this.addMaterialStockUseCase.execute({
      id: httpRequest.params.id,
      quantity: httpRequest.body.quantity,
    });

    return {
      statusCode: 200,
      body: JsonMaterialPresenter.present(output.material),
    };
  }
}
