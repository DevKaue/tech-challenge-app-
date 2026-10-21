import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectEstimateDto {
  @ApiProperty({ description: 'Reason for rejecting the estimate' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
