import Material from '@materials/domain/entities/material.entity';
import { MaterialType } from '@materials/domain/enums/material-type.enum';
import { StockUnit } from '@materials/domain/enums/stock-unit.enum';

export default interface MaterialDTO {
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
}

export function toMaterialDTO(material: Material): MaterialDTO {
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
