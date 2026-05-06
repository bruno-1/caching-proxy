import { Command, InvalidArgumentError } from 'commander';
import type { CliCommand } from './types.js';
import { parsePort, parseUrl } from './parsers.js';

export function parseCliArgs(args: string[]): CliCommand {
  const program = new Command();

  let result: CliCommand | null = null;

  program
    .name('caching-proxy')
    .description('HTTP caching proxy server')
    .exitOverride();

  program
    .command('start')
    .requiredOption('--port <number>', 'port to run the server on', parsePort)
    .requiredOption('--origin <url>', 'origin server URL', parseUrl)
    .action((options) => {
      result = {
        type: 'start',
        port: options.port,
        origin: options.origin,
      };
    });

  program.command('clear-cache').action(() => {
    result = { type: 'clear-cache' };
  });

  program.parse(args);

  if (!result)
    throw new InvalidArgumentError(
      'A command is required (start | clear-cache)',
    );

  return result;
}
