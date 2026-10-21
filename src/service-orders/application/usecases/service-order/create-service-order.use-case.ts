import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import CustomarManagementInterface from '@common/application/contracts/customer-management.interface';
import UnitOfWorkServiceInterface from '@common/application/contracts/unit-of-work-service.interface';
import InitialEstimateOrchestratorInterface from '@service-orders/application/contracts/initial-estimate-orchestrator.interface';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { CreateServiceOrderDto } from '@service-orders/application/dto/service-order/create-service-order.dto';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import { CustomerNotFoundException } from '@service-orders/application/exceptions/customer-not-found.exception';
import { VehicleNotFoundException } from '@service-orders/application/exceptions/vehicle-not-found.exception';
import { VehicleOwnerMismatchException } from '@service-orders/application/exceptions/vehicle-owner-mismatch.exception';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';

export class CreateServiceOrderUseCase {
  constructor(
    private readonly repository: ServiceOrdersRepositoryInterface,
    private readonly customerManagement: CustomarManagementInterface,
    private readonly initialEstimateOrchestrator: InitialEstimateOrchestratorInterface,
    private readonly unitOfWork: UnitOfWorkServiceInterface,
  ) {}

  async execute(dto: CreateServiceOrderDto) {
    const customer = await this.customerManagement.findCustomerById({
      id: dto.customerId,
    });
    if (!customer) throw new CustomerNotFoundException(dto.customerId);

    const vehicle = await this.customerManagement.findVehicleById({
      id: dto.vehicleId,
    });
    if (!vehicle) {
      throw new VehicleNotFoundException(dto.vehicleId);
    }
    if (vehicle.customerId !== dto.customerId) {
      throw new VehicleOwnerMismatchException(vehicle.id, dto.customerId);
    }

    return this.unitOfWork.runInTransaction(async () => {
      const hasItems =
        (dto.services?.length ?? 0) > 0 || (dto.parts?.length ?? 0) > 0;

      const order = ServiceOrder.open({ id: randomUUID() });

      const created = await this.repository.create({
        customerId: dto.customerId,
        vehicleId: dto.vehicleId,
        status: order.status,
        mileage: dto.mileage ?? null,
        notes: dto.notes ?? null,
      });

      await this.repository.createStatusHistory({
        serviceOrderId: created.id,
        previousStatus: null,
        newStatus: order.status,
      });

      if (hasItems) {
        const change = order.startDiagnosis();
        await this.repository.update(created.id, order);
        await this.repository.createStatusHistory({
          serviceOrderId: created.id,
          previousStatus: change.previousStatus,
          newStatus: change.newStatus,
        });
      }

      await this.initialEstimateOrchestrator.execute({
        orderId: created.id,
        services: dto.services ?? [],
        parts: dto.parts ?? [],
      });

      const persisted = await this.repository.findById(created.id);
      if (!persisted) throw new ServiceOrderNotFoundException(created.id);

      return plainToInstance(ServiceOrderResponseDto, persisted, {
        excludeExtraneousValues: true,
      });
    });
  }
}
