import type { UserRepository } from '@service-orders/domain/acls/user-repository.interface';

export class UpdateMechanicAvailabilityUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(mechanicId: string, available: boolean): Promise<void> {
    await this.userRepository.updateAvailability(mechanicId, available);
  }
}
