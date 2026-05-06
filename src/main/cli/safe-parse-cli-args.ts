import { CommanderError } from 'commander';
import { parseCliArgs } from './cli.js';
import type { CliCommand } from './types.js';
import { CliParseError } from './errors/cli-parse.error.js';

export function safeParseCliArgs(args: string[]): CliCommand {
  try {
    return parseCliArgs(args);
  } catch (error) {
    if (error instanceof CommanderError) throw new CliParseError(error.message);
    if (error instanceof Error) throw new CliParseError(error.message);

    throw new CliParseError('Unknown CLI parsing error');
  }
}
