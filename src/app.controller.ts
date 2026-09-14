import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Liveness probe — não verifica dependências' })
  health() {
    return this.appService.health();
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe — verifica conectividade com o banco',
  })
  @ApiResponse({ status: 503, description: 'Banco de dados inacessível' })
  readiness() {
    return this.appService.readiness();
  }
}
