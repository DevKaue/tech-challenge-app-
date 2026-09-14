import Service from '@service-orders/catalog/domain/entities/service.entity';

export default abstract class ServiceCatalogRepositoryInterface {
  abstract create(service: Service): Promise<void>;
  abstract findAll(): Promise<Service[]>;
  abstract findById(id: string): Promise<Service | null>;
  abstract update(service: Service): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
