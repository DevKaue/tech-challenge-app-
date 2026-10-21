import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';

export class UpdateServiceOrderStatusDto {
  @ApiProperty({
    enum: ServiceOrderStatus,
    description: 'New service order status',
  })
  @IsEnum(ServiceOrderStatus)
  status: ServiceOrderStatus;

  @ApiPropertyOptional({
    description: 'Additional information about the status update',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
