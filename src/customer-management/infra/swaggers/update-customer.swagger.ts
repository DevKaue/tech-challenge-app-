import { ApiProperty } from '@nestjs/swagger';
import { CustomerResponseData } from '@/customer-management/infra/swaggers/customer.swagger';

export class UpdateCustomerSwaggerResponse extends CustomerResponseData {}

export class UpdateCustomerSwaggerBody {
  @ApiProperty({ example: 'João Silva', required: false })
  name?: string;

  @ApiProperty({ example: '11999999999', required: false })
  phone?: string;

  @ApiProperty({ example: 'joao@email.com', required: false })
  email?: string;
}
