import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyReply, FastifyRequest } from 'fastify';
import { FastifyCachingProxyServer } from '../../../src/infra/http/fastify-caching-proxy-server.js';
import { HandleHttpRequestUseCase } from '../../../src/application/use-cases/handle-http-request.use-case.js';

type HandleHttpRequestUseCaseMock = {
  execute: ReturnType<typeof vi.fn>;
};

function makeHandleHttpRequestUseCaseMock() {
  return { execute: vi.fn() };
}

function makeRequest({
  url = '/products',
  query = {},
}: { url?: string; query?: Record<string, unknown> } = {}): FastifyRequest {
  return { url, query } as FastifyRequest;
}

function makeReply(): FastifyReply {
  return {
    status: vi.fn().mockReturnThis(),
    header: vi.fn(),
  } as unknown as FastifyReply;
}

function makeUseCaseResponse({
  statusCode = 200,
  headers = {},
  body = {},
}: {
  statusCode?: number;
  headers?: Record<string, string>;
  body?: unknown;
} = {}) {
  return { statusCode, headers, body };
}

describe('FastifyCachingProxyServer', () => {
  let sut: FastifyCachingProxyServer;

  let handleHttpRequestUseCaseMock: HandleHttpRequestUseCaseMock;

  beforeEach(() => {
    handleHttpRequestUseCaseMock = makeHandleHttpRequestUseCaseMock();

    sut = new FastifyCachingProxyServer(
      handleHttpRequestUseCaseMock as unknown as HandleHttpRequestUseCase,
    );
  });

  it('should execute use case with normalized request', async () => {
    handleHttpRequestUseCaseMock.execute.mockResolvedValue(
      makeUseCaseResponse(),
    );

    const request = makeRequest({
      url: '/products?page=1&tags=a&tags=b',
      query: {
        page: '1',
        tags: ['a', 'b'],
      },
    });

    const reply = makeReply();

    await sut.handleRequest(request, reply);

    expect(handleHttpRequestUseCaseMock.execute).toHaveBeenCalledWith({
      path: '/products',
      query: {
        page: '1',
        tags: ['a', 'b'],
      },
    });
  });

  it('should normalize array query params', async () => {
    handleHttpRequestUseCaseMock.execute.mockResolvedValue(
      makeUseCaseResponse(),
    );

    const request = makeRequest({
      url: '/products?ids=1&ids=2',
      query: {
        ids: [1, 2],
      },
    });

    const reply = makeReply();

    await sut.handleRequest(request, reply);

    expect(handleHttpRequestUseCaseMock.execute).toHaveBeenCalledWith({
      path: '/products',
      query: {
        ids: ['1', '2'],
      },
    });
  });

  it('should ignore unsupported query param types', async () => {
    handleHttpRequestUseCaseMock.execute.mockResolvedValue(
      makeUseCaseResponse(),
    );

    const request = makeRequest({
      url: '/products',
      query: {
        search: 'notebook',
        invalidNumber: 10,
        invalidBoolean: true,
        invalidObject: {
          foo: 'bar',
        },
      },
    });

    const reply = makeReply();

    await sut.handleRequest(request, reply);

    expect(handleHttpRequestUseCaseMock.execute).toHaveBeenCalledWith({
      path: '/products',
      query: {
        search: 'notebook',
      },
    });
  });

  it('should set response status code', async () => {
    handleHttpRequestUseCaseMock.execute.mockResolvedValue(
      makeUseCaseResponse({
        statusCode: 201,
      }),
    );

    const request = makeRequest();

    const reply = makeReply();

    await sut.handleRequest(request, reply);

    expect(reply.status).toHaveBeenCalledWith(201);
  });

  it('should set response headers', async () => {
    handleHttpRequestUseCaseMock.execute.mockResolvedValue(
      makeUseCaseResponse({
        headers: {
          'content-type': 'application/json',
          'cache-control': 'max-age=60',
        },
      }),
    );

    const request = makeRequest();

    const reply = makeReply();

    await sut.handleRequest(request, reply);

    expect(reply.header).toHaveBeenCalledWith(
      'content-type',
      'application/json',
    );

    expect(reply.header).toHaveBeenCalledWith('cache-control', 'max-age=60');
  });

  it('should return response body', async () => {
    const body = {
      products: [
        {
          id: 1,
        },
      ],
    };

    handleHttpRequestUseCaseMock.execute.mockResolvedValue(
      makeUseCaseResponse({
        body,
      }),
    );

    const request = makeRequest();

    const reply = makeReply();

    const response = await sut.handleRequest(request, reply);

    expect(response).toEqual(body);
  });
});
