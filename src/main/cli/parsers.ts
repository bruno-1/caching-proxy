import { InvalidArgumentError } from 'commander';

export function parsePort(value: string): number {
  if (!/^\d+$/.test(value))
    throw new InvalidArgumentError(
      `Invalid port "${value}". Must be an integer.`,
    );

  const parsed = Number(value);

  if (parsed < 1 || parsed > 65535)
    throw new InvalidArgumentError(
      `Port must be between 1 and 65535. Received: ${parsed}`,
    );

  return parsed;
}

export function parseUrl(value: string): string {
  try {
    new URL(value);
    return value;
  } catch {
    throw new InvalidArgumentError(
      `Invalid URL: "${value}". Expected a valid URL.`,
    );
  }
}
