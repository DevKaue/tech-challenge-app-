import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StartDiagnosisDto {
  @ApiProperty({ description: 'Diagnostic notes from the mechanic' })
  @IsString()
  @IsNotEmpty()
  diagnosis: string;
}
