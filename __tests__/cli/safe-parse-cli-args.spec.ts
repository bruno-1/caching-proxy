import { afterEach, describe, expect, it, vi } from 'vitest';
import * as cliModule from '../../src/main/cli/cli.js';
import { safeParseCliArgs } from '../../src/main/cli/safe-parse-cli-args';
import { CommanderError } from 'commander';
import { CliParseError } from '../../src/main/cli/errors/cli-parse.error.js';

describe('safeParseCliArgs', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return result when parseCliArgs succeeds', () => {
    vi.spyOn(cliModule, 'parseCliArgs').mockReturnValue({
      type: 'clear-cache',
    });

    const result = safeParseCliArgs(['node', 'caching-proxy']);

    expect(result).toEqual({ type: 'clear-cache' });
  });

  it('should wrap CommanderError into CliParseError', () => {
    vi.spyOn(cliModule, 'parseCliArgs').mockImplementation(() => {
      throw new CommanderError(1, 'commander.error', 'Commander failure');
    });

    expect(() => safeParseCliArgs([])).toThrow(CliParseError);

    try {
      safeParseCliArgs([]);
    } catch (error) {
      expect(error).toBeInstanceOf(CliParseError);
      expect((error as Error).message).toBe('Commander failure');
    }
  });

  it('should wrap generic Error into CliParseError', () => {
    vi.spyOn(cliModule, 'parseCliArgs').mockImplementation(() => {
      throw new Error('Generic failure');
    });

    expect(() => safeParseCliArgs([])).toThrow(CliParseError);

    try {
      safeParseCliArgs([]);
    } catch (error) {
      expect((error as Error).message).toBe('Generic failure');
    }
  });

  it('should handle unknown thrown values', () => {
    vi.spyOn(cliModule, 'parseCliArgs').mockImplementation(() => {
      throw 'something weird';
    });

    expect(() => safeParseCliArgs([])).toThrow(CliParseError);

    try {
      safeParseCliArgs([]);
    } catch (error) {
      expect((error as Error).message).toBe('Unknown CLI parsing error');
    }
  });
});
