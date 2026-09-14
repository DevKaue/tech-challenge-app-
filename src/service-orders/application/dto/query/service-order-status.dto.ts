import { ApiProperty } from '@nestjs/swagger';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';

export class ServiceOrderStatusDto {
  @ApiProperty({ description: 'OS unique identifier' })
  id: string;

  @ApiProperty({
    enum: ServiceOrderStatus,
    description: 'Current status of the OS',
  })
  status: ServiceOrderStatus;

  @ApiProperty({ description: 'Timestamp of the last status update' })
  updatedAt: Date;
}
