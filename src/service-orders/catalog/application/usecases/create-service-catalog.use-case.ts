import ServiceCatalogRepositoryInterface from '@service-orders/catalog/domain/contracts/service-catalog-repository.interface';
import { toServiceDTO } from '../dtos/service.dtos';
import type { ServiceDTO } from '../dtos/service.dtos';
import Service from '@service-orders/catalog/domain/entities/service.entity';

export type CreateServiceInput = {
  name: string;
  description?: string;
  price: number;
};

export class CreateServiceCatalogUseCase {
  constructor(private readonly repository: ServiceCatalogRepositoryInterface) {}

  async execute(input: CreateServiceInput): Promise<ServiceDTO> {
    const service = new Service({
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      price: input.price,
    });

    await this.repository.create(service);
    return toServiceDTO(service);
  }
}
