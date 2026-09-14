import { UserRole } from '@/access-identity/domain/enums/user-role.enum';

export class AuthenticatedUserDto {
  id: string;

  name: string;

  email: string;

  role: UserRole;
}

export class LoginResponseDto {
  access_token: string;

  token_type: 'Bearer';

  expires_in: number;

  user: AuthenticatedUserDto;
}
