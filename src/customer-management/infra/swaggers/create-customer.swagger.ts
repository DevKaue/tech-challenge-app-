import { ApiProperty } from '@nestjs/swagger';
import { CustomerResponseData } from '@/customer-management/infra/swaggers/customer.swagger';

export class CreateCustomerSwaggerResponse extends CustomerResponseData {}

export class CreateCustomerSwaggerBody {
  @ApiProperty({ example: 'CPF', description: 'Tipo de documento do cliente' })
  document_type!: string;

  @ApiProperty({ example: '10738082031' })
  document_number!: string;

  @ApiProperty({ example: 'João Silva' })
  name!: string;

  @ApiProperty({ example: '11999999999' })
  phone!: string;

  @ApiProperty({ example: 'joao@email.com' })
  email!: string;
}

export class CreateCustomerSwaggerConflictResponse {
  @ApiProperty({ example: 'Conflict' })
  error!: string;

  @ApiProperty({ example: 'customer_already_exists|customer_is_archived' })
  error_code!: string;

  @ApiProperty({
    examples: [
      'Customer with the same document already exists',
      'Customer with document is archived and must be restored.',
    ],
    description: 'Mensagem de erro dependendo do estado do cliente',
  })
  message!: string;
}
