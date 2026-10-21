import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import type { UpdateServiceInput } from '@service-orders/catalog/application/usecases/update-service-catalog.use-case';

export class UpdateServiceRequestDto implements UpdateServiceInput {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
