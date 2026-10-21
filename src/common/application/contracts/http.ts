export interface HttpRequest<
  TBody = undefined,
  TParams = undefined,
  TQuery = undefined,
> {
  body: TBody;
  params: TParams;
  query: TQuery;
}

export interface HttpResponse<T> {
  statusCode: number;
  body: T;
}
