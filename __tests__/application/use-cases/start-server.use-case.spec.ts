import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CachingProxyServer } from '../../../src/application/ports/output/caching-proxy-server.js';
import { StartServerUseCase } from '../../../src/application/use-cases/start-server.use-case.js';
import { InvalidPortError } from '../../../src/domain/errors/invalid-port.error.js';
import { InvalidOriginUrlError } from '../../../src/domain/errors/invalid-origin-url.error.js';
import { StartServerInput } from '../../../src/application/ports/input/start-server-input.js';

describe('StartServerUseCase', () => {
  let serverMock: CachingProxyServer;
  let useCase: StartServerUseCase;

  const expectFailure = async (
    input: StartServerInput,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: new (...args: any[]) => Error,
  ) => {
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(error);
    expect(serverMock.start).not.toHaveBeenCalled();
  };

  beforeEach(() => {
    serverMock = {
      start: vi.fn().mockResolvedValue(undefined),
    };

    useCase = new StartServerUseCase(serverMock);
  });

  it('should create value objects and pass them to server', async () => {
    await useCase.execute({
      port: 3000,
      originUrl: 'http://dummyjson.com',
    });

    expect(serverMock.start).toHaveBeenCalledOnce();

    const [params] = vi.mocked(serverMock.start).mock.calls[0];

    expect(params.port.value).toBe(3000);
    expect(params.originUrl.value).toBe('http://dummyjson.com/');
  });

  it('should throw error when port is not an integer', async () => {
    await expectFailure(
      { port: 3000.1, originUrl: 'http://dummyjson.com' },
      InvalidPortError,
    );
  });

  it('should throw error when port is below range', async () => {
    await expectFailure(
      { port: 0, originUrl: 'http://dummyjson.com' },
      InvalidPortError,
    );
  });

  it('should throw error when port is above range', async () => {
    await expectFailure(
      { port: 65536, originUrl: 'http://dummyjson.com' },
      InvalidPortError,
    );
  });

  it('should throw error when origin is invalid', async () => {
    await expectFailure(
      { port: 3000, originUrl: 'invalid-url' },
      InvalidOriginUrlError,
    );
  });

  it('should throw error when protocol is not HTTP/HTTPS', async () => {
    await expectFailure(
      { port: 3000, originUrl: 'ftp://dummyjson.com' },
      InvalidOriginUrlError,
    );
  });

  it('should propagate error if server fails', async () => {
    const error = new Error('Server failed');

    serverMock.start = vi.fn().mockRejectedValue(error);

    await expect(
      useCase.execute({
        port: 3000,
        originUrl: 'http://dummyjson.com',
      }),
    ).rejects.toBeInstanceOf(Error);
  });
});
