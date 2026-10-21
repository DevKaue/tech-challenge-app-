import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infra/prisma/prisma.service';

import VehicleQueryServiceInterface from '@customer-management/application/contracts/vehicle-query-service.interface';
import VehicleDTO from '@customer-management/application/dtos/vehicle.dto';
import VehicleNotFoundException from '@/customer-management/domain/exceptions/vehicle-not-found.exception';

@Injectable()
export default class PrismaVehicleQueryService implements VehicleQueryServiceInterface {
  constructor(private readonly prisma: PrismaService) {}

  async getById(props: { id: string }): Promise<VehicleDTO> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: props.id,
        deletedAt: null,
      },
    });
    if (vehicle) {
      const vehicleDTO: VehicleDTO = {
        id: vehicle.id,
        licensePlate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        customerId: vehicle.customerId,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
      };
      return vehicleDTO;
    }

    throw new VehicleNotFoundException();
  }

  async findAll(props?: { customerId?: string }): Promise<VehicleDTO[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        deletedAt: null,
        ...(props?.customerId ? { customerId: props.customerId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return vehicles.map((vehicle) => ({
      id: vehicle.id,
      licensePlate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      customerId: vehicle.customerId,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    }));
  }
}
