import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateServiceOrderItemDto {
  @ApiProperty({
    description: 'Service catalog or part UUID',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  referenceId: string;

  @ApiProperty({
    description: 'Quantity (decimals allowed for labor hours)',
  })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Optional item description',
  })
  // Intencional: campo opcional, mas quando informado não pode ser vazio.
  // Ausente e null são aceitos; '' é rejeitado por @IsNotEmpty.
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;
}

export class CreateServiceOrderDto {
  @ApiProperty({ description: 'Client UUID' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  customerId: string;

  @ApiProperty({ description: 'Vehicle UUID' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  vehicleId: string;

  @ApiPropertyOptional({
    description: 'Vehicle mileage at check-in (km)',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  mileage?: number;

  @ApiPropertyOptional({ description: 'OS opening notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    type: [CreateServiceOrderItemDto],
    description: 'Labor services to include in the initial estimate',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceOrderItemDto)
  @IsOptional()
  services?: CreateServiceOrderItemDto[];

  @ApiPropertyOptional({
    type: [CreateServiceOrderItemDto],
    description: 'Parts to include in the initial estimate',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceOrderItemDto)
  @IsOptional()
  parts?: CreateServiceOrderItemDto[];
}
