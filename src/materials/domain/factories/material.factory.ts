import Material from '@materials/domain/entities/material.entity';
import { MaterialType } from '@materials/domain/enums/material-type.enum';
import { StockUnit } from '@materials/domain/enums/stock-unit.enum';

export default class MaterialFactory {
  static create(props: {
    id?: string;
    name: string;
    description?: string | null;
    price: number;
    type?: MaterialType | `${MaterialType}`;
    stockQuantity?: number;
    stockUnit?: StockUnit | `${StockUnit}`;
    expiresAt?: Date | string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Material {
    return new Material({
      id: props.id ?? crypto.randomUUID(),
      name: props.name,
      description: props.description,
      price: props.price,
      type: props.type,
      stockQuantity: props.stockQuantity,
      stockUnit: props.stockUnit,
      expiresAt: props.expiresAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}
