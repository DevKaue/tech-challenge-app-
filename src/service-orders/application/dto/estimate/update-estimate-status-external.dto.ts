import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';

const EXTERNAL_DECISIONS = [EstimateStatus.APPROVED, EstimateStatus.REJECTED];

export class UpdateEstimateStatusExternalDto {
  @ApiProperty({
    enum: EXTERNAL_DECISIONS,
    description: 'APPROVED or REJECTED',
  })
  @IsIn(EXTERNAL_DECISIONS)
  @IsNotEmpty()
  decision: EstimateStatus;
}
