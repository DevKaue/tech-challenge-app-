import { ApiProperty } from '@nestjs/swagger';
import { VehicleResponseData } from '@/customer-management/infra/swaggers/vehicle.swagger';

export class UpdateVehicleSwaggerResponse extends VehicleResponseData {}

export class UpdateVehicleSwaggerBody {
  @ApiProperty({
    example: 'XYZ6789',
    description: 'Placa do veículo no formato brasileiro',
  })
  license_plate?: string;

  @ApiProperty({ example: 'Chevrolet', description: 'Marca do veículo' })
  brand?: string;

  @ApiProperty({ example: 'Onix', description: 'Modelo do veículo' })
  model?: string;

  @ApiProperty({ example: 2022, description: 'Ano de fabricação do veículo' })
  year?: number;
}

export class UpdateVehicleSwaggerConflictResponse {
  @ApiProperty({ example: 'Conflict' })
  error!: string;

  @ApiProperty({ example: 'vehicle_already_exists' })
  error_code!: string;

  @ApiProperty({ example: 'Vehicle with this license plate already exists' })
  message!: string;
}
