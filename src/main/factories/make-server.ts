import Fastify from 'fastify';
import type { HandleHttpRequestUseCase } from '../../application/use-cases/handle-http-request.use-case.js';
import { FastifyCachingProxyServer } from '../../infra/http/fastify-caching-proxy-server.js';

export function makeServer(handleHttpRequestUseCase: HandleHttpRequestUseCase) {
  return new FastifyCachingProxyServer(
    Fastify({ logger: true }),
    handleHttpRequestUseCase,
  );
}
