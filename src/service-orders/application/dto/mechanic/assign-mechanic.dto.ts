import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignMechanicDto {
  @ApiProperty({ description: 'Mechanic user ID' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  mechanicId: string;
}
