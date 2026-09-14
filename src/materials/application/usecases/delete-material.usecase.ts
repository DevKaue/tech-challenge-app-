import { toMaterialDTO } from '@materials/application/dtos/material.dto';
import type MaterialDTO from '@materials/application/dtos/material.dto';
import MaterialNotFoundException from '@materials/application/exceptions/material-not-found.exception';
import MaterialRepositoryInterface from '@materials/domain/contracts/material-repository.interface';

export type DeleteMaterialInput = {
  id: string;
};

export type DeleteMaterialOutput = {
  material: MaterialDTO;
};

export default class DeleteMaterialUseCase {
  constructor(
    private readonly materialRepository: MaterialRepositoryInterface,
  ) {}

  async execute(input: DeleteMaterialInput): Promise<DeleteMaterialOutput> {
    const material = await this.materialRepository.findById(input.id);

    if (!material) {
      throw new MaterialNotFoundException();
    }

    await this.materialRepository.delete(material.id);

    return {
      material: toMaterialDTO(material),
    };
  }
}
