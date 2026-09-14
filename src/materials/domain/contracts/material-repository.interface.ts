import Material from '@materials/domain/entities/material.entity';

export default abstract class MaterialRepositoryInterface {
  abstract create(material: Material): Promise<void>;

  abstract findAll(): Promise<Material[]>;

  abstract findById(id: string): Promise<Material | null>;

  abstract update(material: Material): Promise<void>;

  abstract delete(id: string): Promise<void>;

  abstract decrementStock(materialId: string, quantity: number): Promise<void>;
}
