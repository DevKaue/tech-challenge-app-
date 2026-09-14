import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';

type NestRouteInput<TBody, TParams, TQuery> = {
  body: TBody;
  params: TParams;
  query: TQuery;
};

export async function adaptNestRoute<TBody, TParams, TQuery, TResponse>(
  controller: Controller<HttpRequest<TBody, TParams, TQuery>, TResponse>,
  input: NestRouteInput<TBody, TParams, TQuery>,
): Promise<HttpResponse<TResponse>> {
  const httpRequest: HttpRequest<TBody, TParams, TQuery> = {
    body: input.body,
    params: input.params,
    query: input.query,
  };

  return controller.handle(httpRequest);
}
