import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FinishServiceOrderDto {
  @ApiPropertyOptional({
    description: 'Completion notes about the service performed',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
