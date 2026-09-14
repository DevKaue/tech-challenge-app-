import ServiceCatalogRepositoryInterface from '@service-orders/catalog/domain/contracts/service-catalog-repository.interface';
import { toServiceDTO } from '../dtos/service.dtos';
import type { ServiceDTO } from '../dtos/service.dtos';

export class ListServiceCatalogUseCase {
  constructor(private readonly repository: ServiceCatalogRepositoryInterface) {}

  async execute(): Promise<ServiceDTO[]> {
    const services = await this.repository.findAll();
    return services.map((service) => toServiceDTO(service));
  }
}
