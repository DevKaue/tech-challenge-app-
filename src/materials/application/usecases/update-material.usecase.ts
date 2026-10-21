import { toMaterialDTO } from '@materials/application/dtos/material.dto';
import type MaterialDTO from '@materials/application/dtos/material.dto';
import MaterialNotFoundException from '@materials/application/exceptions/material-not-found.exception';
import MaterialRepositoryInterface from '@materials/domain/contracts/material-repository.interface';
import { MaterialType } from '@materials/domain/enums/material-type.enum';
import { StockUnit } from '@materials/domain/enums/stock-unit.enum';

export type UpdateMaterialInput = {
  id: string;
  name?: string;
  description?: string | null;
  price?: number;
  type?: MaterialType;
  stockQuantity?: number;
  stockUnit?: StockUnit;
  expiresAt?: Date | string | null;
};

export type UpdateMaterialOutput = {
  material: MaterialDTO;
};

export default class UpdateMaterialUseCase {
  constructor(
    private readonly materialRepository: MaterialRepositoryInterface,
  ) {}

  async execute(input: UpdateMaterialInput): Promise<UpdateMaterialOutput> {
    const material = await this.materialRepository.findById(input.id);

    if (!material) {
      throw new MaterialNotFoundException();
    }

    material.update({
      name: input.name,
      description: input.description,
      price: input.price,
      type: input.type,
      stockQuantity: input.stockQuantity,
      stockUnit: input.stockUnit,
      expiresAt: input.expiresAt,
    });

    await this.materialRepository.update(material);

    return {
      material: toMaterialDTO(material),
    };
  }
}
