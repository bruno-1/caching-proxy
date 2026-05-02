import type { StartServerParams } from '../../use-cases/dtos/start-server-params.dto.js';

export interface CachingProxyServer {
  start(params: StartServerParams): Promise<void>;
}
