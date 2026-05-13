import type {
  HttpRequest,
  HttpResponse,
} from '../../application/ports/http.js';
import type { HttpClient } from '../../application/ports/output/http-client.js';

export class FetchHttpClient implements HttpClient {
  constructor(private readonly origin: string) {}

  async get(request: HttpRequest): Promise<HttpResponse> {
    const url = this.buildUrl(request);

    const response = await fetch(url, { method: 'GET' });

    const contentType = response.headers.get('content-type') ?? '';

    const body = await this.parseBody(response, contentType);

    return {
      statusCode: response.status,
      headers: this.normalizeHeaders(response.headers),
      body,
    };
  }

  private buildUrl(request: HttpRequest): string {
    const url = new URL(request.path, this.origin);

    if (request.query) {
      for (const [key, value] of Object.entries(request.query)) {
        if (value === undefined) continue;

        if (Array.isArray(value)) {
          value.forEach((item) => url.searchParams.append(key, item));
        } else {
          url.searchParams.append(key, value);
        }
      }
    }

    return url.toString();
  }

  private async parseBody(response: Response, contentType: string) {
    if (contentType.includes('application/json')) return response.json();

    return response.text();
  }

  private normalizeHeaders(headers: Headers) {
    return Object.fromEntries(headers.entries());
  }
}
