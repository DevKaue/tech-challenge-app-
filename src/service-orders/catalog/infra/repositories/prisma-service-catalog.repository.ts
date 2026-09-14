import { Injectable } from '@nestjs/common';
import type { ServiceCatalog as PrismaServiceCatalog } from '@prisma/client';
import PrismaUnitOfWorkService from '@/common/infra/services/prisma-unit-of-work.service';
import ServiceCatalogRepositoryInterface from '@service-orders/catalog/domain/contracts/service-catalog-repository.interface';
import Service from '@service-orders/catalog/domain/entities/service.entity';

@Injectable()
export class PrismaServiceCatalogRepository extends ServiceCatalogRepositoryInterface {
  constructor(private readonly uow: PrismaUnitOfWorkService) {
    super();
  }

  async create(service: Service): Promise<void> {
    await this.uow.client.serviceCatalog.create({
      data: {
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      },
    });
  }

  async findAll(): Promise<Service[]> {
    const services = await this.uow.client.serviceCatalog.findMany({
      orderBy: { name: 'asc' },
    });
    return services.map((service) => this.toDomain(service));
  }

  async findById(id: string): Promise<Service | null> {
    const service = await this.uow.client.serviceCatalog.findUnique({
      where: { id },
    });
    return service ? this.toDomain(service) : null;
  }

  async update(service: Service): Promise<void> {
    await this.uow.client.serviceCatalog.update({
      where: { id: service.id },
      data: {
        name: service.name,
        description: service.description,
        price: service.price,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.uow.client.serviceCatalog.delete({ where: { id } });
  }

  private toDomain(model: PrismaServiceCatalog): Service {
    return new Service({
      id: model.id,
      name: model.name,
      description: model.description,
      price: model.price,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }
}
