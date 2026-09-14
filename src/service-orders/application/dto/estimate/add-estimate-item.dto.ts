import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ServiceOrderItemType } from '@service-orders/domain/enums/service-order-item-type.enum';

export class AddEstimateItemDto {
  @ApiProperty({ enum: ServiceOrderItemType, description: 'SERVICE or PART' })
  @IsEnum(ServiceOrderItemType)
  @IsNotEmpty()
  itemType: ServiceOrderItemType;

  @ApiProperty({
    description: 'Reference ID in the service catalog or materials table',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  referenceId: string;

  @ApiProperty({
    description: 'Item description (optional, falls back to catalog name)',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Quantity (supports decimals for labor hours)' })
  @IsNumber()
  @Min(0.001)
  quantity: number;
}
