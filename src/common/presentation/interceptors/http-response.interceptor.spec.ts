import { CallHandler, ExecutionContext } from '@nestjs/common';
import { firstValueFrom, of } from 'rxjs';
import { HttpResponseInterceptor } from '@/common/presentation/interceptors/http-response.interceptor';

describe('HttpResponseInterceptor', () => {
  const interceptor = new HttpResponseInterceptor();
  let status: jest.Mock;

  const contextFor = (type: string): ExecutionContext => {
    status = jest.fn();

    return {
      getType: () => type,
      switchToHttp: () => ({ getResponse: () => ({ status }) }),
    } as unknown as ExecutionContext;
  };

  const handlerFor = (value: unknown): CallHandler =>
    ({ handle: () => of(value) }) as CallHandler;

  it('aplica o statusCode e desembrulha o body', async () => {
    // Arrange
    const context = contextFor('http');
    const handler = handlerFor({ statusCode: 201, body: { id: 'c-1' } });

    // Act
    const result = await firstValueFrom(
      interceptor.intercept(context, handler),
    );

    // Assert
    expect(status).toHaveBeenCalledWith(201);
    expect(result).toEqual({ id: 'c-1' });
  });

  it('preserva um body undefined, mantendo respostas sem conteudo', async () => {
    // Arrange
    const context = contextFor('http');
    const handler = handlerFor({ statusCode: 204, body: undefined });

    // Act
    const result = await firstValueFrom(
      interceptor.intercept(context, handler),
    );

    // Assert
    expect(status).toHaveBeenCalledWith(204);
    expect(result).toBeUndefined();
  });

  it('nao toca em valores que nao sao HttpResponse', async () => {
    // Arrange
    const context = contextFor('http');
    const handler = handlerFor({ id: 'c-1' });

    // Act
    const result = await firstValueFrom(
      interceptor.intercept(context, handler),
    );

    // Assert
    expect(status).not.toHaveBeenCalled();
    expect(result).toEqual({ id: 'c-1' });
  });

  it('ignora execucoes que nao sao HTTP', async () => {
    // Arrange
    const context = contextFor('rpc');
    const envelope = { statusCode: 200, body: { id: 'c-1' } };

    // Act
    const result = await firstValueFrom(
      interceptor.intercept(context, handlerFor(envelope)),
    );

    // Assert
    expect(status).not.toHaveBeenCalled();
    expect(result).toBe(envelope);
  });
});
