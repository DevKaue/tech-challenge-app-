import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseData {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do cliente',
  })
  id!: string;

  @ApiProperty({ example: 'CPF' })
  document_type!: string;

  @ApiProperty({ example: '10738082031' })
  document_number!: string;

  @ApiProperty({ example: 'João Silva' })
  name!: string;

  @ApiProperty({ example: '11999999999' })
  phone!: string;

  @ApiProperty({ example: 'joao@email.com' })
  email!: string;

  @ApiProperty({ example: '2026-03-21T15:00:00.000Z' })
  created_at!: string;
}

export class CustomerNotFoundSwaggerResponse {
  @ApiProperty({ example: 'Customer Not Found' })
  error!: string;

  @ApiProperty({ example: 'customer_not_found' })
  error_code!: string;

  @ApiProperty({ example: 'Customer Not Found' })
  message!: string;
}
