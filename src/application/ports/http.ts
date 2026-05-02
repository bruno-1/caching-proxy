export type HttpRequest = {
  path: string;
  query?: Record<string, string | string[]>;
};

export type HttpResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
};
