import Fastify from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FastifyCachingProxyServer } from '../../../../src/infra/http/fastify-caching-proxy-server.js';

const appMock = {
  get: vi.fn(),
  listen: vi.fn(),
  log: { info: vi.fn() },
};

vi.mock('fastify', () => ({
  default: vi.fn(() => appMock),
}));

function makeSut() {
  const handleHttpRequestUseCase = {
    execute: vi.fn(),
  };

  const sut = new FastifyCachingProxyServer(
    Fastify({ logger: true }),
    handleHttpRequestUseCase as never,
  );

  return {
    sut,
    handleHttpRequestUseCase,
  };
}

describe('FastifyCachingProxyServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('start', () => {
    it('should create fastify app with logger enabled', async () => {
      const { sut } = makeSut();
      await sut.start(3000);

      expect(Fastify).toHaveBeenCalledWith({ logger: true });
    });

    it('should register GET route', async () => {
      const { sut } = makeSut();
      await sut.start(3000);

      expect(appMock.get).toHaveBeenCalledWith('/*', sut.handleRequest);
    });

    it('should start listening on provided port', async () => {
      const { sut } = makeSut();
      await sut.start(3000);

      expect(appMock.listen).toHaveBeenCalledWith({ port: 3000 });
    });

    it('should log startup message', async () => {
      const { sut } = makeSut();
      await sut.start(3000);

      expect(appMock.log.info).toHaveBeenCalledWith(
        'Caching proxy running on port 3000',
      );
    });
  });

  describe('handleRequest', () => {
    it('should execute handle http request use case', async () => {
      const response = {
        statusCode: 200,
        headers: {
          'content-type': 'application/json',
        },
        body: {
          ok: true,
        },
      };

      const handleHttpRequestUseCase = {
        execute: vi.fn().mockResolvedValue(response),
      };
      const sut = new FastifyCachingProxyServer(
        Fastify(),
        handleHttpRequestUseCase as never,
      );

      const request = {
        url: '/products?page=1',
        query: {
          page: '1',
        },
      };

      const reply = {
        status: vi.fn().mockReturnThis(),
        header: vi.fn(),
      };

      await sut.handleRequest(request as never, reply as never);

      expect(handleHttpRequestUseCase.execute).toHaveBeenCalledWith({
        path: '/products',
        query: {
          page: '1',
        },
      });
    });

    it('should set response status', async () => {
      const response = {
        statusCode: 201,
        headers: {},
        body: {},
      };

      const handleHttpRequestUseCase = {
        execute: vi.fn().mockResolvedValue(response),
      };
      const sut = new FastifyCachingProxyServer(
        Fastify(),
        handleHttpRequestUseCase as never,
      );

      const request = {
        url: '/',
        query: {},
      };

      const reply = {
        status: vi.fn().mockReturnThis(),
        header: vi.fn(),
      };

      await sut.handleRequest(request as never, reply as never);

      expect(reply.status).toHaveBeenCalledWith(201);
    });

    it('should set response headers', async () => {
      const response = {
        statusCode: 200,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'public',
        },
        body: {},
      };

      const handleHttpRequestUseCase = {
        execute: vi.fn().mockResolvedValue(response),
      };
      const sut = new FastifyCachingProxyServer(
        Fastify(),
        handleHttpRequestUseCase as never,
      );

      const request = {
        url: '/',
        query: {},
      };

      const reply = {
        status: vi.fn().mockReturnThis(),
        header: vi.fn(),
      };

      await sut.handleRequest(request as never, reply as never);

      expect(reply.header).toHaveBeenCalledWith(
        'content-type',
        'application/json',
      );

      expect(reply.header).toHaveBeenCalledWith('cache-control', 'public');
    });

    it('should return response body', async () => {
      const response = {
        statusCode: 200,
        headers: {},
        body: {
          success: true,
        },
      };

      const handleHttpRequestUseCase = {
        execute: vi.fn().mockResolvedValue(response),
      };
      const sut = new FastifyCachingProxyServer(
        Fastify(),
        handleHttpRequestUseCase as never,
      );

      const request = {
        url: '/',
        query: {},
      };

      const reply = {
        status: vi.fn().mockReturnThis(),
        header: vi.fn(),
      };

      const result = await sut.handleRequest(request as never, reply as never);

      expect(result).toEqual({ success: true });
    });

    it('should normalize array query params', async () => {
      const response = {
        statusCode: 200,
        headers: {},
        body: {},
      };

      const handleHttpRequestUseCase = {
        execute: vi.fn().mockResolvedValue(response),
      };
      const sut = new FastifyCachingProxyServer(
        Fastify(),
        handleHttpRequestUseCase as never,
      );

      const request = {
        url: '/products',
        query: {
          category: ['books', 'games'],
        },
      };

      const reply = {
        status: vi.fn().mockReturnThis(),
        header: vi.fn(),
      };

      await sut.handleRequest(request as never, reply as never);

      expect(handleHttpRequestUseCase.execute).toHaveBeenCalledWith({
        path: '/products',
        query: {
          category: ['books', 'games'],
        },
      });
    });

    it('should ignore unsupported query param types', async () => {
      const response = {
        statusCode: 200,
        headers: {},
        body: {},
      };

      const handleHttpRequestUseCase = {
        execute: vi.fn().mockResolvedValue(response),
      };
      const sut = new FastifyCachingProxyServer(
        Fastify({ logger: true }),
        handleHttpRequestUseCase as never,
      );

      const request = {
        url: '/products',
        query: {
          page: 1,
          active: true,
          category: 'books',
        },
      };

      const reply = {
        status: vi.fn().mockReturnThis(),
        header: vi.fn(),
      };

      await sut.handleRequest(request as never, reply as never);

      expect(handleHttpRequestUseCase.execute).toHaveBeenCalledWith({
        path: '/products',
        query: {
          category: 'books',
        },
      });
    });
  });
});
