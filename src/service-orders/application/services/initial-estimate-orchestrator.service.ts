import InitialEstimateOrchestratorInterface, {
  InitialEstimateInput,
} from '@service-orders/application/contracts/initial-estimate-orchestrator.interface';
import { EstimateResponseDto } from '@service-orders/application/dto/estimate/estimate-response.dto';
import { CreateEstimateUseCase } from '@service-orders/application/usecases/estimate/create-estimate.use-case';
import { AddEstimateItemUseCase } from '@service-orders/application/usecases/estimate/add-estimate-item.use-case';
import { ServiceOrderItemType } from '@service-orders/domain/enums/service-order-item-type.enum';

export default class InitialEstimateOrchestratorService implements InitialEstimateOrchestratorInterface {
  constructor(
    private readonly createEstimateUseCase: CreateEstimateUseCase,
    private readonly addEstimateItemUseCase: AddEstimateItemUseCase,
  ) {}

  async execute(
    input: InitialEstimateInput,
  ): Promise<EstimateResponseDto | null> {
    const hasItems = input.services.length > 0 || input.parts.length > 0;
    if (!hasItems) return null;

    const estimate = await this.createEstimateUseCase.execute(input.orderId);

    for (const service of input.services) {
      await this.addEstimateItemUseCase.execute(estimate.id, {
        itemType: ServiceOrderItemType.SERVICE,
        referenceId: service.referenceId,
        quantity: service.quantity,
        description: service.description,
      });
    }

    for (const part of input.parts) {
      await this.addEstimateItemUseCase.execute(estimate.id, {
        itemType: ServiceOrderItemType.PART,
        referenceId: part.referenceId,
        quantity: part.quantity,
        description: part.description,
      });
    }

    return estimate;
  }
}
