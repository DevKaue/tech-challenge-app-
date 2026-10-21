import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@/access-identity/domain/enums/user-role.enum';

export class LoginSwaggerBody {
  @ApiProperty({ example: 'ana.santos@oficina.com' })
  email: string;

  @ApiProperty({ example: 'Tech@123', minLength: 8 })
  password: string;
}

export class AuthenticatedUserSwaggerResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;
}

export class LoginSwaggerResponse {
  @ApiProperty()
  access_token: string;

  @ApiProperty({ example: 'Bearer' })
  token_type: 'Bearer';

  @ApiProperty({ example: 3600 })
  expires_in: number;

  @ApiProperty({ type: AuthenticatedUserSwaggerResponse })
  user: AuthenticatedUserSwaggerResponse;
}

export class HttpErrorSwaggerResponse {
  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ example: 'Invalid credentials' })
  message: string;
}
