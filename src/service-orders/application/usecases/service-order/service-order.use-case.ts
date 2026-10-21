// import { BadRequestException, Inject, Injectable } from '@nestjs/common';
// import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
// import { ServiceOrderQueryServiceInterface } from '@service-orders/application/contracts/service-order-query-service.interface';
// import CustomarManagementInterface from '@common/application/contracts/customer-management.interface';
// import { CUSTOMER_REPOSITORY } from '@service-orders/domain/acls/customer-repository.interface';
// import type { CustomerRepository } from '@service-orders/domain/acls/customer-repository.interface';
// import { VEHICLE_REPOSITORY } from '@service-orders/domain/acls/vehicle-repository.interface';
// import type { VehicleRepository } from '@service-orders/domain/acls/vehicle-repository.interface';
// import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
// import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
// import { CreateServiceOrderDto } from '@service-orders/application/dto/service-order/create-service-order.dto';
// import { plainToInstance } from 'class-transformer';
// import { ServiceOrderMapper } from '@service-orders/domain/mappers/service-order.mapper';
// //import { ServiceOrderPersistenceMapper } from '@service-orders/infra/mappers/service-order-to-persistence.mapper';
// import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
// import { CustomerNotFoundException } from '@service-orders/application/exceptions/customer-not-found.exception';
// import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';

// @Injectable()
// export class ServiceOrderUseCase {
//   constructor(
//     private readonly repository: ServiceOrdersRepositoryInterface,
//     private readonly queryService: ServiceOrderQueryServiceInterface,
//     @Inject(CustomarManagementInterface)
//     private readonly customerManagement: CustomarManagementInterface,
//   ) { }

//   // async findAll() {
//   //   return this.queryService.findAll();
//   // }

//   // async findOne(id: string) {
//   //   const order = await this.queryService.findOne(id);
//   //   if (!order) throw new ServiceOrderNotFoundException(id);
//   //   return order;
//   // }

//   async create(dto: CreateServiceOrderDto) {
//     const customer = await this.customerManagement.findCustomerById({ id: dto.customerId });
//     if (!customer) throw new CustomerNotFoundException(dto.customerId);

//     const vehicle = await this.customerManagement.findVehicleById({ id: dto.vehicleId });
//     if (!vehicle) {
//       throw new BadRequestException('Vehicle not found');
//     }
//     if (vehicle.customerId !== dto.customerId) {
//       throw new BadRequestException(
//         'Vehicle does not belong to the specified client',
//       );
//     }

//     const order = await this.repository.create({
//       customerId: dto.customerId,
//       vehicleId: dto.vehicleId,
//       status: ServiceOrderStatus.RECEIVED,
//     });

//     await this.repository.createStatusHistory({
//       serviceOrderId: order.id,
//       previousStatus: null,
//       newStatus: ServiceOrderStatus.RECEIVED,
//     });

//     return plainToInstance(ServiceOrderResponseDto, order, {
//       excludeExtraneousValues: true,
//     });
//   }

//   async startService(id: string) {
//     const data = await this.repository.findById(id);
//     if (!data) throw new ServiceOrderNotFoundException(id);

//     const order = ServiceOrderMapper.toDomain(data);
//     try {
//       const change = order.startService();
//       const updated = await this.repository.update(id, order);

//       await this.repository.createStatusHistory({
//         serviceOrderId: id,
//         previousStatus: change.previousStatus,
//         newStatus: change.newStatus,
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

//   async finish(id: string, mechanicId: string, notes?: string) {
//     const data = await this.repository.findById(id);
//     if (!data) throw new ServiceOrderNotFoundException(id);

//     const order = ServiceOrderMapper.toDomain(data);
//     try {
//       const change = order.finish(mechanicId);
//       const updated = await this.repository.update(id, order);

//       await this.repository.createStatusHistory({
//         serviceOrderId: id,
//         previousStatus: change.previousStatus,
//         newStatus: change.newStatus,
//         ...(notes ? { notes } : {}),
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

//   async deliverVehicle(id: string) {
//     const data = await this.repository.findById(id);
//     if (!data) throw new ServiceOrderNotFoundException(id);

//     const order = ServiceOrderMapper.toDomain(data);
//     try {
//       const change = order.deliverVehicle();

//       const updated = await this.repository.update(id, order);
//       await this.repository.createStatusHistory({
//         serviceOrderId: id,
//         previousStatus: change.previousStatus,
//         newStatus: change.newStatus,
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

//   async close(id: string) {
//     const data = await this.repository.findById(id);
//     if (!data) throw new ServiceOrderNotFoundException(id);

//     const order = ServiceOrderMapper.toDomain(data);
//     try {
//       const change = order.close();

//       // const updated = await this.repository.update(id, {
//       //   ...ServiceOrderPersistenceMapper.toPersistence(order),
//       //   closedAt: new Date(),
//       // });
//       const updated = await this.repository.update(id, order);
//       await this.repository.createStatusHistory({
//         serviceOrderId: id,
//         previousStatus: change.previousStatus,
//         newStatus: change.newStatus,
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
