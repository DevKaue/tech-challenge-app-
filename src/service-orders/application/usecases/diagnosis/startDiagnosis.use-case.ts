import { ServiceOrdersRepositoryInterface } from '@/service-orders/domain/contracts/service-orders-repository.interface';
import { StartDiagnosisDto } from '../../dto/diagnosis/start-diagnosis.dto';
import {
  InvalidStatusTransitionException,
  ServiceOrderNotFoundException,
} from '../../exceptions';
import { ServiceOrderMapper } from '@/service-orders/domain/mappers/service-order.mapper';
import { ServiceOrderResponseDto } from '../../dto/service-order/service-order-response.dto';
import { plainToInstance } from 'class-transformer';

export class StartDiagnosisUseCase {
  constructor(private readonly repository: ServiceOrdersRepositoryInterface) {}

  async startDiagnosis(id: string, dto: StartDiagnosisDto) {
    const data = await this.repository.findById(id);
    if (!data) throw new ServiceOrderNotFoundException(id);

    const order = ServiceOrderMapper.toDomain(data);
    try {
      const change = order.startDiagnosis();
      const updated = await this.repository.update(id, order);

      await this.repository.createStatusHistory({
        serviceOrderId: id,
        previousStatus: change.previousStatus,
        newStatus: change.newStatus,
        notes: dto.diagnosis,
      });

      return plainToInstance(ServiceOrderResponseDto, updated, {
        excludeExtraneousValues: true,
      });
    } catch (error: unknown) {
      throw new InvalidStatusTransitionException(
        error instanceof Error ? error.message : 'Unexpected error',
      );
    }
  }
}
