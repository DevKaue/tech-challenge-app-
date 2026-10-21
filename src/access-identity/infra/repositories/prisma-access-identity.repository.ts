import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infra/prisma/prisma.service';
import { AccessIdentityRepository } from '../../domain/contracts/access-identity-repository.interface';
import { InternalUser } from '../../domain/entities/internal-user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';

@Injectable()
export class PrismaAccessIdentityRepository implements AccessIdentityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<InternalUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return null;
    }

    return new InternalUser({ ...user, role: user.role as UserRole });
  }

  async findById(id: string): Promise<InternalUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return null;
    }

    return new InternalUser({ ...user, role: user.role as UserRole });
  }
}
