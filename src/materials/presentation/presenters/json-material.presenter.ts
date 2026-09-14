import MaterialDTO from '@materials/application/dtos/material.dto';
import { MaterialType } from '@materials/domain/enums/material-type.enum';
import { StockUnit } from '@materials/domain/enums/stock-unit.enum';

export type MaterialResponse = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  type: MaterialType;
  stockQuantity: number;
  stockUnit: StockUnit;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class JsonMaterialPresenter {
  static present(material: MaterialDTO): MaterialResponse {
    return {
      id: material.id,
      name: material.name,
      description: material.description,
      price: material.price,
      type: material.type,
      stockQuantity: material.stockQuantity,
      stockUnit: material.stockUnit,
      expiresAt: material.expiresAt,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
    };
  }

  static presentMany(materials: MaterialDTO[]): MaterialResponse[] {
    return materials.map((material) => this.present(material));
  }
}
