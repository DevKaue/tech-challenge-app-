import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateMechanicAvailabilityDto {
  @ApiProperty({ description: 'Mechanic availability status' })
  @IsBoolean()
  @IsNotEmpty()
  available: boolean;
}
