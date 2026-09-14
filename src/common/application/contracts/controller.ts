import { HttpResponse } from '@/common/application/contracts/http';

export interface Controller<TRequest, TResponse> {
  handle(httpRequest: TRequest): Promise<HttpResponse<TResponse>>;
}
