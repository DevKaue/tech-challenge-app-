import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import type { CreateServiceInput } from '@service-orders/catalog/application/usecases/create-service-catalog.use-case';

export class CreateServiceRequestDto implements CreateServiceInput {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;
}
