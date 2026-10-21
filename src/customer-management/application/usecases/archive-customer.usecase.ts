import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';
import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';
import UnitOfWorkServiceInterface from '@customer-management/application/contracts/unit-of-work-service.interface';

export type ArchiveCustomerInput = {
  id: string;
};

export default class ArchiveCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepositoryInterface,
    private readonly vehicleRepository: VehicleRepositoryInterface,
    private readonly unitOfWork: UnitOfWorkServiceInterface,
  ) {}

  async execute(input: ArchiveCustomerInput): Promise<void> {
    await this.unitOfWork.runInTransaction(async () => {
      const customer = await this.customerRepository.getById(input.id);

      customer.softDelete();

      await this.vehicleRepository.archiveAllByCustomerId(input.id);
      await this.customerRepository.archive(customer);
    });
  }
}
