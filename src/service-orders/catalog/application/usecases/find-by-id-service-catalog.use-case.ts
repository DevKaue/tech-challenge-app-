import ServiceCatalogRepositoryInterface from '@service-orders/catalog/domain/contracts/service-catalog-repository.interface';
import { toServiceDTO } from '../dtos/service.dtos';
import type { ServiceDTO } from '../dtos/service.dtos';
import ServiceNotFoundException from '../exceptions/service-not-found.exception';

export class FindByIdServiceCatalogUseCase {
  constructor(private readonly repository: ServiceCatalogRepositoryInterface) {}

  async execute(id: string): Promise<ServiceDTO> {
    const service = await this.repository.findById(id);
    if (!service) {
      throw new ServiceNotFoundException();
    }
    return toServiceDTO(service);
  }
}
