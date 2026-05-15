import type { StartServerInput } from '../ports/input/start-server-input.js';
import type { CachingProxyServer } from '../ports/output/caching-proxy-server.js';
import { Port } from '../../domain/value-objects/port.js';
import { OriginUrl } from '../../domain/value-objects/origin-url.js';

export class StartServerUseCase {
  constructor(private readonly server: CachingProxyServer) {}

  async execute(input: StartServerInput): Promise<void> {
    const port = Port.create(input.port);
    OriginUrl.create(input.originUrl);

    await this.server.start(port.value);
  }
}
