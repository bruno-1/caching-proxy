import { describe, expect, it } from 'vitest';
import { safeParseCliArgs } from '../../src/main/cli/safe-parse-cli-args.js';
import { CliParseError } from '../../src/main/cli/errors/cli-parse.error.js';

describe('CLI - parseCliArgs', () => {
  const baseArgs = ['node', 'caching-proxy'];

  describe('start command', () => {
    it('should parse valid start command', () => {
      const result = safeParseCliArgs([
        ...baseArgs,
        'start',
        '--port',
        '3000',
        '--origin',
        'http://dummyjson.com',
      ]);

      expect(result).toEqual({
        type: 'start',
        port: 3000,
        origin: 'http://dummyjson.com',
      });
    });

    it('should throw if port is missing', () => {
      expect(() =>
        safeParseCliArgs([
          ...baseArgs,
          'start',
          '--origin',
          'http://dummyjson.com',
        ]),
      ).toThrow(CliParseError);
    });

    it('should throw if origin is missing', () => {
      expect(() =>
        safeParseCliArgs([...baseArgs, 'start', '--port', '3000']),
      ).toThrow(CliParseError);
    });

    it('should throw for invalid port (non-numeric)', () => {
      expect(() =>
        safeParseCliArgs([
          ...baseArgs,
          'start',
          '--port',
          'abc',
          '--origin',
          'http://dummyjson.com',
        ]),
      ).toThrow(CliParseError);
    });

    it('should throw for invalid port (out of range)', () => {
      expect(() =>
        safeParseCliArgs([
          ...baseArgs,
          'start',
          '--port',
          '70000',
          '--origin',
          'http://dummyjson.com',
        ]),
      ).toThrow(CliParseError);
    });

    it('should throw for invalid URL', () => {
      expect(() =>
        safeParseCliArgs([
          ...baseArgs,
          'start',
          '--port',
          '3000',
          '--origin',
          'invalid-url',
        ]),
      ).toThrow(CliParseError);
    });
  });

  describe('clear-cachce command', () => {
    it('should parse clear-cache command', () => {
      const result = safeParseCliArgs([...baseArgs, 'clear-cache']);

      expect(result).toEqual({ type: 'clear-cache' });
    });
  });

  describe('invalid usage', () => {
    it('should throw when no command is provided', () => {
      expect(() => safeParseCliArgs(baseArgs)).toThrow(CliParseError);
    });

    it('should throw for unknown command', () => {
      expect(() => safeParseCliArgs([...baseArgs, 'unknown-command'])).toThrow(
        CliParseError,
      );
    });
  });
});
