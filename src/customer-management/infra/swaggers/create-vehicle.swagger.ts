import { ApiProperty } from '@nestjs/swagger';
import { VehicleResponseData } from '@/customer-management/infra/swaggers/vehicle.swagger';

export class CreateVehicleSwaggerResponse extends VehicleResponseData {}

export class CreateVehicleSwaggerBody {
  @ApiProperty({
    example: 'ABC1234',
    description: 'Placa do veículo no formato brasileiro',
  })
  license_plate!: string;

  @ApiProperty({ example: 'Toyota', description: 'Marca do veículo' })
  brand!: string;

  @ApiProperty({ example: 'Corolla', description: 'Modelo do veículo' })
  model!: string;

  @ApiProperty({ example: 2023, description: 'Ano de fabricação do veículo' })
  year!: number;
}

export class CreateVehicleSwaggerConflictResponse {
  @ApiProperty({ example: 'Conflict' })
  error!: string;

  @ApiProperty({ example: 'vehicle_already_exists' })
  error_code!: string;

  @ApiProperty({ example: 'Vehicle with this license plate already exists' })
  message!: string;
}
