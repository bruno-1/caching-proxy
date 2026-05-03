import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CachingProxyServer } from '../../../src/application/ports/output/caching-proxy-server.js';
import { StartServerUseCase } from '../../../src/application/use-cases/start-server.use-case.js';
import { InvalidPortError } from '../../../src/domain/errors/invalid-port.error.js';
import { InvalidOriginUrlError } from '../../../src/domain/errors/invalid-origin-url.error.js';
import { StartServerInput } from '../../../src/application/ports/input/start-server-input.js';

describe('StartServerUseCase', () => {
  let server: CachingProxyServer;
  let useCase: StartServerUseCase;

  const baseInput: StartServerInput = {
    port: 3000,
    originUrl: 'http://dummyjson.com',
  };

  const makeSut = () => {
    server = {
      start: vi.fn().mockResolvedValue(undefined),
    };

    useCase = new StartServerUseCase(server);
  };

  beforeEach(() => {
    makeSut();
  });

  const invalidCases: Array<{
    name: string;
    input: StartServerInput;
    error: new (...args: ConstructorParameters<typeof Error>) => Error;
  }> = [
    {
      name: 'port is not an integer',
      input: { ...baseInput, port: 3000.1 },
      error: InvalidPortError,
    },
    {
      name: 'port is below range',
      input: { ...baseInput, port: 0 },
      error: InvalidPortError,
    },
    {
      name: 'port is above range',
      input: { ...baseInput, port: 65536 },
      error: InvalidPortError,
    },
    {
      name: 'originUrl is invalid',
      input: { ...baseInput, originUrl: 'invalid-url' },
      error: InvalidOriginUrlError,
    },
    {
      name: 'protocol is not HTTP/HTTPS',
      input: { ...baseInput, originUrl: 'ftp://dummyjson.com' },
      error: InvalidOriginUrlError,
    },
  ];

  it('should start server with value objects', async () => {
    await useCase.execute(baseInput);

    expect(server.start).toHaveBeenCalledTimes(1);

    const [params] = vi.mocked(server.start).mock.calls[0];

    expect(params.port.value).toBe(3000);
    expect(params.originUrl.value).toBe('http://dummyjson.com/');
  });

  it.each(invalidCases)('should throw $name', async ({ input, error }) => {
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(error);
    expect(server.start).not.toHaveBeenCalled();
  });

  it('should propagate error if server fails', async () => {
    const failure = new Error('Server failed');

    server.start = vi.fn().mockRejectedValue(failure);

    await expect(useCase.execute(baseInput)).rejects.toThrow('Server failed');

    expect(server.start).toHaveBeenCalledTimes(1);
  });
});
