import type { StartServerParams } from '../../dtos/start-server-params.dto.js';

export interface CachingProxyServer {
  start(params: StartServerParams): Promise<void>;
}
