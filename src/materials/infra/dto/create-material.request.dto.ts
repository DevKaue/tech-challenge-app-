import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import type { CreateMaterialInput } from '@materials/application/usecases/create-material.usecase';
import { MaterialType } from '@materials/domain/enums/material-type.enum';
import { StockUnit } from '@materials/domain/enums/stock-unit.enum';

export default class CreateMaterialRequestDto implements CreateMaterialInput {
  @ApiProperty({ description: 'Material name', example: 'Filtro de oleo' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'Material description',
    example: 'Filtro de oleo do motor',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ description: 'Unit price', example: 45.9 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiPropertyOptional({
    enum: MaterialType,
    description: 'Material type. PART is unitary, SUPPLY can be fractional.',
    default: MaterialType.PART,
  })
  @IsEnum(MaterialType)
  @IsOptional()
  type?: MaterialType;

  @ApiPropertyOptional({
    description: 'Current stock quantity',
    example: 10,
    default: 0,
  })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @ApiPropertyOptional({
    enum: StockUnit,
    description: 'Stock measurement unit',
    default: StockUnit.UNIT,
  })
  @IsEnum(StockUnit)
  @IsOptional()
  stockUnit?: StockUnit;

  @ApiPropertyOptional({
    description: 'Expiration date for supplies',
    example: '2027-06-23T00:00:00.000Z',
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  expiresAt?: string | null;
}
