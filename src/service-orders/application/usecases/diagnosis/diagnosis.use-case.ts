// import { Injectable } from '@nestjs/common';
// import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
// import { ServiceOrderMapper } from '@service-orders/domain/mappers/service-order.mapper';
// //import { ServiceOrderPersistenceMapper } from '@service-orders/infra/mappers/service-order-to-persistence.mapper';
// import { StartDiagnosisDto } from '@service-orders/application/dto/diagnosis/start-diagnosis.dto';
// import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
// import { plainToInstance } from 'class-transformer';
// import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
// import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';

// @Injectable()
// export class DiagnosisUseCase {
//   constructor(private readonly repository: ServiceOrdersRepositoryInterface) {}

//   async startDiagnosis(id: string, dto: StartDiagnosisDto) {
//     const data = await this.repository.findById(id);
//     if (!data) throw new ServiceOrderNotFoundException(id);

//     const order = ServiceOrderMapper.toDomain(data);
//     try {
//       const change = order.startDiagnosis();
//       const updated = await this.repository.update(id, order);

//       await this.repository.createStatusHistory({
//         serviceOrderId: id,
//         previousStatus: change.previousStatus,
//         newStatus: change.newStatus,
//         notes: dto.diagnosis,
//       });

//       return plainToInstance(ServiceOrderResponseDto, updated, {
//         excludeExtraneousValues: true,
//       });
//     } catch (error: unknown) {
//       throw new InvalidStatusTransitionException(
//         error instanceof Error ? error.message : 'Unexpected error',
//       );
//     }
//   }
// }
