import { ApiProperty } from '@nestjs/swagger';

export class VehicleResponseData {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do veículo',
  })
  id!: string;

  @ApiProperty({ example: 'ABC1234', description: 'Placa do veículo' })
  license_plate!: string;

  @ApiProperty({ example: 'Toyota' })
  brand!: string;

  @ApiProperty({ example: 'Corolla' })
  model!: string;

  @ApiProperty({ example: 2023 })
  year!: number;

  @ApiProperty({ example: '2026-06-21T15:00:00.000Z' })
  created_at!: string;

  @ApiProperty({ example: '2026-06-21T15:00:00.000Z' })
  updated_at!: string;
}

export class VehicleNotFoundSwaggerResponse {
  @ApiProperty({ example: 'Vehicle Not Found' })
  error!: string;

  @ApiProperty({ example: 'vehicle_not_found' })
  error_code!: string;

  @ApiProperty({ example: 'Vehicle Not Found' })
  message!: string;
}
