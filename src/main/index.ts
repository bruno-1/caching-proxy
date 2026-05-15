import { ClearCacheUseCase } from '../application/use-cases/clear-cache.use-case.js';
import { StartServerUseCase } from '../application/use-cases/start-server.use-case.js';
import { safeParseCliArgs } from './cli/safe-parse-cli-args.js';
import { makeCache } from './factories/make-cache.js';
import { makeHandleHttpRequestUseCase } from './factories/make-handle-http-request-use-case.js';
import { makeServer } from './factories/make-server.js';

async function bootstrap(): Promise<void> {
  try {
    console.log('starting application...');

    const command = safeParseCliArgs(process.argv);
    const { cache, redisClient } = await makeCache();

    if (command.type === 'clear-cache') {
      const clearCacheUseCase = new ClearCacheUseCase(cache);
      await clearCacheUseCase.execute();

      console.log('cache cleared successfully');

      await redisClient.quit();
      return;
    }

    const handleHttpRequestUseCase = makeHandleHttpRequestUseCase(
      cache,
      command.origin,
    );
    const server = makeServer(handleHttpRequestUseCase);
    const startServerUseCase = new StartServerUseCase(server);

    await startServerUseCase.execute({
      port: command.port,
      originUrl: command.origin,
    });

    console.log('started successfully');
  } catch (error) {
    console.error('fatal error:', error);
    process.exit(1);
  }
}

void bootstrap();
