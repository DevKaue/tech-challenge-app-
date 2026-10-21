import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '@common/infra/prisma/prisma.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Liveness: "o processo está vivo?". NÃO toca em dependência externa de
   * propósito — se o banco cair, o Kubernetes não deve reiniciar todos os pods
   * em cascata; eles devem continuar de pé e se recuperar quando o banco voltar.
   */
  health() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness: "este pod consegue atender agora?". Aqui a dependência é
   * verificada — um pod sem banco sai dos endpoints do Service em vez de
   * receber tráfego que vai falhar.
   */
  async readiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.error('Readiness falhou: banco inacessível', error as Error);
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'down',
      });
    }

    return {
      status: 'ok',
      database: 'up',
      timestamp: new Date().toISOString(),
    };
  }
}
