import { InvalidOriginUrlError } from '../errors/invalid-origin-url.error.js';

export class OriginUrl {
  private constructor(private readonly _url: URL) {}

  static create(value: string): OriginUrl {
    let url: URL;

    try {
      url = new URL(value);
    } catch {
      throw new InvalidOriginUrlError('Origin URL is invalid');
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:')
      throw new InvalidOriginUrlError('Origin must use HTTP or HTTPS');

    return new OriginUrl(url);
  }

  get value(): string {
    return this._url.href;
  }
}
