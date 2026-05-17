import {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from 'fastify';
import type { CachingProxyServer } from '../../application/ports/output/caching-proxy-server.js';
import type { HandleHttpRequestUseCase } from '../../application/use-cases/handle-http-request.use-case.js';

export class FastifyCachingProxyServer implements CachingProxyServer {
  constructor(
    private readonly app: FastifyInstance,
    private readonly handleHttpRequestUseCase: HandleHttpRequestUseCase,
  ) {}

  async start(port: number) {
    this.app.get('/*', this.handleRequest);

    await this.app.listen({ port });

    this.app.log.info(`Caching proxy running on port ${port}`);
  }

  handleRequest = async (request: FastifyRequest, reply: FastifyReply) => {
    const response = await this.handleHttpRequestUseCase.execute({
      path: request.url.split('?')[0] ?? '/',
      query: this.normalizeQuery(request.query as Record<string, unknown>),
    });

    reply.status(response.statusCode);

    for (const [key, value] of Object.entries(response.headers)) {
      reply.header(key, value);
    }

    return response.body;
  };

  private normalizeQuery(
    query: Record<string, unknown>,
  ): Record<string, string | string[] | undefined> {
    const normalized: Record<string, string | string[] | undefined> = {};

    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'string') {
        normalized[key] = value;
        continue;
      }

      if (Array.isArray(value)) normalized[key] = value.map(String);
    }

    return normalized;
  }
}
