import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FetchHttpClient } from '../../../../src/infra/http/fetch-http-client.js';
import { HttpRequest } from '../../../../src/application/ports/http.js';

describe('FetchHttpClient', () => {
  const origin = 'http://dummyjson.com';
  let sut: FetchHttpClient;

  const mockJsonResponse = (
    body: unknown,
    init?: { statusCode?: number; headers?: Record<string, string> },
  ) => {
    const response = {
      status: init?.statusCode ?? 200,
      headers: new Headers({
        'content-type': 'application/json',
        ...init?.headers,
      }),
      json: vi.fn().mockResolvedValue(body),
      text: vi.fn(),
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));

    return response;
  };

  const mockTextResponse = (
    body: string,
    init?: { statusCode?: number; headers?: Record<string, string> },
  ) => {
    const response = {
      status: init?.statusCode ?? 200,
      headers: new Headers({
        'content-type': 'text/plain',
        ...init?.headers,
      }),
      json: vi.fn(),
      text: vi.fn().mockResolvedValue(body),
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));

    return response;
  };

  const makeRequest = (overrides?: Partial<HttpRequest>): HttpRequest => ({
    path: '/products',
    ...overrides,
  });

  beforeEach(() => {
    sut = new FetchHttpClient(origin);

    vi.restoreAllMocks();
  });

  it('should call fetch with correct products url', async () => {
    mockJsonResponse({ products: [] });

    await sut.get(makeRequest());

    expect(fetch).toHaveBeenCalledWith('http://dummyjson.com/products', {
      method: 'GET',
    });
  });

  it('should append query params to products url', async () => {
    mockJsonResponse({ products: [] });

    await sut.get(makeRequest({ query: { limit: '10', skip: '0' } }));

    expect(fetch).toHaveBeenCalledWith(
      'http://dummyjson.com/products?limit=10&skip=0',
      { method: 'GET' },
    );
  });

  it('should append array query params to url', async () => {
    mockJsonResponse({ products: [] });

    await sut.get(
      makeRequest({ query: { category: ['smartphones', 'laptops'] } }),
    );

    expect(fetch).toHaveBeenCalledWith(
      'http://dummyjson.com/products?category=smartphones&category=laptops',
      { method: 'GET' },
    );
  });

  it('should ignore undefined query params', async () => {
    mockJsonResponse({ products: [] });

    await sut.get(makeRequest({ query: { limit: undefined, skip: '0' } }));

    expect(fetch).toHaveBeenCalledWith('http://dummyjson.com/products?skip=0', {
      method: 'GET',
    });
  });

  it('should return parsed json body', async () => {
    mockJsonResponse({ products: [{ id: 1, title: 'iPhone 9' }], total: 1 });

    const response = await sut.get(makeRequest());

    expect(response).toEqual({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: { products: [{ id: 1, title: 'iPhone 9' }], total: 1 },
    });
  });

  it('should return parsed text body', async () => {
    mockTextResponse('service unavailable');

    const response = await sut.get(makeRequest());

    expect(response).toEqual({
      statusCode: 200,
      headers: { 'content-type': 'text/plain' },
      body: 'service unavailable',
    });
  });
});
