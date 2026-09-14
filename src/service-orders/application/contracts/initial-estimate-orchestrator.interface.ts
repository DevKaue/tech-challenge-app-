import { EstimateResponseDto } from '@service-orders/application/dto/estimate/estimate-response.dto';
import { CreateServiceOrderItemDto } from '@service-orders/application/dto/service-order/create-service-order.dto';

export type InitialEstimateInput = {
  orderId: string;
  services: CreateServiceOrderItemDto[];
  parts: CreateServiceOrderItemDto[];
};

export default abstract class InitialEstimateOrchestratorInterface {
  abstract execute(
    input: InitialEstimateInput,
  ): Promise<EstimateResponseDto | null>;
}
