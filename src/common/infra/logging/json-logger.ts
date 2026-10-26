import type { LoggerService, LogLevel } from '@nestjs/common';
import { currentRequestContext } from './request-context';

type LinkingAgent = {
  getLinkingMetadata(): Record<string, string | undefined>;
};

let agent: LinkingAgent | null | undefined;

/**
 * O agente do New Relic é carregado por `NODE_OPTIONS=-r newrelic` no
 * overlay aws. Aqui só pegamos a instância já carregada, para pôr `trace.id`
 * e `span.id` em cada linha: é o que liga o log ao trace na tela do APM.
 * Fora do cluster (local, testes) o agente não está ligado e nada muda.
 */
function newRelic(): LinkingAgent | null {
  if (agent !== undefined) return agent;
  if (process.env.NEW_RELIC_ENABLED !== 'true') {
    agent = null;
    return agent;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    agent = require('newrelic') as LinkingAgent;
  } catch {
    agent = null;
  }
  return agent;
}

function traceFields(): Record<string, string> {
  const metadata = newRelic()?.getLinkingMetadata();
  if (!metadata) return {};
  const fields: Record<string, string> = {};
  if (metadata['trace.id']) fields['trace.id'] = metadata['trace.id'];
  if (metadata['span.id']) fields['span.id'] = metadata['span.id'];
  return fields;
}

/**
 * Logger do Nest que escreve uma linha JSON por evento no stdout. O Fluent Bit
 * do New Relic lê o stdout do container e o parser do values-nri-bundle.yaml
 * sobe cada chave para atributo, então `event`, `route`, `statusCode` e
 * `durationMs` viram colunas consultáveis em NRQL.
 *
 * Mensagem objeto (`logger.log({ event: 'x', ... })`) é espalhada no topo da
 * linha; mensagem texto vai em `message`. Campos fixos: timestamp, level,
 * service, environment, context e, dentro de uma requisição, correlationId.
 */
export class JsonLogger implements LoggerService {
  private readonly service = process.env.SERVICE_NAME ?? 'techchallenge-api';
  private readonly environment = process.env.APP_ENV ?? 'local';

  constructor(
    private readonly write: (line: string) => void = (line) =>
      process.stdout.write(line),
  ) {}

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.print('info', message, optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.print('warn', message, optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.print('debug', message, optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.print('verbose', message, optionalParams);
  }

  fatal(message: unknown, ...optionalParams: unknown[]): void {
    this.print('fatal', message, optionalParams);
  }

  /** O Nest chama `error(message, stack?, context?)`. */
  error(message: unknown, ...optionalParams: unknown[]): void {
    const params = [...optionalParams];
    const context =
      params.length > 0 && typeof params[params.length - 1] === 'string'
        ? (params.pop() as string)
        : undefined;
    const stack = params.find(
      (p): p is string => typeof p === 'string' && p.includes('\n'),
    );
    this.print('error', message, context ? [context] : [], stack);
  }

  setLogLevels?(levels: LogLevel[]): void {
    this.levels = new Set(levels);
  }

  private levels: Set<LogLevel> | null = null;

  private print(
    level: LogLevel | 'info',
    message: unknown,
    optionalParams: unknown[],
    stack?: string,
  ): void {
    const nestLevel: LogLevel = level === 'info' ? 'log' : level;
    if (this.levels && !this.levels.has(nestLevel)) return;

    const last = optionalParams[optionalParams.length - 1];
    const context = typeof last === 'string' ? last : undefined;

    const body =
      message !== null &&
      typeof message === 'object' &&
      !(message instanceof Error)
        ? (message as Record<string, unknown>)
        : {
            message:
              message instanceof Error ? message.message : String(message),
          };

    const entry: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      environment: this.environment,
      ...(context ? { context } : {}),
      ...body,
    };

    const correlationId = currentRequestContext()?.correlationId;
    if (correlationId) entry.correlationId = correlationId;
    Object.assign(entry, traceFields());

    if (stack) entry.stack = stack;
    if (message instanceof Error && message.stack) entry.stack = message.stack;

    this.write(`${JSON.stringify(entry)}\n`);
  }
}
