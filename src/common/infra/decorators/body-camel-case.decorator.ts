import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import camelcaseKeys from 'camelcase-keys';

export const BodyCamelCase = createParamDecorator(
  async (targetDto: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const body = request.body;

    // 1. Valida se o body veio completamente vazio
    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException(
        'O corpo da requisição não pode estar vazio.',
      );
    }

    // 2. Converte as chaves do snake_case para camelCase
    const camelCasedBody = camelcaseKeys(body, { deep: true });

    // 3. Se um DTO foi passado como argumento para o decorator, valida dinamicamente
    if (targetDto) {
      // Transforma o objeto puro em uma instância da classe do DTO
      const dtoInstance = plainToInstance(targetDto, camelCasedBody);

      // Executa a validação programática (olhando propriedades da instância)
      const errors = await validate(dtoInstance);

      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      return dtoInstance;
    }

    return camelCasedBody;
  },
);
