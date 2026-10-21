import { toMaterialDTO } from '@materials/application/dtos/material.dto';
import type MaterialDTO from '@materials/application/dtos/material.dto';
import MaterialNotFoundException from '@materials/application/exceptions/material-not-found.exception';
import MaterialRepositoryInterface from '@materials/domain/contracts/material-repository.interface';

export type AddMaterialStockInput = {
  id: string;
  quantity: number;
};

export type AddMaterialStockOutput = {
  material: MaterialDTO;
};

export default class AddMaterialStockUseCase {
  constructor(
    private readonly materialRepository: MaterialRepositoryInterface,
  ) {}

  async execute(input: AddMaterialStockInput): Promise<AddMaterialStockOutput> {
    const material = await this.materialRepository.findById(input.id);

    if (!material) {
      throw new MaterialNotFoundException();
    }

    material.addStock(input.quantity);

    await this.materialRepository.update(material);

    return {
      material: toMaterialDTO(material),
    };
  }
}
