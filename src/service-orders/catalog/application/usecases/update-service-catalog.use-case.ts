import ServiceCatalogRepositoryInterface from '@service-orders/catalog/domain/contracts/service-catalog-repository.interface';
import { toServiceDTO } from '../dtos/service.dtos';
import type { ServiceDTO } from '../dtos/service.dtos';
import ServiceNotFoundException from '../exceptions/service-not-found.exception';

export type UpdateServiceInput = {
  name?: string;
  description?: string;
  price?: number;
};

export class UpdateServiceCatalogUseCase {
  constructor(private readonly repository: ServiceCatalogRepositoryInterface) {}

  async execute(id: string, input: UpdateServiceInput): Promise<ServiceDTO> {
    const service = await this.repository.findById(id);
    if (!service) {
      throw new ServiceNotFoundException();
    }
    service.update(input);
    await this.repository.update(service);
    return toServiceDTO(service);
  }
}
