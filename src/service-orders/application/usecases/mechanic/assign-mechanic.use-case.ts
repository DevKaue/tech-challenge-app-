import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import type { UserRepository } from '@service-orders/domain/acls/user-repository.interface';
import { MechanicAssignment } from '@service-orders/domain/value-objects/mechanic-assignment.value-object';
import { UserRole } from '@service-orders/domain/enums/user-role.enum';
import { AssignMechanicDto } from '@service-orders/application/dto/mechanic/assign-mechanic.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { plainToInstance } from 'class-transformer';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';
import { ServiceOrderMapper } from '@service-orders/domain/mappers/service-order.mapper';
import { UserNotMechanicException } from '@service-orders/domain/exceptions/user-not-mechanic.exception';

export class AssignMechanicUseCase {
  constructor(
    private readonly repository: ServiceOrdersRepositoryInterface,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string, dto: AssignMechanicDto) {
    const data = await this.repository.findById(id);
    if (!data) throw new ServiceOrderNotFoundException(id);

    const serviceOrder = ServiceOrderMapper.toDomain(data);

    const user = await this.userRepository.findById(dto.mechanicId);
    if (!user) {
      throw new UserNotMechanicException(dto.mechanicId);
    }
    if ((user.role as UserRole) !== UserRole.MECHANIC) {
      throw new UserNotMechanicException(dto.mechanicId);
    }

    try {
      const assignment = MechanicAssignment.create(
        user.id,
        user.name,
        UserRole.MECHANIC,
      );
      serviceOrder.assignMechanic(assignment);
    } catch (error: unknown) {
      throw new InvalidStatusTransitionException(
        error instanceof Error ? error.message : 'Unexpected error',
      );
    }

    const updated = await this.repository.update(id, serviceOrder);
    return plainToInstance(ServiceOrderResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }
}
