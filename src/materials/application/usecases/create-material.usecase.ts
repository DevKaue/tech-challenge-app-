import { toMaterialDTO } from '@materials/application/dtos/material.dto';
import type MaterialDTO from '@materials/application/dtos/material.dto';
import MaterialRepositoryInterface from '@materials/domain/contracts/material-repository.interface';
import { MaterialType } from '@materials/domain/enums/material-type.enum';
import { StockUnit } from '@materials/domain/enums/stock-unit.enum';
import MaterialFactory from '@materials/domain/factories/material.factory';

export type CreateMaterialInput = {
  name: string;
  description?: string | null;
  price: number;
  type?: MaterialType;
  stockQuantity?: number;
  stockUnit?: StockUnit;
  expiresAt?: Date | string | null;
};

export type CreateMaterialOutput = {
  material: MaterialDTO;
};

export default class CreateMaterialUseCase {
  constructor(
    private readonly materialRepository: MaterialRepositoryInterface,
  ) {}

  async execute(input: CreateMaterialInput): Promise<CreateMaterialOutput> {
    const material = MaterialFactory.create({
      name: input.name,
      description: input.description,
      price: input.price,
      type: input.type,
      stockQuantity: input.stockQuantity,
      stockUnit: input.stockUnit,
      expiresAt: input.expiresAt,
    });

    await this.materialRepository.create(material);

    return {
      material: toMaterialDTO(material),
    };
  }
}
