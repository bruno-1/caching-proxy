import type { HttpRequest, HttpResponse } from '../http.js';

export interface HttpClient {
  get(request: HttpRequest): Promise<HttpResponse>;
}
