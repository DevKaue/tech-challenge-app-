import { toMaterialDTO } from '@materials/application/dtos/material.dto';
import type MaterialDTO from '@materials/application/dtos/material.dto';
import MaterialRepositoryInterface from '@materials/domain/contracts/material-repository.interface';

export type ListMaterialsOutput = {
  materials: MaterialDTO[];
};

export default class ListMaterialsUseCase {
  constructor(
    private readonly materialRepository: MaterialRepositoryInterface,
  ) {}

  async execute(): Promise<ListMaterialsOutput> {
    const materials = await this.materialRepository.findAll();

    return {
      materials: materials.map((material) => toMaterialDTO(material)),
    };
  }
}
