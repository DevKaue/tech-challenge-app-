import { ApiProperty } from '@nestjs/swagger';

export class HttpErrorSwaggerResponse {
  @ApiProperty({ description: 'Nome do erro/status', example: 'Bad Request' })
  error!: string;

  @ApiProperty({ description: 'Código do erro', example: 'error_code' })
  error_code!: string;

  @ApiProperty({
    description: 'Mensagem detalhada do erro',
    example: 'Mensagem explicativa aqui',
  })
  message!: string;
}
