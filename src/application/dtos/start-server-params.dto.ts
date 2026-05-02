import type { OriginUrl } from '../../domain/value-objects/origin-url.js';
import type { Port } from '../../domain/value-objects/port.js';

export type StartServerParams = {
  port: Port;
  originUrl: OriginUrl;
};
