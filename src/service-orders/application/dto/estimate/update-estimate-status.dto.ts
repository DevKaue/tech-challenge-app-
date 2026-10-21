import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';

export class UpdateEstimateStatusDto {
  @ApiProperty({
    enum: EstimateStatus,
    description: 'APPROVED, REJECTED, or NEGOTIATED',
  })
  @IsEnum(EstimateStatus)
  @IsNotEmpty()
  status: EstimateStatus;
}
