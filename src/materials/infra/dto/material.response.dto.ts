import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaterialType } from '@materials/domain/enums/material-type.enum';
import { StockUnit } from '@materials/domain/enums/stock-unit.enum';

export default class MaterialResponseDto {
  @ApiProperty({ description: 'Material ID' })
  id!: string;

  @ApiProperty({ description: 'Material name' })
  name!: string;

  @ApiPropertyOptional({ description: 'Material description', nullable: true })
  description!: string | null;

  @ApiProperty({ description: 'Unit price' })
  price!: number;

  @ApiProperty({ enum: MaterialType, description: 'Material type' })
  type!: MaterialType;

  @ApiProperty({ description: 'Current stock quantity' })
  stockQuantity!: number;

  @ApiProperty({ enum: StockUnit, description: 'Stock measurement unit' })
  stockUnit!: StockUnit;

  @ApiPropertyOptional({ description: 'Expiration date', nullable: true })
  expiresAt!: Date | null;

  @ApiProperty({ description: 'Registration date' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt!: Date;
}
