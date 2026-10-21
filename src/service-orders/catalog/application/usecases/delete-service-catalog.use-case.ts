import ServiceCatalogRepositoryInterface from '@service-orders/catalog/domain/contracts/service-catalog-repository.interface';
import ServiceNotFoundException from '../exceptions/service-not-found.exception';

export class DeleteServiceCatalogUseCase {
  constructor(private readonly repository: ServiceCatalogRepositoryInterface) {}

  async execute(id: string): Promise<void> {
    const service = await this.repository.findById(id);
    if (!service) {
      throw new ServiceNotFoundException();
    }
    await this.repository.delete(id);
  }
}
