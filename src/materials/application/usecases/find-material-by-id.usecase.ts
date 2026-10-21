import { toMaterialDTO } from '@materials/application/dtos/material.dto';
import type MaterialDTO from '@materials/application/dtos/material.dto';
import MaterialNotFoundException from '@materials/application/exceptions/material-not-found.exception';
import MaterialRepositoryInterface from '@materials/domain/contracts/material-repository.interface';

export type FindMaterialByIdInput = {
  id: string;
};

export type FindMaterialByIdOutput = {
  material: MaterialDTO;
};

export default class FindMaterialByIdUseCase {
  constructor(
    private readonly materialRepository: MaterialRepositoryInterface,
  ) {}

  async execute(input: FindMaterialByIdInput): Promise<FindMaterialByIdOutput> {
    const material = await this.materialRepository.findById(input.id);

    if (!material) {
      throw new MaterialNotFoundException();
    }

    return {
      material: toMaterialDTO(material),
    };
  }
}
