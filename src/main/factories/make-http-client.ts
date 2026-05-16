import { FetchHttpClient } from '../../infra/http/fetch-http-client.js';

export function makeHttpClient(origin: string) {
  return new FetchHttpClient(origin);
}
