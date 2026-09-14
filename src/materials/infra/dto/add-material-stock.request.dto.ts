import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';
import type { AddMaterialStockInput } from '@materials/application/usecases/add-material-stock.usecase';

export default class AddMaterialStockRequestDto implements Omit<
  AddMaterialStockInput,
  'id'
> {
  @ApiProperty({ description: 'Quantity to add to stock', example: 5 })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  quantity!: number;
}
